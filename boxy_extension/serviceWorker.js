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

async function createFlowItem({ title, url, myTake, energy, classification }) {
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

  return notionRequest('/pages', 'POST', {
    parent: { database_id: config.databases.flow },
    properties
  });
}

async function createSpark({ text, type, energy, sourceUrl }) {
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
  if (message.action === 'saveToFlow') {
    createFlowItem(message.data)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.action === 'saveSpark') {
    createSpark(message.data)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === 'testConnection') {
    testConnection()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === 'getConfig') {
    getConfig()
      .then(config => sendResponse({ config }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});
