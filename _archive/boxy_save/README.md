# Save to BOXY - Chrome Extension

A Chrome extension for capturing web content directly to your BOXY Notion workspace.

## Features

- **Save to Flow**: Capture articles, videos, threads with a single click
- **Spark Capture**: Highlight text and save it as a Spark with context
- **Auto-Summary**: Generates brief summaries of saved content
- **My Take Field**: Add your personal reaction/insight when saving
- **Energy Tracking**: Mark content as Hot/Warm/Cool for prioritization
- **Lens Tagging**: Connect saves to your BOXY Lenses
- **Source Tracking**: Automatically tracks domains you save from

## Installation

### Developer Mode (Current)

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `boxy_save` folder
5. The BOXY icon should appear in your toolbar

### Setup

1. Click the BOXY icon → Settings (gear icon) or right-click → Options
2. Enter your Notion API key from [notion.so/my-integrations](https://www.notion.so/my-integrations)
3. Enter your BOXY database IDs:
   - **Flow Database** (required)
   - **Sparks Database** (required)
   - **Lenses Database** (optional, for lens selection)
   - **Sources Database** (optional, for source tracking)
4. Click "Test Connection" to verify
5. Click "Save Settings"

### Getting Database IDs

1. Open your BOXY database in Notion
2. Click ••• → Copy link
3. The ID is the 32-character string in the URL:
   - `notion.so/workspace/Name-**abc123def456...**`

## Usage

### Quick Save (Flow)

1. Navigate to any webpage
2. Click the BOXY icon or press `Alt+Shift+B`
3. Add your "My Take" (required)
4. Select Energy level and classification
5. Optionally tag with Lenses
6. Click "Save to Flow"

### Save Spark (Highlight)

1. Select text on any webpage (10+ characters)
2. Click "⚡ Save Spark" in the tooltip that appears
3. Or press `Alt+Shift+S` to save current selection

### Keyboard Shortcuts

- `Alt+Shift+B` - Open BOXY popup
- `Alt+Shift+S` - Save selection as Spark

## File Structure

```
boxy_save/
├── manifest.json          # Extension manifest (MV3)
├── background.js          # Service worker (Notion API)
├── popup/
│   ├── popup.html        # Main popup UI
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup logic
├── options/
│   ├── options.html      # Settings page
│   ├── options.css       # Settings styles
│   └── options.js        # Settings logic
├── content/
│   ├── content.js        # Content script (extraction, toasts)
│   └── content.css       # Toast/tooltip styles
└── assets/
    ├── boxy-16.png       # Toolbar icon
    ├── boxy-48.png       # Medium icon
    └── boxy-128.png      # Large icon
```

## Required Notion Properties

### Flow Database
- `Title` (title) - Page title
- `URL` (url) - Source URL
- `Summary` (rich_text) - Auto-generated summary
- `My Take` (rich_text) - Your reaction
- `Energy` (select) - Hot/Warm/Cool
- `Source` (relation) - To Sources database
- `Lenses` (relation) - To Lenses database
- `Classification` (select) - Content type
- `Status` (select) - Processing status

### Sparks Database
- `Highlight` (title) - Selected text
- `Source URL` (url) - Origin page
- `Source Title` (rich_text) - Page title
- `Domain` (rich_text) - Website domain

## Development

Built with vanilla JS for minimal dependencies. Uses Chrome Extension Manifest V3.

### Testing Changes

1. Make edits to the source files
2. Go to `chrome://extensions`
3. Click the refresh icon on the BOXY extension
4. Test your changes

## License

MIT - Built for the BOXY system by Kyle Bunch
