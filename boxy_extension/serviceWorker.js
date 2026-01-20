// BOXY Service Worker
// Handles Notion API, context menus, and message routing

// ============================================
// NOTION API CLIENT
// ============================================

async function getConfig() {
  const result = await chrome.storage.sync.get('boxy_config');
  return result.boxy_config || null;
}

async function notionRequest(endpoint, method, body) {
  const config = await getConfig();
  if (!config || !config.notion_api_key) {
    throw new Error('BOXY not configured. Open extension options to set up.');
  }

  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${config.notion_api_key}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Notion API error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// FLOW & SPARK CREATION
// ============================================

async function createFlowItem({ title, url, myTake, energy, classification, summary, lenses }) {
  const config = await getConfig();
  if (!config?.databases?.flow) {
    throw new Error('Flow database not configured');
  }

  const properties = {
    'Name': {
      title: [{ text: { content: title || 'Untitled' } }]
    },
    'URL': {
      url: url || null
    },
    'My Take': {
      rich_text: [{ text: { content: myTake || '' } }]
    },
    'Energy': {
      select: { name: energy || 'warm' }
    },
    'Classification': {
      select: { name: classification || 'article' }
    },
    'Status': {
      select: { name: 'new' }
    },
    'Date Saved': {
      date: { start: new Date().toISOString().split('T')[0] }
    }
  };

  // Add summary if provided
  if (summary) {
    properties['Summary'] = {
      rich_text: [{ text: { content: summary } }]
    };
  }

  // Add lenses relations if provided
  if (lenses && lenses.length > 0) {
    properties['Lenses'] = {
      relation: lenses.map(id => ({ id }))
    };
  }

  const result = await notionRequest('/pages', 'POST', {
    parent: { database_id: config.databases.flow },
    properties
  });

  // Handle source tracking if configured (pass config to avoid redundant read)
  if (config.databases?.sources && url) {
    try {
      await handleSourceTracking(url, config.databases.sources, config);
    } catch (e) {
      console.log('Source tracking failed:', e);
    }
  }

  return result;
}

async function createSpark({ text, type, energy, sourceUrl, lenses }) {
  const config = await getConfig();
  if (!config?.databases?.sparks) {
    throw new Error('Sparks database not configured');
  }

  const properties = {
    'Spark': {
      title: [{ text: { content: text || '' } }]
    },
    'Type': {
      select: { name: type || 'quote' }
    },
    'Energy': {
      select: { name: energy || 'warm' }
    }
  };

  // Add lenses relations if provided
  if (lenses && lenses.length > 0) {
    properties['Lenses'] = {
      relation: lenses.map(id => ({ id }))
    };
  }

  // Add source URL as page content if provided
  const children = sourceUrl ? [
    {
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { text: { content: 'Source: ' } },
          {
            text: { content: sourceUrl, link: { url: sourceUrl } }
          }
        ]
      }
    }
  ] : [];

  return notionRequest('/pages', 'POST', {
    parent: { database_id: config.databases.sparks },
    properties,
    children
  });
}

async function testConnection() {
  const config = await getConfig();
  if (!config?.notion_api_key) {
    return { success: false, error: 'No API key configured' };
  }

  try {
    // Test by fetching user info
    await notionRequest('/users/me', 'GET');

    // Optionally test database access
    const tests = [];
    if (config.databases?.flow) {
      tests.push(notionRequest(`/databases/${config.databases.flow}`, 'GET'));
    }
    if (config.databases?.sparks) {
      tests.push(notionRequest(`/databases/${config.databases.sparks}`, 'GET'));
    }

    await Promise.all(tests);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// LENSES, DUPLICATES, SUMMARIES, SOURCES
// ============================================

const LENS_CACHE_TTL = 300000; // 5 minutes

async function fetchLenses(forceRefresh = false) {
  const config = await getConfig();
  if (!config?.databases?.lenses) {
    return [];
  }

  // Check cache first (with TTL)
  if (!forceRefresh) {
    const cached = await chrome.storage.local.get(['cachedLenses', 'lensesCachedAt']);
    const age = Date.now() - (cached.lensesCachedAt || 0);
    if (cached.cachedLenses && age < LENS_CACHE_TTL) {
      return cached.cachedLenses;
    }
  }

  try {
    const result = await notionRequest(`/databases/${config.databases.lenses}/query`, 'POST', {
      filter: {
        property: 'Status',
        select: { equals: 'active' }
      },
      sorts: [{ property: 'Lens', direction: 'ascending' }],
      page_size: 100
    });

    const lenses = result.results.map(page => ({
      id: page.id,
      name: page.properties.Lens?.title?.[0]?.plain_text || 'Unnamed'
    }));

    // Cache lenses with timestamp
    await chrome.storage.local.set({
      cachedLenses: lenses,
      lensesCachedAt: Date.now()
    });

    return lenses;
  } catch (error) {
    console.error('Fetch lenses error:', error);
    // Try to return cached lenses on error (ignore TTL for fallback)
    const cached = await chrome.storage.local.get('cachedLenses');
    return cached.cachedLenses || [];
  }
}

async function checkDuplicate(url) {
  const config = await getConfig();
  if (!config?.databases?.flow) {
    return false;
  }

  try {
    const result = await notionRequest(`/databases/${config.databases.flow}/query`, 'POST', {
      filter: {
        property: 'URL',
        url: { equals: url }
      },
      page_size: 1
    });

    return result.results && result.results.length > 0;
  } catch (error) {
    console.log('Duplicate check error:', error);
    return false;
  }
}

function generateSummary(content) {
  if (!content) return '';

  // Simple extractive summary: get first few sentences
  const sentences = content
    .replace(/\s+/g, ' ')
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 20)
    .slice(0, 3)
    .map(s => s.trim());

  if (sentences.length === 0) {
    return '';
  }

  return sentences.join('. ') + '.';
}

function detectClassification(url) {
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('vimeo.com')) return 'video';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'thread';
  if (u.includes('spotify.com/episode') || u.includes('podcast')) return 'podcast';
  if (u.includes('arxiv.org') || u.includes('.pdf')) return 'paper';
  return 'article';
}

