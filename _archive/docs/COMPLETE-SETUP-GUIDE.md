# BOXY 2.0 Complete Setup Guide

Everything you need to get BOXY running in Notion with the Claude Code skill.

**Total time:** ~45 minutes
**End result:** BOXY databases in Notion + `/boxy` commands in Claude Code

---

## Part 1: Build the Notion Databases (25 min)

### Before You Start

- [ ] Open your BOXY 2.0 page in Notion
- [ ] Have this guide open side-by-side

### Database 1: 🎯 Sources

1. [ ] In your BOXY 2.0 page, type `/database` and select "Database - Inline"
2. [ ] Name it: `🎯 Sources`
3. [ ] Add these properties:

| Property | Type | Configuration |
|----------|------|---------------|
| Name | Title | *(already exists)* |
| Type | Select | Add options: `person`, `newsletter`, `podcast`, `publication`, `community`, `tool` |
| URL | URL | |
| Why I Follow | Text | |
| Signal Quality | Select | Add options: `gold`, `silver`, `bronze` |
| Notes | Text | |

4. [ ] **Copy the database ID** (click ••• → Copy link → extract ID from URL)
5. [ ] **Paste here:** `________________________`

---

### Database 2: 🔮 Lenses

1. [ ] Create new inline database
2. [ ] Name it: `🔮 Lenses`
3. [ ] Add these properties:

| Property | Type | Configuration |
|----------|------|---------------|
| Lens | Title | *(rename from Name)* |
| Summary | Text | |
| Core Question | Text | |
| Status | Select | Add options: `emerging`, `active`, `mature`, `cooling`, `archived` |
| Evolution Log | Text | |
| Contradictions | Text | |

*We'll add relations to Flow, Sparks, Ideas later*

4. [ ] **Copy database ID:** `________________________`

---

### Database 3: 🎯 Projects

1. [ ] Create new inline database
2. [ ] Name it: `🎯 Projects`
3. [ ] Add these properties:

| Property | Type | Configuration |
|----------|------|---------------|
| Project | Title | *(rename from Name)* |
| Vision | Text | |
| Status | Select | Add options: `exploring`, `active`, `paused`, `completed`, `killed` |
| Deadline | Date | |
| Success Metrics | Text | |
| Notes | Text | |

4. [ ] **Copy database ID:** `________________________`

---

### Database 4: ⚡ Sparks

1. [ ] Create new inline database
2. [ ] Name it: `⚡ Sparks`
3. [ ] Add these properties:

| Property | Type | Configuration |
|----------|------|---------------|
| Spark | Title | *(rename from Name)* |
| Type | Select | Add options: `quote`, `thought`, `question`, `observation`, `hot-take`, `connection` |
| Energy | Select | Add options: `🔥 hot`, `warm`, `cool` |
| Source | Relation | → Select `🎯 Sources` |
| Lenses | Relation | → Select `🔮 Lenses` |
| Promoted to Idea | Checkbox | |

4. [ ] **Copy database ID:** `________________________`

---

### Database 5: 📥 Flow

1. [ ] Create new inline database
2. [ ] Name it: `📥 Flow`
3. [ ] Add these properties:

| Property | Type | Configuration |
|----------|------|---------------|
| Name | Title | *(already exists)* |
| Summary | Text | |
| My Take | Text | |
| URL | URL | |
| Source | Relation | → Select `🎯 Sources` |
| Classification | Select | Add options: `article`, `video`, `note`, `link`, `thread`, `paper`, `podcast` |
| Lenses | Relation | → Select `🔮 Lenses` |
| Related Sparks | Relation | → Select `⚡ Sparks` |
| Energy | Select | Add options: `🔥 hot`, `warm`, `cool` |
| Status | Select | Add options: `new`, `processing`, `synthesized`, `archived` |
| Tags | Multi-select | *(add tags as needed)* |
| Date Saved | Date | |

4. [ ] **Copy database ID:** `________________________`

---

### Database 6: 📤 Outputs

1. [ ] Create new inline database
2. [ ] Name it: `📤 Outputs`
3. [ ] Add these properties:

| Property | Type | Configuration |
|----------|------|---------------|
| Output | Title | *(rename from Name)* |
| Type | Select | Add options: `essay`, `thread`, `newsletter`, `talk`, `framework`, `product`, `video`, `other` |
| URL | URL | |
| Published | Date | |
| Lenses | Relation | → Select `🔮 Lenses` |
| Project | Relation | → Select `🎯 Projects` |
| Performance | Select | Add options: `hit`, `solid`, `meh`, `miss` |
| Learnings | Text | |
| Reactions | Text | |

