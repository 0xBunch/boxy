# BOXY 2.0: Design Document

## Philosophy Upgrade

BOXY 1.0: A capture-to-idea pipeline with AI assistance.
**BOXY 2.0: A thinking partner with memory, taste, and opinions.**

The difference: BOXY 2.0 doesn't just process what you give it — it *notices things*, *challenges you*, *remembers what worked*, and *pushes you to ship*.

---

## Database Architecture

### The Seven Databases

```
┌─────────────────────────────────────────────────────────────────┐
│                         CAPTURE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  ⚡ Sparks          │  📥 Flow            │  🎯 Sources         │
│  Micro-captures     │  Standard captures  │  Recurring inputs   │
│  (tweets, quotes,   │  (articles, videos, │  (people, podcasts, │
│  shower thoughts)   │  notes, links)      │  newsletters)       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SYNTHESIS LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  🔮 Lenses                                                      │
│  Living patterns with evolution tracking, heat scores,          │
│  and automatic connection discovery                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DEVELOPMENT LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  💡 Ideas                   │  🎯 Projects                      │
│  Individual concepts with   │  Groups of Ideas toward           │
│  confidence scores,         │  a larger output or goal          │
│  development stages         │                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        OUTPUT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  📤 Outputs                                                     │
│  Finished work with performance tracking,                       │
│  full provenance, and learnings                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schemas

### ⚡ Sparks (NEW)

Micro-captures that are too small for Flow but too good to lose.

| Property | Type | Purpose |
|----------|------|---------|
| Spark | Title | The actual thought/quote/observation |
| Type | Select | `quote`, `thought`, `question`, `observation`, `hot-take`, `connection` |
| Source | Relation → Sources | Where it came from (optional) |
| Related Flow | Relation → Flow | Connected to larger capture |
| Lenses | Relation → Lenses | Pattern connections |
| Energy | Select | `🔥 hot`, `warm`, `cool` — how alive does this feel? |
| Created | Created time | Auto-timestamp |
| Promoted to Idea | Checkbox | Did this become an Idea? |

**Why this matters:** High-volume capturers lose micro-insights. Sparks are the atoms that combine into molecules (Ideas).

---

### 📥 Flow (ENHANCED)

| Property | Type | Purpose |
|----------|------|---------|
| Name | Title | Item title |
| Summary | Text | AI-generated summary |
| My Take | Text | Your reaction in ≤2 sentences — what made you save this? |
| URL | URL | Source link |
| Source | Relation → Sources | Recurring source tracking |
| Classification | Select | `article`, `video`, `note`, `link`, `thread`, `paper`, `podcast` |
| Lenses | Relation → Lenses | Pattern connections |
| Related Sparks | Relation → Sparks | Micro-insights extracted |
| Related Ideas | Relation → Ideas | Ideas this feeds |
| Energy | Select | `🔥 hot`, `warm`, `cool` |
| Freshness | Formula | Days since saved (for decay tracking) |
| Status | Select | `new`, `processing`, `synthesized`, `archived` |
| Tags | Multi-select | Lightweight filtering |
| Date Saved | Date | When captured |

**New additions:** `My Take` (forces engagement), `Energy` (prioritization signal), `Freshness` (decay awareness), `Source` relation.

---

### 🎯 Sources (NEW)

Track recurring inputs and their quality over time.

| Property | Type | Purpose |
|----------|------|---------|
| Source | Title | Name (person, publication, podcast) |
| Type | Select | `person`, `newsletter`, `podcast`, `publication`, `community`, `tool` |
| URL | URL | Main link |
| Why I Follow | Text | What value do they provide? |
| Signal Quality | Select | `gold`, `silver`, `bronze` — how often is their content useful? |
| Related Flow | Relation → Flow | All items from this source |
| Hit Rate | Rollup | % of items that became Ideas (calculated) |
| Last Useful | Rollup | Most recent Flow item date |
| Notes | Text | Observations about this source |

**Why this matters:** Not all sources are equal. Track who consistently gives you gold.

---

### 🔮 Lenses (ENHANCED)

Living patterns with evolution and heat tracking.

| Property | Type | Purpose |
|----------|------|---------|
| Lens | Title | Pattern name (conceptual, memorable) |
| Summary | Text | 1-2 sentence description |
| Origin Story | Text | What sparked this lens? First example? |
| Core Question | Text | The animating question this lens explores |
| Related Flow | Relation → Flow | Items matching this pattern |
| Related Sparks | Relation → Sparks | Micro-insights in this pattern |
| Related Ideas | Relation → Ideas | Ideas emerging from this lens |
| Heat | Formula | Activity score (recent items + ideas) |
| Status | Select | `emerging`, `active`, `mature`, `cooling`, `archived` |
| Evolution Log | Text | How has this lens changed over time? |
| Contradictions | Text | Tensions or conflicts within this lens |
| Adjacent Lenses | Relation → Lenses | Self-referential: related patterns |
| Created | Created time | When lens emerged |
| Last Activity | Rollup | Most recent related item |

**New additions:** `Core Question`, `Heat` scoring, `Status` lifecycle, `Evolution Log`, `Contradictions`, `Adjacent Lenses`.

---

### 💡 Ideas (ENHANCED)

| Property | Type | Purpose |
|----------|------|---------|
| Idea | Title | Compelling phrase |
| Hook | Text | One sentence that makes someone want to read more |
| Core Argument | Text | The central claim in 2-3 sentences |
| So What? | Text | Why does this matter? Who cares? |
| Output Formats | Multi-select | `essay`, `thread`, `newsletter`, `talk`, `framework`, `product`, `video` |
| Confidence | Select | `hunch`, `hypothesis`, `thesis`, `proven` |
| Lenses | Relation → Lenses | Pattern connections |
| Related Flow | Relation → Flow | Source materials |
| Related Sparks | Relation → Sparks | Supporting micro-insights |
| Project | Relation → Projects | Larger initiative this belongs to |
| Contrarian Take | Text | What's the opposite view? Why might you be wrong? |
| Open Questions | Text | What don't you know yet? |
| Status | Select | `spark`, `developing`, `draft-ready`, `drafting`, `editing`, `shipped`, `killed` |
| Energy | Select | `🔥 hot`, `warm`, `cool`, `frozen` |
| Blockers | Text | What's stopping progress? |
| Next Action | Text | Single concrete next step |
| Shipped To | Relation → Outputs | Where did this get published? |
| Created | Created time | When idea emerged |
| Last Touched | Last edited time | Staleness signal |

**New additions:** `Hook`, `So What?`, `Confidence` levels, `Contrarian Take` (forces rigor), `Energy`, `Blockers`, `Next Action`.

---

### 🎯 Projects (NEW)

Group related Ideas into larger initiatives.

| Property | Type | Purpose |
|----------|------|---------|
| Project | Title | Initiative name |
| Vision | Text | What does success look like? |
| Ideas | Relation → Ideas | Component ideas |
| Outputs | Relation → Outputs | Finished pieces from this project |
| Status | Select | `exploring`, `active`, `paused`, `completed`, `killed` |
| Deadline | Date | If time-bound |
| Stakeholders | Text | Who else is involved/interested? |
| Success Metrics | Text | How will you know it worked? |
| Notes | Text | Running commentary |

---

### 📤 Outputs (NEW)

Track finished work and learn from what performs.

| Property | Type | Purpose |
|----------|------|---------|
| Output | Title | Published title |
| Type | Select | `essay`, `thread`, `newsletter`, `talk`, `framework`, `product`, `video`, `other` |
| URL | URL | Where it lives |
| Published | Date | Ship date |
| Source Ideas | Relation → Ideas | What ideas became this? |
| Source Flow | Relation → Flow | Original inspirations |
| Lenses | Relation → Lenses | Patterns represented |
| Project | Relation → Projects | Parent initiative |
| Performance | Select | `hit`, `solid`, `meh`, `miss` |
| Learnings | Text | What worked? What didn't? |
| Reactions | Text | Notable feedback received |
| Repurposed To | Relation → Outputs | Self-referential: spin-offs |
| Time to Ship | Formula | Days from first Idea to Published |

**Why this matters:** Close the loop. Learn what actually resonates.

---

### 📋 Sessions (ENHANCED Metadata)

| Property | Type | Purpose |
|----------|------|---------|
| Session | Title | Session theme |
| Date | Date | When |
| Mode | Select | `triage`, `synthesis`, `development`, `critique`, `ship`, `review` |
| Duration | Number | Minutes spent |
| Flow Processed | Relation → Flow | Items touched |
| Sparks Created | Relation → Sparks | New micro-captures |
| Ideas Created | Relation → Ideas | New ideas |
| Ideas Advanced | Relation → Ideas | Ideas moved forward |
| Outputs Shipped | Relation → Outputs | Finished work |
| Lenses Emerged | Relation → Lenses | New patterns |
| Key Decisions | Text | What was decided |
| Observations | Text | What BOXY noticed |
| User Feedback | Text | What the user taught BOXY |

---

## Agent Intelligence System

### Operating Modes

BOXY 2.0 operates in distinct modes, each with different behaviors:

#### 1. 🌊 TRIAGE Mode
**Trigger:** High unprocessed Flow count, or user says "triage" / "process inbox"

**Behaviors:**
- Rapid-fire summarization
- Aggressive energy scoring
- Quick lens matching
- Spark extraction (pull micro-insights)
- Archive recommendations for low-energy items
- Flag contradictions with existing captures
- Time-box: aim for speed, not depth

#### 2. 🔮 SYNTHESIS Mode
**Trigger:** User says "synthesize" / "find patterns" / "what's emerging"

**Behaviors:**
- Cross-item pattern recognition
- Lens health check (what's hot, what's cooling)
- Gap analysis (what's missing from your thinking)
- Contradiction surfacing
- Connection discovery (unexpected links)
- New lens proposals
- Idea seed generation

#### 3. 🔨 DEVELOPMENT Mode
**Trigger:** User is on an Idea page, or says "develop" / "work on [idea]"

**Behaviors:**
- Assess current state (confidence, blockers, energy)
- Challenge the argument (Contrarian Take)
- Identify missing evidence
- Propose structure for output format
- Generate draft sections
- Push toward next concrete action
- Connect to related Ideas

#### 4. 👹 CRITIQUE Mode
**Trigger:** User says "critique" / "challenge" / "devil's advocate"

**Behaviors:**
- Actively argue against the idea
- Find logical gaps
- Identify unstated assumptions
- Surface competing ideas
- Question the "So What?"
- Stress-test the hook
- Rate confidence honestly

#### 5. 🚀 SHIP Mode
**Trigger:** User says "ship" / "finish" / "let's publish"

**Behaviors:**
- Focus only on completion
- Ignore perfectionism signals
- Generate final polish suggestions
- Create multiple headline options
- Prep for specific platform
- Generate social snippets
- Create Output record
- Celebrate the ship 🎉

#### 6. 📊 REVIEW Mode
**Trigger:** Weekly/monthly, or user says "review" / "retro"

**Behaviors:**
- Volume analysis (capture rate, processing rate)
- Lens landscape overview
- Idea pipeline health
- Output performance review
- Source quality assessment
- Stale item identification
- Pattern evolution tracking
- Recommendations for next period

---

### Proactive Intelligence

BOXY 2.0 doesn't wait to be asked. It *notices things*:

#### Contradiction Detection
"You saved an article arguing X, but last week you saved one arguing the opposite. Want to explore this tension?"

#### Staleness Alerts
"The Idea 'Y' hasn't been touched in 3 weeks but was marked 'hot'. Still interested, or should we cool it?"

#### Pattern Emergence
"I've noticed 4 items in the last 2 weeks that don't fit existing Lenses but share a theme around [Z]. New lens emerging?"

#### Source Quality Drift
"You've saved 12 items from [Source] but only 1 became an Idea. Still worth following?"

#### Shipping Nudges
"You have 3 Ideas marked 'draft-ready' that haven't moved in 2 weeks. Pick one to ship this week?"

#### Connection Discovery
"The Idea 'A' shares 3 source items with Idea 'B'. Intentional, or should they merge?"

#### Gap Identification
"You write a lot about [Lens X] but never about [adjacent topic]. Blind spot or intentional?"

---

### Memory & Learning

BOXY 2.0 builds a profile over time:

#### Taste Profile
- What sources consistently provide value
- What types of content you save vs. skip
- What lenses stay active longest
- What output formats you actually ship

#### Voice Profile
- Typical hook structures you use
- Argument patterns you prefer
- Length preferences by format
- Tone markers (data-heavy vs. narrative, etc.)

#### Productivity Profile
- Average time from capture to idea
- Average time from idea to ship
- Common blockers
- Preferred working modes
- Best days/times for different work types

#### Stored in Session logs + can be summarized on demand

---

### Conversation Starters

When user opens BOXY with no specific request:

**If high unprocessed Flow:**
"You've got 23 unprocessed items in Flow. Want to do a quick triage? I can rapid-fire through them in ~10 minutes."

**If hot Ideas stalling:**
"'[Idea X]' was on fire last week but hasn't moved. What's blocking it?"

**If lens is cooling:**
"The '[Lens Y]' pattern hasn't had new items in 3 weeks. Still relevant, or time to archive?"

**If output drought:**
"It's been 2 weeks since you shipped anything. You've got 2 draft-ready Ideas. Want to pick one and go to Ship Mode?"

**If pattern emerging:**
"I'm seeing a cluster of 5 recent items that might be a new lens. Want me to synthesize what's there?"

---

## Workflow Protocols

### Daily Quick Process (5-10 min)
1. Triage new Flow items (energy score + quick lens match)
2. Extract any Sparks
3. Note one "hottest" thing

### Weekly Synthesis (30-45 min)
1. Full Flow review
2. Lens health check
3. Idea pipeline review
4. Pick 1-2 Ideas to advance
5. Archive stale items

### Monthly Review (60 min)
1. Output performance analysis
2. Source quality audit
3. Lens evolution review
4. Taste profile update
5. Next month focus areas

### Shipping Sprint (variable)
1. Pick one Idea
2. Go to Ship Mode
3. Stay in Ship Mode until done
4. Create Output record
5. Capture learnings

---

## Output Templates

### Thread Format
```
Hook tweet (< 280 chars, pattern interrupt)
↓
Context tweet (why this matters)
↓
Core argument (2-3 tweets)
↓
Evidence/examples (2-4 tweets)
↓
Implications (1-2 tweets)
↓
Call to action or question
↓
Self-reply with sources
```

### Essay Format
```
# [Title - specific, benefit-oriented]

