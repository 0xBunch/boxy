// BOXY Chrome Extension - Background Service Worker

// Notion API base URL
const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('BOXY extension installed');
  setupContextMenus();
});

// Setup context menus
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'save-to-flow',
      title: 'Save page to BOXY Flow',
      contexts: ['page'],
    });

    chrome.contextMenus.create({
      id: 'save-as-spark',
      title: 'Save selection as BOXY Spark',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      id: 'save-link-to-flow',
      title: 'Save link to BOXY Flow',
      contexts: ['link'],
    });

    chrome.contextMenus.create({
      id: 'save-image-to-flow',
      title: 'Save image to BOXY Flow',
      contexts: ['image'],
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'save-to-flow':
      chrome.action.openPopup();
      break;
    case 'save-as-spark':
      handleQuickSpark(info.selectionText, tab);
      break;
    case 'save-link-to-flow':
      handleSaveLinkToFlow(info.linkUrl, tab);
      break;
    case 'save-image-to-flow':
      handleSaveImageToFlow(info.srcUrl, tab);
      break;
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'save-spark') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' }, (response) => {
        if (response?.text) {
          handleQuickSpark(response.text, tab);
        }
      });
    });
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle async responses
  (async () => {
    try {
      switch (message.action) {
        case 'saveToFlow':
          const flowResult = await saveToFlow(message.data);
          sendResponse(flowResult);
          break;

        case 'saveSpark':
          const sparkResult = await saveSpark(message.data);
          sendResponse(sparkResult);
          break;

        case 'generateSummary':
          const summary = await generateSummary(message.content, message.title);
          sendResponse({ summary });
          break;

        case 'checkDuplicate':
          const isDuplicate = await checkDuplicate(message.url, message.databaseId);
          sendResponse({ isDuplicate });
          break;

        case 'fetchLenses':
          const lenses = await fetchLenses();
          sendResponse({ lenses });
          break;

        case 'testConnection':
          const connectionOk = await testNotionConnection();
          sendResponse({ success: connectionOk });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Message handler error:', error);
      sendResponse({ error: error.message });
    }
  })();

  return true; // Keep channel open for async response
});

// Get config from storage
async function getConfig() {
  const result = await chrome.storage.sync.get(['config']);
  return result.config || null;
}

// Make Notion API request
async function notionRequest(endpoint, method = 'GET', body = null) {
  const config = await getConfig();

  if (!config?.notionApiKey) {
    throw new Error('Notion API key not configured');
  }

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${config.notionApiKey}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${NOTION_API_BASE}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Notion API error: ${response.status}`);
  }

  return response.json();
}

// Save to Flow database
async function saveToFlow(data) {
  const config = await getConfig();

  if (!config?.databases?.flow) {
    throw new Error('Flow database not configured');
  }

  // Build properties
  const properties = {
    'Name': {
      title: [{ text: { content: data.title || 'Untitled' } }]
    },
    'URL': {
      url: data.url
    },
    'Status': {
      select: { name: 'new' }
    },
    'Date Saved': {
      date: { start: new Date().toISOString().split('T')[0] }
    }
  };

  // Add optional properties
  if (data.summary) {
    properties['Summary'] = {
      rich_text: [{ text: { content: data.summary } }]
    };
  }

  if (data.myTake) {
    properties['My Take'] = {
      rich_text: [{ text: { content: data.myTake } }]
    };
  }

  if (data.energy) {
    properties['Energy'] = {
      select: { name: data.energy }
    };
  }

  if (data.classification) {
    properties['Classification'] = {
      select: { name: data.classification }
    };
  }

  if (data.lenses && data.lenses.length > 0) {
    properties['Lenses'] = {
      relation: data.lenses.map(id => ({ id }))
    };
  }

  // Create the page
  const result = await notionRequest('/pages', 'POST', {
    parent: { database_id: config.databases.flow },
    properties
  });

  // Also try to create/link source
  if (config.databases.sources) {
    try {
      await handleSourceTracking(data.url, config.databases.sources);
    } catch (e) {
      console.log('Source tracking failed:', e);
    }
  }

  return { success: true, pageId: result.id };
}

// Save Spark
async function saveSpark(data) {
  const config = await getConfig();

  if (!config?.databases?.sparks) {
    throw new Error('Sparks database not configured');
  }

  const properties = {
    'Spark': {
      title: [{ text: { content: data.text.slice(0, 2000) } }] // Notion title limit
    },
    'Type': {
      select: { name: data.type || 'quote' }
    },
    'Energy': {
      select: { name: data.energy || 'warm' }
    }
  };

  if (data.lenses && data.lenses.length > 0) {
    properties['Lenses'] = {
      relation: data.lenses.map(id => ({ id }))
    };
  }

  const result = await notionRequest('/pages', 'POST', {
    parent: { database_id: config.databases.sparks },
    properties
  });

  return { success: true, pageId: result.id };
}

// Generate summary using simple extraction (no external AI needed)
async function generateSummary(content, title) {
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

// Check for duplicate URL in Flow
async function checkDuplicate(url, databaseId) {
  try {
    const result = await notionRequest(`/databases/${databaseId}/query`, 'POST', {
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

// Fetch lenses from database
async function fetchLenses() {
  const config = await getConfig();

  if (!config?.databases?.lenses) {
    return [];
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

    // Cache lenses
    await chrome.storage.sync.set({
      cachedLenses: lenses,
      lastLensRefresh: Date.now()
    });

    return lenses;
  } catch (error) {
    console.error('Fetch lenses error:', error);
    return [];
  }
}

// Handle source tracking
async function handleSourceTracking(url, sourcesDbId) {
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

// Quick spark from context menu
async function handleQuickSpark(text, tab) {
  try {
    const result = await saveSpark({
      text: text,
      type: 'quote',
      energy: 'warm',
      lenses: [],
      sourceUrl: tab.url,
      sourceTitle: tab.title
    });

    // Show notification
    showNotification('Spark captured ⚡', text.slice(0, 50) + '...');
  } catch (error) {
    showNotification('Error', error.message);
  }
}

// Save link to flow
async function handleSaveLinkToFlow(linkUrl, tab) {
  try {
    const result = await saveToFlow({
      title: linkUrl,
      url: linkUrl,
      myTake: `Saved from ${tab.title}`,
      energy: 'warm',
      classification: 'link',
      lenses: []
    });

    showNotification('Saved to Flow 📥', linkUrl);
  } catch (error) {
    showNotification('Error', error.message);
  }
}

// Save image to flow
async function handleSaveImageToFlow(imageUrl, tab) {
  try {
    const result = await saveToFlow({
      title: `Image from ${new URL(tab.url).hostname}`,
      url: imageUrl,
      myTake: `Image saved from ${tab.title}`,
      energy: 'warm',
      classification: 'note',
      lenses: []
    });

    showNotification('Saved to Flow 📥', 'Image saved');
  } catch (error) {
    showNotification('Error', error.message);
  }
}

// Test Notion connection
async function testNotionConnection() {
  try {
    await notionRequest('/users/me');
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

// Show notification (basic)
function showNotification(title, message) {
  // Chrome notifications require permission, so we'll just log for now
  console.log(`[BOXY] ${title}: ${message}`);

  // Could also inject a toast into the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'showToast',
        title,
        message
      }).catch(() => {});
    }
  });
}
