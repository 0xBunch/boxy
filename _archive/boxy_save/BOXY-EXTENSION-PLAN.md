# BOXY Chrome Extension Plan

## Overview

Transform the "Save to Notion" extension into **"Save to BOXY"** — a focused capture tool that sends content directly to your BOXY Flow and Sparks databases.

---

## Current State → Target State

| Current | Target |
|---------|--------|
| Generic "Save to Notion" | Branded "Save to BOXY" |
| Saves to any Notion database | Saves specifically to Flow or Sparks |
| Complex options | Simple BOXY-focused settings |
| Generic fields | BOXY fields (My Take, Energy, Lens) |
| Multiple capture modes | Streamlined: Article → Flow, Quote → Spark |

---

## User Experience

### Quick Save (Default)
1. User is on interesting page
2. Clicks BOXY extension icon (or `Alt+Shift+B`)
3. Popup appears with:
   - **Title** (auto-filled from page)
   - **URL** (auto-filled)
   - **My Take** (required — "Why are you saving this?")
   - **Energy** (🔥 hot / warm / cool)
   - **Classification** (article, video, thread, etc.)
   - **Lenses** (quick-select from your active lenses)
4. Click **Save to Flow**
5. Toast confirms: "Saved to Flow 📥"

### Spark Capture (Highlight Mode)
1. User highlights text on page
2. Right-click → "Save as BOXY Spark" (or `Alt+Shift+S`)
3. Small popup appears:
   - **Spark text** (the highlighted text)
   - **Type** (quote, observation, question, hot-take)
   - **Energy** (🔥 hot / warm / cool)
   - **Lens** (optional quick-select)
4. Click **Save Spark**
5. Toast confirms: "Spark captured ⚡"

### Screenshot Save
1. `Cmd+Shift+S` for full page screenshot
2. Image saved to Flow with:
   - Auto-generated title: "Screenshot: [page title]"
   - Classification: `note`
   - URL of source page

---

## Technical Architecture

### Files to Modify

```
boxy_save/
├── manifest.json          ← Rebrand, update permissions
├── serviceWorker.js       ← Modify to target BOXY databases
├── popup/
│   ├── index.html         ← New BOXY-branded UI
│   └── popup.js           ← New popup logic (simplified)
├── content/
│   └── content.js         ← Keep most, add Spark capture
├── options/
│   └── options.html       ← Simplified settings (database IDs, API key)
├── assets/
│   └── icon*.png          ← BOXY branding
└── [keep utility scripts]
```

### Files to Remove/Simplify

- `gmailIntegration.js` — Not needed
- `scanWebpage.js` — Simplify heavily (just need basic metadata)
- Complex modal system — Replace with simple popup
- Most of `options.js` (1.9MB) — Replace with minimal settings

---

## New Popup UI Design

```
┌─────────────────────────────────────────┐
│  📦 BOXY                          [⚙️]  │
├─────────────────────────────────────────┤
│                                         │
│  Title                                  │
│  ┌─────────────────────────────────┐   │
│  │ [Auto-filled page title]        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  URL                                    │
│  ┌─────────────────────────────────┐   │
│  │ https://example.com/article     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  My Take *                              │
│  ┌─────────────────────────────────┐   │
│  │ Why did this catch your eye?    │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Energy          Classification         │
│  [🔥] [☀️] [❄️]   [▼ article      ]     │
│                                         │
│  Lenses                                 │
│  [Agentic Productivity ×] [+ Add]       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         📥 Save to Flow          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ─────────── or ───────────            │
│                                         │
│  [⚡ Save as Spark instead]             │
│                                         │
└─────────────────────────────────────────┘
```

---

## Settings Page (Simplified)

```
┌─────────────────────────────────────────┐
│  ⚙️ BOXY Settings                       │
├─────────────────────────────────────────┤
│                                         │
│  Notion API Key                         │
│  ┌─────────────────────────────────┐   │
│  │ secret_xxxxxxxxxxxxx            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Database IDs                           │
│                                         │
│  Flow Database                          │
│  ┌─────────────────────────────────┐   │
│  │ abc123def456...                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Sparks Database                        │
│  ┌─────────────────────────────────┐   │
│  │ ghi789jkl012...                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Lenses Database                        │
│  ┌─────────────────────────────────┐   │
│  │ mno345pqr678...                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Sources Database (optional)            │
│  ┌─────────────────────────────────┐   │
│  │ stu901vwx234...                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Test Connection]     [Save Settings]  │
│                                         │
└─────────────────────────────────────────┘
```

---

## Data Flow

### Save to Flow

```javascript
// User clicks "Save to Flow"
const flowItem = {
  parent: { database_id: FLOW_DATABASE_ID },
  properties: {
    "Name": { title: [{ text: { content: pageTitle } }] },
    "URL": { url: pageUrl },
    "My Take": { rich_text: [{ text: { content: myTake } }] },
    "Energy": { select: { name: energy } },  // "🔥 hot", "warm", "cool"
    "Classification": { select: { name: classification } },
    "Lenses": { relation: selectedLenses.map(id => ({ id })) },
    "Status": { select: { name: "new" } },
    "Date Saved": { date: { start: new Date().toISOString() } }
  }
};

// POST to Notion API
fetch('https://api.notion.com/v1/pages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(flowItem)
});
```

