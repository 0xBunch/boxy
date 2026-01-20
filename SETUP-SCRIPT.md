# BOXY 2.0 Setup Script

**Time:** ~30 minutes
**What you'll have:** Fully functional BOXY system

---

## Phase 1: Create the Databases (20 min)

Do these in order. Check each box as you go.

---

### 1. Sources

- [ ] Create new **database** (not page) inside BOXY 2.0
- [ ] Name it: `🎯 Sources`
- [ ] Add properties:

| Property | Type | Options |
|----------|------|---------|
| Name | Title | *(default)* |
| Type | Select | `person`, `newsletter`, `podcast`, `publication`, `community`, `tool` |
| URL | URL | |
| Why I Follow | Text | |
| Signal Quality | Select | `gold`, `silver`, `bronze` |
| Notes | Text | |

---

### 2. Lenses

- [ ] Create new database
- [ ] Name it: `🔮 Lenses`
- [ ] Add properties:

| Property | Type | Options |
|----------|------|---------|
| Lens | Title | *(default)* |
| Summary | Text | |
| Core Question | Text | |
| Status | Select | `emerging`, `active`, `mature`, `cooling`, `archived` |
| Evolution Log | Text | |
| Contradictions | Text | |

*We'll add relations later*

---

### 3. Projects

- [ ] Create new database
- [ ] Name it: `🎯 Projects`
- [ ] Add properties:

| Property | Type | Options |
|----------|------|---------|
| Project | Title | *(default)* |
| Vision | Text | |
| Status | Select | `exploring`, `active`, `paused`, `completed`, `killed` |
| Deadline | Date | |
| Success Metrics | Text | |
| Notes | Text | |

---

### 4. Sparks

- [ ] Create new database
- [ ] Name it: `⚡ Sparks`
- [ ] Add properties:

| Property | Type | Options |
|----------|------|---------|
| Spark | Title | *(default)* |
| Type | Select | `quote`, `thought`, `question`, `observation`, `hot-take`, `connection` |
| Energy | Select | `🔥 hot`, `warm`, `cool` |
| Source | Relation | → Sources |
| Lenses | Relation | → Lenses |
| Promoted to Idea | Checkbox | |

---

### 5. Flow

- [ ] Create new database
- [ ] Name it: `📥 Flow`
- [ ] Add properties:

| Property | Type | Options |
|----------|------|---------|
| Name | Title | *(default)* |
| Summary | Text | |
| My Take | Text | |
| URL | URL | |
| Source | Relation | → Sources |
| Classification | Select | `article`, `video`, `note`, `link`, `thread`, `paper`, `podcast` |
| Lenses | Relation | → Lenses |
| Related Sparks | Relation | → Sparks |
| Energy | Select | `🔥 hot`, `warm`, `cool` |
| Status | Select | `new`, `processing`, `synthesized`, `archived` |
| Tags | Multi-select | *(add as needed)* |
| Date Saved | Date | |

---

### 6. Outputs

- [ ] Create new database
- [ ] Name it: `📤 Outputs`
- [ ] Add properties:

| Property | Type | Options |
|----------|------|---------|
| Output | Title | *(default)* |
| Type | Select | `essay`, `thread`, `newsletter`, `talk`, `framework`, `product`, `video`, `other` |
| URL | URL | |
| Published | Date | |
| Lenses | Relation | → Lenses |
| Project | Relation | → Projects |
| Performance | Select | `hit`, `solid`, `meh`, `miss` |
| Learnings | Text | |
| Reactions | Text | |

---

### 7. Ideas

- [ ] Create new database
- [ ] Name it: `💡 Ideas`
- [ ] Add properties:

| Property | Type | Options |
|----------|------|---------|
| Idea | Title | *(default)* |
| Hook | Text | |
| Core Argument | Text | |
| So What? | Text | |
| Output Formats | Multi-select | `essay`, `thread`, `newsletter`, `talk`, `framework`, `product`, `video` |
| Confidence | Select | `hunch`, `hypothesis`, `thesis`, `proven` |
| Lenses | Relation | → Lenses |
| Related Flow | Relation | → Flow |
| Related Sparks | Relation | → Sparks |
| Project | Relation | → Projects |
| Contrarian Take | Text | |
| Open Questions | Text | |
| Status | Select | `spark`, `developing`, `draft-ready`, `drafting`, `editing`, `shipped`, `killed` |
| Energy | Select | `🔥 hot`, `warm`, `cool`, `frozen` |
| Blockers | Text | |
| Next Action | Text | |
| Shipped To | Relation | → Outputs |

---

### 8. Sessions

- [ ] Create new database
- [ ] Name it: `📋 Sessions`
- [ ] Add properties:

| Property | Type | Options |
|----------|------|---------|
| Session | Title | *(default)* |
| Date | Date | |
| Mode | Select | `triage`, `synthesis`, `development`, `critique`, `ship`, `review` |
| Flow Processed | Relation | → Flow |
| Sparks Created | Relation | → Sparks |
| Ideas Created | Relation | → Ideas |
| Ideas Advanced | Relation | → Ideas |
| Outputs Shipped | Relation | → Outputs |
| Key Decisions | Text | |
| Observations | Text | |

---

## Phase 2: Add Missing Relations (5 min)

Go back and add these relations you couldn't add before:

- [ ] **Lenses** → add `Related Flow` (Relation → Flow)
- [ ] **Lenses** → add `Related Sparks` (Relation → Sparks)
- [ ] **Lenses** → add `Related Ideas` (Relation → Ideas)
- [ ] **Lenses** → add `Adjacent Lenses` (Relation → Lenses) *(self-relation)*
- [ ] **Outputs** → add `Source Ideas` (Relation → Ideas)
- [ ] **Outputs** → add `Source Flow` (Relation → Flow)

---

## Phase 3: Install the Agent Brain (5 min)

This is the magic part.

### Step 1: Open Notion AI Settings
- [ ] Go to **Settings & members** → **Notion AI**
- [ ] Find **Custom instructions** (or "AI knowledge")

### Step 2: Paste the Agent Instructions
- [ ] Open `BOXY-2.0-AGENT.md` from the GitHub repo
- [ ] Copy the ENTIRE file
- [ ] Paste it into Notion AI custom instructions
- [ ] Save

---

## Phase 4: Build the Homepage (5 min)

- [ ] Go to your BOXY 2.0 page
- [ ] Add this structure:

```
# BOXY 2.0

## Quick Actions
[Copy the table from BOXY-2.0-HOMEPAGE.md]

## Databases
[Link to each of your 8 databases as inline or linked views]

## Inbox Status
📥 Flow: [Create a linked view filtered to Status = "new"]

## Active Ideas
💡 [Create a linked view filtered to Status ≠ "shipped" and ≠ "killed"]

## Hot Lenses
🔮 [Create a linked view filtered to Status = "active"]
```

---

## Phase 5: First Run (2 min)

- [ ] Open Notion AI on the BOXY 2.0 page
- [ ] Say: **"Setup BOXY"**
- [ ] Go through the onboarding questions
- [ ] When done, say: **"What should I work on?"**

---

## You're Done!

### Quick Commands Reference

| Say This | BOXY Does This |
|----------|----------------|
| `triage` | Rapid inbox processing |
| `synthesize` | Find patterns across items |
| `develop [idea name]` | Build out a specific idea |
| `critique [idea name]` | Pressure-test an idea |
| `ship` | Focus on finishing |
| `review` | Weekly/monthly retrospective |
| `what should I work on?` | Get contextual recommendation |

---

## Troubleshooting

**BOXY doesn't know my databases:**
→ Make sure custom instructions are saved in Notion AI settings

**Relations aren't showing:**
→ Check that you're linking to the correct database (watch for duplicates)

**BOXY is generic, not personalized:**
→ Run "Setup BOXY" to complete onboarding and build your profile

---

*Now go capture something, and let BOXY help you ship it.*
