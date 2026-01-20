# BOXY

Your second brain with opinions. **Capture → Synthesize → Ship.**

BOXY is a Notion-powered system for turning a firehose of captures into shipped work. It's built for people who save more than they process and have ideas that never become anything. Unlike typical "second brain" systems that optimize for organization, BOXY optimizes for *shipping*.

---

## What's Here

```
BOXY/
├── boxy_extension/     # Chrome extension for quick capture
├── claude-skill/       # Claude Code skill for terminal BOXY
├── SETUP.md            # Installation guide
├── BOXY-AGENT.md       # AI agent instructions (for Notion AI)
├── BOXY-DESIGN.md      # Database schema reference
└── _archive/           # Old docs and reference files
```

---

## Quick Start

### Option A: Chrome Extension Only (5 min)

Capture articles, quotes, and sparks from any webpage.

1. Open Chrome → `chrome://extensions` → Enable "Developer mode"
2. Click "Load unpacked" → Select `boxy_extension/` folder
3. Click BOXY icon → Right-click → "Options"
4. Add your Notion API key + database IDs
5. Click the BOXY icon on any page to capture

**Features:**
- Save to Flow (articles, videos, podcasts)
- Save Sparks (highlight text → click tooltip)
- Auto-classification (YouTube → video, etc.)
- Lenses tagging
- Duplicate detection

### Option B: Claude Code Skill Only (10 min)

Use BOXY from your terminal with Claude Code.

```bash
# Copy skill
cp -r claude-skill/boxy ~/.claude/skills/

# Create config
mkdir -p ~/.config/boxy
cp claude-skill/boxy/config.template.json ~/.config/boxy/config.json

# Edit config with your database IDs
open ~/.config/boxy/config.json

# Run in Claude Code
/boxy
```

### Option C: Full Setup (45 min)

Build the complete Notion database system + extension + skill.

See **[SETUP.md](SETUP.md)** for step-by-step instructions.

---

## The System

```
CAPTURE           SYNTHESIZE        DEVELOP           SHIP
┌─────────┐       ┌─────────┐      ┌─────────┐      ┌─────────┐
│ ⚡Sparks │       │         │      │         │      │         │
│ 📥Flow   │  ──▶  │ 🔮Lenses │ ──▶  │ 💡Ideas  │ ──▶  │ 📤Outputs│
│ 🎯Sources│       │         │      │ 🎯Projects│     │         │
└─────────┘       └─────────┘      └─────────┘      └─────────┘
```

**7 Databases:**
- ⚡ **Sparks** — Micro-captures (quotes, thoughts, observations)
- 📥 **Flow** — Standard captures (articles, videos, notes)
- 🎯 **Sources** — Recurring inputs (newsletters, podcasts, people)
- 🔮 **Lenses** — Living patterns that connect content
- 💡 **Ideas** — Concepts being developed toward output
- 🎯 **Projects** — Groups of Ideas toward larger goals
- 📤 **Outputs** — Finished, shipped work

---

## Philosophy

1. **Capture is free, synthesis is expensive** — make capture effortless
2. **Ship over perfect** — shipped 80% beats unshipped 100%
3. **Patterns over items** — individual captures matter less than what they reveal
4. **Energy is signal** — trust your gut about what's hot

---

## Docs

| File | What It Is |
|------|------------|
| [SETUP.md](SETUP.md) | Complete installation guide |
| [BOXY-AGENT.md](BOXY-AGENT.md) | AI agent instructions for Notion AI |
| [BOXY-DESIGN.md](BOXY-DESIGN.md) | Database schema and architecture |

---

Built by [BUNCH](https://twitter.com/0xBunch) • Powered by Claude
