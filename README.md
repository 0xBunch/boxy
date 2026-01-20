# BOXY

Your second brain with opinions. **Capture → Synthesize → Ship.**

BOXY is a Notion-powered system for turning a firehose of captures into shipped work. It's built for people who save more than they process and have ideas that never become anything. Unlike typical "second brain" systems that optimize for organization, BOXY optimizes for *shipping*.

---

## Quick Start

### 1. Buy + Install from Notion Marketplace

One-click install. You get all 7 BOXY databases ready to go.

### 2. Activate BOXY (Required)

Create a Notion integration to enable all BOXY features:

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) → **New integration** → name it "BOXY"
2. Copy the API key (starts with `secret_`)
3. On your BOXY page → **•••** → **Connections** → add "BOXY"

Done. This API key works for all integrations below.

### 3. Add Integrations (Optional)

| Integration | What It Does | Setup |
|-------------|--------------|-------|
| **Chrome Extension** | Capture from any webpage | [Install from Chrome Web Store](#chrome-extension) |
| **Claude Code Skill** | Terminal-based BOXY | [See SETUP.md](SETUP.md#optional-claude-code-skill) |

---

## Chrome Extension

Capture articles, quotes, and sparks from any webpage.

**Install:** Chrome Web Store → search "BOXY" → **Add to Chrome**

**Configure:** Right-click BOXY icon → **Options** → paste API key + BOXY page URL → **Save**

**Use:**
- Click BOXY icon to save current page to Flow
- Highlight text → click ⚡ tooltip to save as Spark
- `Alt+Shift+B` opens the modal

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

## What's Here

```
BOXY/
├── boxy_extension/     # Chrome extension for quick capture
├── claude-skill/       # Claude Code skill for terminal BOXY
├── SETUP.md            # Complete setup guide
├── BOXY-AGENT.md       # AI agent instructions (for Notion AI)
├── BOXY-DESIGN.md      # Database schema reference
└── _archive/           # Old docs and reference files
```

---

## Docs

| File | What It Is |
|------|------------|
| [SETUP.md](SETUP.md) | Complete installation guide |
| [BOXY-AGENT.md](BOXY-AGENT.md) | AI agent instructions for Notion AI |
| [BOXY-DESIGN.md](BOXY-DESIGN.md) | Database schema and architecture |

---

Built by [BUNCH](https://twitter.com/0xBunch) • Powered by Claude