*We'll add Source Ideas and Source Flow relations later*

4. [ ] **Copy database ID:** `________________________`

---

### Database 7: 💡 Ideas

1. [ ] Create new inline database
2. [ ] Name it: `💡 Ideas`
3. [ ] Add these properties:

| Property | Type | Configuration |
|----------|------|---------------|
| Idea | Title | *(rename from Name)* |
| Hook | Text | |
| Core Argument | Text | |
| So What? | Text | |
| Output Formats | Multi-select | Add options: `essay`, `thread`, `newsletter`, `talk`, `framework`, `product`, `video` |
| Confidence | Select | Add options: `hunch`, `hypothesis`, `thesis`, `proven` |
| Lenses | Relation | → Select `🔮 Lenses` |
| Related Flow | Relation | → Select `📥 Flow` |
| Related Sparks | Relation | → Select `⚡ Sparks` |
| Project | Relation | → Select `🎯 Projects` |
| Contrarian Take | Text | |
| Open Questions | Text | |
| Status | Select | Add options: `spark`, `developing`, `draft-ready`, `drafting`, `editing`, `shipped`, `killed` |
| Energy | Select | Add options: `🔥 hot`, `warm`, `cool`, `frozen` |
| Blockers | Text | |
| Next Action | Text | |
| Shipped To | Relation | → Select `📤 Outputs` |

4. [ ] **Copy database ID:** `________________________`

---

### Database 8: 📋 Sessions

1. [ ] Create new inline database
2. [ ] Name it: `📋 Sessions`
3. [ ] Add these properties:

| Property | Type | Configuration |
|----------|------|---------------|
| Session | Title | *(rename from Name)* |
| Date | Date | |
| Mode | Select | Add options: `triage`, `synthesis`, `development`, `critique`, `ship`, `review` |
| Flow Processed | Relation | → Select `📥 Flow` |
| Sparks Created | Relation | → Select `⚡ Sparks` |
| Ideas Created | Relation | → Select `💡 Ideas` |
| Ideas Advanced | Relation | → Select `💡 Ideas` |
| Outputs Shipped | Relation | → Select `📤 Outputs` |
| Key Decisions | Text | |
| Observations | Text | |

4. [ ] **Copy database ID:** `________________________`

---

### Add Missing Relations (5 min)

Go back and add these cross-references:

1. [ ] **🔮 Lenses** — add property `Related Flow` → Relation to `📥 Flow`
2. [ ] **🔮 Lenses** — add property `Related Sparks` → Relation to `⚡ Sparks`
3. [ ] **🔮 Lenses** — add property `Related Ideas` → Relation to `💡 Ideas`
4. [ ] **🔮 Lenses** — add property `Adjacent Lenses` → Relation to `🔮 Lenses` (self-relation)
5. [ ] **📤 Outputs** — add property `Source Ideas` → Relation to `💡 Ideas`
6. [ ] **📤 Outputs** — add property `Source Flow` → Relation to `📥 Flow`
7. [ ] **🎯 Projects** — add property `Ideas` → Relation to `💡 Ideas`
8. [ ] **🎯 Projects** — add property `Outputs` → Relation to `📤 Outputs`

---

## Part 2: Collect Your Database IDs

Before moving on, make sure you have all 8 database IDs.

**How to get a database ID:**
1. Open the database
2. Click `•••` menu → `Copy link`
3. The URL looks like: `https://notion.so/workspace/Database-Name-abc123def456...`
4. The ID is the 32-character string at the end (after the last hyphen)

Fill in your IDs:

```
Sources:  ________________________________
Lenses:   ________________________________
Projects: ________________________________
Sparks:   ________________________________
Flow:     ________________________________
Outputs:  ________________________________
Ideas:    ________________________________
Sessions: ________________________________
```

---

## Part 3: Install the Claude Code Skill (10 min)

### Step 1: Create the Skill Directory

```bash
mkdir -p ~/.claude/skills/boxy
```

### Step 2: Download the Skill Files

```bash
# Clone the repo (if you haven't)
git clone https://github.com/0xBunch/boxy.git ~/boxy-temp

# Copy skill files
cp ~/boxy-temp/claude-skill/boxy/* ~/.claude/skills/boxy/

# Clean up
rm -rf ~/boxy-temp
```

