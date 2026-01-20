# BOXY Setup Guide

Get BOXY running in ~10 minutes.

---

## Core Setup (Required)

These 4 steps activate BOXY and enable all integrations.

### Step 1: Buy + Install

1. Purchase BOXY from the Notion Marketplace
2. Click **Duplicate** → select your workspace
3. Wait for the page to load

You now have all 7 BOXY databases in your workspace.

### Step 2: Create Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Name it "BOXY", select your workspace, click **Submit**
4. Click **Show** next to the secret, then **Copy**

Save this API key somewhere safe — you'll use it for all BOXY integrations.

### Step 3: Connect Integration to BOXY

1. Open your BOXY page in Notion
2. Click **•••** (top right) → **Connections**
3. Search for "BOXY" → click to add it

All child databases automatically inherit this connection.

### Step 4: Done

BOXY is now activated. Your API key works for any integration below.

---

## Optional: Chrome Extension

Capture articles, quotes, and sparks from any webpage.

### Install

**From Chrome Web Store (recommended):**
- Search "BOXY" → click **Add to Chrome**

**Or load unpacked (developers):**
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select `boxy_extension/` folder

### Configure

1. Right-click BOXY icon → **Options**
2. Paste your **Notion API key**
3. Paste your **BOXY page URL** (from Notion)
4. Click **Save** — databases are auto-detected

### Use

**Save to Flow:**
- Click BOXY icon on any page
- Add your take, select energy, tag with lenses
- Click "Save to Flow"

**Save a Spark:**
- Highlight text on any page
- Click the ⚡ tooltip that appears

**Keyboard shortcut:** `Alt+Shift+B` opens the modal

---

## Optional: Claude Code Skill

Use BOXY from your terminal with Claude Code.

### Install

```bash
# Copy skill to Claude
cp -r claude-skill/boxy ~/.claude/skills/

# Create config
mkdir -p ~/.config/boxy
cp claude-skill/boxy/config.template.json ~/.config/boxy/config.json
```

### Configure

1. Edit `~/.config/boxy/config.json` with your database IDs
2. Add Notion MCP to `~/.claude.json`:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_API_KEY": "secret_YOUR_KEY_HERE"
      }
    }
  }
}
```

3. Restart Claude Code

### Use

```bash
/boxy              # Dashboard
/boxy triage       # Process inbox
/boxy synthesize   # Find patterns
/boxy develop X    # Build out idea X
/boxy ship         # Focus on finishing
```

---

## Troubleshooting

### "BOXY not configured"

API key or database IDs are missing. Open extension options and verify your settings.

### "Connection failed"

1. Check your Notion API key is correct (starts with `secret_`)
2. Make sure BOXY page is shared with your integration
3. Verify the BOXY page URL is correct

### "Can't connect to Notion" (Claude skill)

1. Check Notion MCP is in `~/.claude.json`
2. Verify API key is valid
3. Restart Claude Code

---

## Quick Reference

### Extension Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+Shift+B` | Open BOXY modal |
| `Esc` | Close modal |

### Skill Commands

| Command | What It Does |
|---------|--------------|
| `/boxy` | Dashboard |
| `/boxy triage` | Process inbox |
| `/boxy synthesize` | Find patterns |
| `/boxy develop [idea]` | Build out idea |
| `/boxy critique [idea]` | Pressure-test |
| `/boxy ship` | Focus on finishing |
| `/boxy review` | Retrospective |

---

*Think less about organizing. Think more about shipping.*