### Save Spark

```javascript
// User saves highlighted text as Spark
const spark = {
  parent: { database_id: SPARKS_DATABASE_ID },
  properties: {
    "Spark": { title: [{ text: { content: highlightedText } }] },
    "Type": { select: { name: sparkType } },  // "quote", "observation", etc.
    "Energy": { select: { name: energy } },
    "Lenses": { relation: selectedLenses.map(id => ({ id })) }
  }
};
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+Shift+B` | Open BOXY popup (save current page) |
| `Alt+Shift+S` | Save selection as Spark |
| `Cmd+Shift+S` | Screenshot → Flow |

---

## Context Menu

Right-click menu options:
- **Save page to BOXY Flow** — Opens popup
- **Save selection as Spark** — Quick spark capture
- **Save link to BOXY Flow** — Save linked URL (not current page)
- **Save image to BOXY Flow** — Save image URL

---

## Implementation Phases

### Phase 1: Core Rebrand (2 hours)
- [ ] Update `manifest.json` (name, description, icons)
- [ ] Create BOXY icons (16, 48, 128px)
- [ ] Update popup HTML with BOXY branding
- [ ] Remove unused permissions

### Phase 2: Simplified Popup (3 hours)
- [ ] Create new `popup.html` with BOXY UI
- [ ] Create new `popup.js` with simplified logic
- [ ] Add My Take field (required validation)
- [ ] Add Energy selector (3 buttons)
- [ ] Add Classification dropdown
- [ ] Add Lens multi-select (fetch from Notion)

### Phase 3: Settings Page (2 hours)
- [ ] Create simplified `options.html`
- [ ] Create `options.js` for settings management
- [ ] Store: API key, database IDs
- [ ] Add "Test Connection" button
- [ ] Fetch and cache Lenses for quick-select

### Phase 4: Service Worker (3 hours)
- [ ] Modify `serviceWorker.js` to use BOXY config
- [ ] Implement `saveToFlow()` function
- [ ] Implement `saveAsSpark()` function
- [ ] Add Notion API error handling
- [ ] Add offline queue (save locally, sync when online)

### Phase 5: Spark Capture (2 hours)
- [ ] Add context menu for "Save as Spark"
- [ ] Create minimal spark popup
- [ ] Implement highlight → spark flow
- [ ] Add keyboard shortcut

### Phase 6: Polish (2 hours)
- [ ] Toast notifications ("Saved to Flow 📥")
- [ ] Error states and messages
- [ ] Loading states
- [ ] Test on various sites
- [ ] Package for distribution

---

## Files to Create/Replace

### New Files
```
boxy_save/
├── popup/
│   ├── popup.html      ← New BOXY popup UI
│   ├── popup.js        ← New popup logic
│   └── popup.css       ← Styling
├── options/
│   ├── options.html    ← Simplified settings
│   ├── options.js      ← Settings logic
│   └── options.css     ← Styling
├── spark/
│   ├── spark.html      ← Spark capture popup
│   └── spark.js        ← Spark logic
└── lib/
    └── notion-api.js   ← Notion API wrapper
```

### Modified Files
```
├── manifest.json       ← Rebrand + simplify
├── serviceWorker.js    ← BOXY-specific logic
└── content/content.js  ← Add spark capture trigger
```

### Removed/Ignored Files
```
├── gmailIntegration.js     ← Remove
├── scanWebpage.js          ← Simplify heavily
├── options.js (1.9MB)      ← Replace entirely
└── modal/ (complex)        ← Replace with simple popup
```

---

## Storage Schema

```javascript
// chrome.storage.sync (synced across devices)
{
  "notionApiKey": "secret_...",
  "databases": {
    "flow": "abc123...",
    "sparks": "def456...",
    "lenses": "ghi789...",
    "sources": "jkl012..."  // optional
  },
  "cachedLenses": [
    { "id": "...", "name": "Agentic Productivity" },
    { "id": "...", "name": "Future of Work" }
  ],
  "lastLensRefresh": "2024-01-20T00:00:00Z",
  "preferences": {
    "defaultEnergy": "warm",
    "defaultClassification": "article",
    "autoClose": true
  }
}

// chrome.storage.local (offline queue)
{
  "pendingItems": [
    { "type": "flow", "data": {...}, "timestamp": "..." },
    { "type": "spark", "data": {...}, "timestamp": "..." }
  ]
}
```

---

## Success Criteria

- [ ] Can save any page to Flow with one click + My Take
- [ ] Can save highlighted text as Spark
- [ ] Energy and Lens selection works
- [ ] Settings page stores credentials securely
- [ ] Works offline (queues and syncs)
- [ ] Clear error messages when something fails
- [ ] Fast — popup opens instantly
- [ ] Branded — looks like BOXY

---

## Questions to Resolve

1. **Auto-generate Summary?** — Should we use AI to summarize the page, or let user fill it manually?
2. **Source tracking?** — Should saving auto-create/link to Sources database?
3. **Duplicate detection?** — Warn if URL already exists in Flow?
4. **Browser support?** — Chrome only, or also Firefox/Edge?

---

*Let's build the fastest path from "interesting page" to "captured in BOXY."*