Or manually copy from the repo:
- `claude-skill/boxy/boxy.md` → `~/.claude/skills/boxy/boxy.md`
- `claude-skill/boxy/config.template.json` → `~/.claude/skills/boxy/config.template.json`

### Step 3: Create Your Config

```bash
mkdir -p ~/.config/boxy
cp ~/.claude/skills/boxy/config.template.json ~/.config/boxy/config.json
```

### Step 4: Add Your Database IDs

Edit `~/.config/boxy/config.json`:

```bash
# Open in your editor
code ~/.config/boxy/config.json
# or
nano ~/.config/boxy/config.json
# or
open ~/.config/boxy/config.json
```

Replace the placeholder IDs with your real ones:

```json
{
  "workspace": "your-notion-workspace",
  "databases": {
    "sparks": "YOUR_SPARKS_ID_HERE",
    "flow": "YOUR_FLOW_ID_HERE",
    "sources": "YOUR_SOURCES_ID_HERE",
    "lenses": "YOUR_LENSES_ID_HERE",
    "ideas": "YOUR_IDEAS_ID_HERE",
    "projects": "YOUR_PROJECTS_ID_HERE",
    "outputs": "YOUR_OUTPUTS_ID_HERE",
    "sessions": "YOUR_SESSIONS_ID_HERE"
  },
  "preferences": {
    "defaultMode": "triage",
    "shipGoal": 4,
    "reviewCadence": "weekly",
    "favoriteFormats": ["essay", "thread", "newsletter"]
  }
}
```

Save the file.

---

## Part 4: Verify Notion MCP (5 min)

Make sure your Notion MCP server is configured in Claude Code.

### Check Your Config

```bash
cat ~/.claude.json
# or
cat ~/.config/claude/config.json
```

You should see something like:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_API_KEY": "secret_..."
      }
    }
  }
}
```

### If Notion MCP Isn't Configured

1. Get a Notion API key:
   - Go to https://www.notion.so/my-integrations
   - Create new integration
   - Copy the API key

2. Share your BOXY databases with the integration:
   - Open each database
   - Click `•••` → `Connections` → Add your integration

3. Add to Claude Code config:
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

4. Restart Claude Code

---

## Part 5: Test It (5 min)

### Start Claude Code

```bash
claude
```

### Run Your First Command

```
/boxy
```

You should see the BOXY status dashboard with:
- Inbox status (Flow items)
- Active Ideas
- Hot Lenses
- Recent Outputs

### Try These Commands

```
/boxy help          # See all commands
/boxy status        # Dashboard
/boxy triage        # Process inbox
/boxy synthesize    # Find patterns
```

---

## Troubleshooting

### "BOXY not configured"

Your config file is missing or malformed.

```bash
# Check it exists
cat ~/.config/boxy/config.json

# Verify JSON is valid
python3 -m json.tool ~/.config/boxy/config.json
```

### "Can't connect to Notion"

1. Check MCP server is configured:
   ```bash
   cat ~/.claude.json | grep -A 10 notion
   ```

2. Verify API key is valid (try in browser):
   ```
   https://api.notion.com/v1/users/me
   ```

3. Restart Claude Code

### "Database not found"

1. Verify database ID is correct (no extra characters)
2. Make sure database is shared with your Notion integration:
   - Open database in Notion
   - Click `•••` → `Connections`
   - Add your integration

### Skill not loading

Check skill location:
```bash
ls -la ~/.claude/skills/boxy/
```

Should show:
```
boxy.md
config.template.json
```

---

## Quick Reference Card

| Command | What It Does |
|---------|--------------|
| `/boxy` | Dashboard overview |
| `/boxy triage` | Process inbox rapidly |
| `/boxy synthesize` | Find patterns across items |
| `/boxy develop [idea]` | Build out a specific idea |
| `/boxy critique [idea]` | Pressure-test an idea |
| `/boxy ship [idea]` | Focus on finishing |
| `/boxy review` | Weekly/monthly retrospective |
| `/boxy spark "text"` | Quick-capture a thought |
| `/boxy add "url"` | Add URL to Flow |
| `/boxy help` | Show all commands |

---

## You're Done!

Your BOXY system is now:
- ✅ 8 databases built in Notion
- ✅ Claude Code skill installed
- ✅ Config with your database IDs
- ✅ Ready to triage, synthesize, develop, critique, ship, and review

**First session suggestion:**

1. Add a few items to Flow manually (articles, notes)
2. Run `/boxy triage` to process them
3. Run `/boxy synthesize` to look for patterns
4. See what emerges

---

*BOXY: Think less about organizing. Think more about shipping.*