async function handleSourceTracking(url, sourcesDbId, config) {
  try {
    const domain = new URL(url).hostname.replace('www.', '');

    // Check if source exists
    const existing = await notionRequest(`/databases/${sourcesDbId}/query`, 'POST', {
      filter: {
        property: 'URL',
        url: { contains: domain }
      },
      page_size: 1
    });

    if (existing.results.length === 0) {
      // Create new source
      await notionRequest('/pages', 'POST', {
        parent: { database_id: sourcesDbId },
        properties: {
          'Name': {
            title: [{ text: { content: domain } }]
          },
          'URL': {
            url: `https://${domain}`
          },
          'Type': {
            select: { name: 'publication' }
          },
          'Signal Quality': {
            select: { name: 'silver' }
          }
        }
      });
    }
  } catch (error) {
    console.log('Source tracking error:', error);
  }
}

// ============================================
// CONTEXT MENU
// ============================================

chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for selected text
  chrome.contextMenus.create({
    id: 'boxy-save-spark',
    title: 'BOXY: Save as Spark',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'boxy-save-spark' && info.selectionText) {
    // Send message to content script to show modal in Spark mode
    chrome.tabs.sendMessage(tab.id, {
      action: 'showModal',
      mode: 'spark',
      data: {
        text: info.selectionText,
        sourceUrl: info.pageUrl
      }
    });
  }
});

// ============================================
// EXTENSION ICON CLICK
// ============================================

chrome.action.onClicked.addListener(async (tab) => {
  // Inject content script if not already present, then show modal
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
  } catch {
    // Content script not loaded, inject it
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/content.js']
    });
  }

  // Get page metadata from content script
  chrome.tabs.sendMessage(tab.id, {
    action: 'showModal',
    mode: 'flow'
  });
});

// ============================================
// MESSAGE HANDLING
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Helper for async handlers with error boundaries
  const handleAsync = async (fn) => {
    try {
      const result = await fn();
      sendResponse(result);
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  };

  if (message.action === 'saveToFlow') {
    handleAsync(async () => {
      const result = await createFlowItem(message.data);
      return { success: true, result };
    });
    return true;
  }

  if (message.action === 'saveSpark') {
    handleAsync(async () => {
      const result = await createSpark(message.data);
      return { success: true, result };
    });
    return true;
  }

  if (message.action === 'testConnection') {
    handleAsync(testConnection);
    return true;
  }

  if (message.action === 'getConfig') {
    handleAsync(async () => ({ config: await getConfig() }));
    return true;
  }

  if (message.action === 'fetchLenses') {
    handleAsync(async () => {
      const lenses = await fetchLenses();
      return { lenses };
    });
    return true;
  }

  if (message.action === 'checkDuplicate') {
    handleAsync(async () => {
      const isDuplicate = await checkDuplicate(message.url);
      return { isDuplicate };
    });
    return true;
  }

  if (message.action === 'generateSummary') {
    const summary = generateSummary(message.content);
    sendResponse({ summary });
    return false;
  }

  if (message.action === 'detectClassification') {
    const classification = detectClassification(message.url);
    sendResponse({ classification });
    return false;
  }
});
