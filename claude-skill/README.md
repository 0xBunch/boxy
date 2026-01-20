# BOXY Claude Code Skill

A Claude Code skill that transforms your Notion-based BOXY system into a powerful thinking partner accessible from your terminal.

## Prerequisites

1. **Claude Code** installed and working
2. **Notion MCP server** configured in Claude Code
3. **BOXY databases** set up in Notion (see main repo's `SETUP-SCRIPT.md`)

## Installation

### Step 1: Install the Skill

Copy the skill folder to your Claude Code skills directory:

```bash
# Global installation (available in all projects)
mkdir -p ~/.claude/skills
cp -r boxy ~/.claude/skills/

# Or project-local installation
mkdir -p .claude/skills
cp -r boxy .claude/skills/
```

### Step 2: Configure Your Databases

1. Copy the config template:
```bash
mkdir -p ~/.config/boxy
cp boxy/config.template.json ~/.config/boxy/config.json
```

2. Edit `~/.config/boxy/config.json` with your database IDs:

```json
{
  "workspace": "your-workspace-name",
  "databases": {
    "sparks": "abc123...",
    "flow": "def456...",
    "sources": "ghi789...",
    "lenses": "jkl012...",
    "ideas": "mno345...",
    "projects": "pqr678...",
    "outputs": "stu901...",
    "sessions": "vwx234..."
  }
}
```

### Finding Your Database IDs

1. Open any database in Notion
2. Click "..." menu → "Copy link"
3. The ID is the 32-character string after the workspace name:
   ```
   https://notion.so/workspace/Database-Name-abc123def456ghi789jkl012mno345pq
                                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                              This is your database ID
   ```

### Step 3: Verify Notion MCP

Make sure your Notion MCP server is configured in Claude Code:

```bash
# Check your Claude Code config
cat ~/.claude/config.json
```

Should include something like:
```json
{
  "mcpServers": {
    "notion": {
      "command": "...",
      "args": ["..."],
      "env": {
        "NOTION_API_KEY": "your-key"
      }
    }
  }
}
```

## Usage

### Quick Reference

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
| `/boxy setup` | Reconfigure databases |
| `/boxy help` | Show all commands |

### Examples

```bash
# Start your day — check status
/boxy

# Process your inbox
/boxy triage

# After triage, look for patterns
/boxy synthesize

# Work on a specific idea
/boxy develop "The Centaur's Dilemma"

# Challenge your thinking
/boxy critique "The Centaur's Dilemma"

# Ready to publish
/boxy ship "The Centaur's Dilemma"

# Quick capture a thought
/boxy spark "What if taste is the last human moat?"

# Add an article to process later
/boxy add "https://example.com/interesting-article"

# Weekly review
/boxy review
```

## Modes Explained

### 🌊 Triage
Rapid inbox processing. Get through high volume quickly.
- Summarizes items
- Suggests energy ratings
- Matches to existing lenses
- Extracts sparks
- Recommends: keep, maybe, archive

### 🔮 Synthesize
Find patterns across your captures.
- Cross-item pattern recognition
- Lens health check
- Contradiction surfacing
- Gap analysis
- Idea seed generation

### 🔨 Develop
Build out a specific idea.
- Assess current state
- Strengthen hook and argument
- Generate contrarian take
- Identify evidence gaps
- Propose structure
- Draft sections

### 👹 Critique
Pressure-test before shipping.
- Argue against the idea
- Find logical gaps
- Test hook and "So What"
- Rate confidence
- Prescribe fixes or kill

### 🚀 Ship
Focus only on finishing.
- Pre-flight checklist
- Title options
- Final polish (small edits only)
- Platform prep
- Promotion snippets
- Create Output record

### 📊 Review
Weekly/monthly retrospective.
- Volume analysis
- Pipeline health
- Lens landscape
- Source quality audit
- Output performance
- Recommendations

## Configuration Options

### preferences

| Option | Default | Description |
|--------|---------|-------------|
| `defaultMode` | `"triage"` | Mode when you run `/boxy` with no args |
| `shipGoal` | `4` | Target outputs per month |
| `reviewCadence` | `"weekly"` | How often to prompt for review |
| `favoriteFormats` | `["essay", "thread"]` | Preferred output types |

### profile

Stores your BOXY profile from onboarding:

| Field | Description |
|-------|-------------|
| `archetype` | Your creative archetype |
| `primaryOutput` | Main thing you want to ship |
| `coreLens` | Your core area of focus |
| `primaryBlocker` | What usually stops you |
| `secretSauce` | Your unique edge |

## Troubleshooting

### "BOXY not configured"
Run `/boxy setup` or manually create `~/.config/boxy/config.json`

### "Can't connect to Notion"
1. Check Notion MCP server is running
2. Verify API key in Claude Code config
3. Restart Claude Code

### "Database not found"
1. Verify database ID is correct
2. Make sure database is shared with your Notion integration
3. Run `/boxy setup` to reconfigure

### Commands not recognized
Make sure the skill is in the right location:
- Global: `~/.claude/skills/boxy/boxy.md`
- Local: `.claude/skills/boxy/boxy.md`

## Updating

Pull the latest from the repo and re-copy:

```bash
cd boxy-repo
git pull
cp -r claude-skill/boxy ~/.claude/skills/
```

## Contributing

Issues and PRs welcome at: https://github.com/0xBunch/boxy

---

*BOXY: Think less about organizing. Think more about shipping.*
