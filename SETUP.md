# BOXY Setup Guide

Complete setup for the BOXY system: Notion databases + Chrome extension + Claude Code skill.

**Choose your path:**
- [Part 1: Notion Databases](#part-1-notion-databases-25-min) — Required for everything
- [Part 2: Chrome Extension](#part-2-chrome-extension-5-min) — Quick capture from browser
- [Part 3: Claude Code Skill](#part-3-claude-code-skill-10-min) — Terminal-based BOXY

---

## Part 1: Notion Databases (25 min)

### Prerequisites

1. Create a Notion integration at https://www.notion.so/my-integrations
2. Copy the API key (starts with `secret_`)
3. Create a new page called "BOXY" in your workspace

### Database 1: 🎯 Sources

| Property | Type | Options |
|----------|------|---------|
| Name | Title | |
| Type | Select | `person`, `newsletter`, `podcast`, `publication`, `community`, `tool` |
| URL | URL | |
| Why I Follow | Text | |
| Signal Quality | Select | `gold`, `silver`, `bronze` |

### Database 2: 🔮 Lenses

| Property | Type | Options |
|----------|------|---------|
| Lens | Title | |
| Summary | Text | |
| Core Question | Text | |
| Status | Select | `emerging`, `active`, `mature`, `cooling`, `archived` |

### Database 3: ⚡ Sparks

| Property | Type | Options |
|----------|------|---------|
| Spark | Title | |
| Type | Select | `quote`, `thought`, `question`, `observation`, `hot-take`, `connection` |
| Energy | Select | `hot`, `warm`, `cool` |
| Lenses | Relation | → Lenses |

### Database 4: 📥 Flow

| Property | Type | Options |
|----------|------|---------|
| Name | Title | |
| URL | URL | |
| My Take | Text | |
| Summary | Text | |
| Classification | Select | `article`, `video`, `note`, `thread`, `paper`, `podcast`, `tool`, `newsletter`, `book` |
| Energy | Select | `hot`, `warm`, `cool` |
| Status | Select | `new`, `processing`, `synthesized`, `archived` |
| Lenses | Relation | → Lenses |
| Date Saved | Date | |

### Database 5: 💡 Ideas

| Property | Type | Options |
|----------|------|---------|
| Idea | Title | |
| Hook | Text | |
| Core Argument | Text | |
| Status | Select | `spark`, `developing`, `draft-ready`, `drafting`, `shipped`, `killed` |
| Energy | Select | `hot`, `warm`, `cool`, `frozen` |
| Confidence | Select | `hunch`, `hypothesis`, `thesis`, `proven` |
| Lenses | Relation | → Lenses |
| Related Flow | Relation | → Flow |
| Related Sparks | Relation | → Sparks |

### Database 6: 🎯 Projects

| Property | Type | Options |
|----------|------|---------|
| Project | Title | |
| Vision | Text | |
| Status | Select | `exploring`, `active`, `paused`, `completed`, `killed` |
| Ideas | Relation | → Ideas |

### Database 7: 📤 Outputs

| Property | Type | Options |
|----------|------|---------|
| Output | Title | |
| Type | Select | `essay`, `thread`, `newsletter`, `talk`, `framework`, `product`, `video` |
| URL | URL | |
| Published | Date | |
| Performance | Select | `hit`, `solid`, `meh`, `miss` |
| Lenses | Relation | → Lenses |
| Source Ideas | Relation | → Ideas |

### Share Databases with Integration

For each database:
1. Click `•••` → `Connections`
2. Add your BOXY integration

### Collect Database IDs

For each database, click `•••` → `Copy link`. The ID is the 32-character string in the URL.

```
Flow:     ________________________________
Sparks:   ________________________________
Lenses:   ________________________________
Sources:  ________________________________
Ideas:    ________________________________
Projects: ________________________________
Outputs:  ________________________________
```

---

## Part 2: Chrome Extension (5 min)

### Install

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `boxy_extension/` folder

### Configure

1. Right-click the BOXY extension icon → **Options**
2. Enter your **Notion API key**
3. Enter your **database IDs**:
   - Flow Database ID (required)
   - Sparks Database ID (required)
   - Lenses Database ID (for tagging)
   - Sources Database ID (optional, for source tracking)
4. Click **Test Connection**
5. Click **Save Settings**

### Use

**Save to Flow:**
- Click BOXY icon on any page
- Fill in your take, select energy, add lenses
- Click "Save to Flow"

**Save a Spark:**
- Highlight text on any page
- Click the ⚡ tooltip that appears
- Or right-click → "BOXY: Save as Spark"

**Keyboard shortcut:** `Alt+Shift+B` opens the modal

---

## Part 3: Claude Code Skill (10 min)

### Prerequisites

- Claude Code installed
- Notion MCP server configured (see below)

### Install Skill

```bash
# Create skills directory
mkdir -p ~/.claude/skills

# Copy skill files
cp -r claude-skill/boxy ~/.claude/skills/

# Create config directory
mkdir -p ~/.config/boxy

# Create config from template
cp claude-skill/boxy/config.template.json ~/.config/boxy/config.json
```

### Configure

Edit `~/.config/boxy/config.json`:

```json
{
  "workspace": "your-workspace-name",
  "databases": {
    "sparks": "YOUR_SPARKS_ID",
    "flow": "YOUR_FLOW_ID",
    "sources": "YOUR_SOURCES_ID",
    "lenses": "YOUR_LENSES_ID",
    "ideas": "YOUR_IDEAS_ID",
    "projects": "YOUR_PROJECTS_ID",
    "outputs": "YOUR_OUTPUTS_ID"
  }
}
```

### Configure Notion MCP

If not already configured, add to `~/.claude.json`:

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

Restart Claude Code after editing.

### Use

```bash
# Start Claude Code
claude

# Run BOXY
/boxy

# Available commands
/boxy status      # Dashboard
/boxy triage      # Process inbox
/boxy synthesize  # Find patterns
/boxy develop X   # Build out idea X
/boxy ship        # Focus on finishing
```

---

## Troubleshooting

### Extension: "BOXY not configured"

Your API key or database IDs are missing. Open extension options and fill them in.

### Extension: "Connection failed"

1. Check your Notion API key is correct
2. Make sure databases are shared with your integration
3. Verify database IDs are correct (32 characters, no dashes)

### Skill: "Can't connect to Notion"

1. Check Notion MCP is in `~/.claude.json`
2. Verify API key is valid
3. Restart Claude Code

### Skill: "Database not found"

1. Database IDs must match exactly
2. Each database must be shared with your Notion integration

---

## Quick Reference

### Extension Keyboard Shortcuts

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