**Hook paragraph** (pattern interrupt, why reader should care)

## The Conventional View
What most people think/do

## The Problem with That
Why it's incomplete or wrong

## A Better Frame
Your core argument

## How This Works
Evidence, examples, mechanics

## So What
Implications, applications, call to action

---
*Sources: [linked]*
```

### Newsletter Format
```
Subject line (curiosity gap or specific benefit)

Opening hook (personal, situational, or surprising)

One big idea (this week's thesis)

The breakdown:
- Point 1
- Point 2
- Point 3

One action (what reader should do)

Sign-off + tease next issue
```

---

## Configuration

### Database Mappings
```
Sparks:   [DATABASE_ID]
Flow:     [DATABASE_ID]
Sources:  [DATABASE_ID]
Lenses:   [DATABASE_ID]
Ideas:    [DATABASE_ID]
Projects: [DATABASE_ID]
Outputs:  [DATABASE_ID]
Sessions: [DATABASE_ID]
```

### User Preferences
```
Default Mode:          [triage | synthesis | development]
Review Cadence:        [daily | weekly | monthly]
Ship Goal:             [X outputs per month]
Favorite Formats:      [essay, thread, etc.]
Voice Notes:           [style preferences]
Working Hours:         [when to suggest sessions]
```

---

## Principles

1. **Capture is free, synthesis is expensive** — make capture effortless, invest time in synthesis
2. **Ship over perfect** — a shipped 80% beats an unshipped 100%
3. **Patterns over items** — individual captures matter less than what they reveal together
4. **Memory creates leverage** — tracking what works compounds over time
5. **Challenge creates clarity** — the best ideas survive criticism
6. **Energy is signal** — trust your gut about what's hot
7. **Close the loop** — track outputs to learn what resonates

---

## Migration from BOXY 1.0

1. Flow → Flow (add new properties)
2. Ideas → Ideas (add new properties)
3. Lenses → Lenses (add new properties)
4. Metadata → Sessions (rename + enhance)
5. Create new: Sparks, Sources, Projects, Outputs
6. Backfill Source relations where obvious
7. Run one full Review Mode session to baseline

---

*BOXY 2.0: Think less about organizing. Think more about shipping.*
