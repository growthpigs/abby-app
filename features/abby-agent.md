# Abby Agent - Unified System Design

> The visual experience and data collection are ONE system. Abby doesn't ask questions - she has conversations that happen to extract 150 data points.

---

## Part 1: Creative Direction

### The Core Insight

**"Abby breathes color into her surroundings."**

She's not a chameleon adapting to her environment - she's the dominant force projecting her emotional state onto the world. When her mood shifts, the entire screen follows.

This inverts the typical UI paradigm. Instead of the app reflecting user actions, the app expresses Abby's evolving understanding of the user.

### The Curiosity Loop

Each question answered triggers a visual transformation. Users don't just complete a form - they witness Abby evolve.

**The psychology:**
- "What will she look like next?" pulls users forward
- Anticipation of transformation > anticipation of "done"
- Same mechanics as: Spotify Wrapped, slot machines, unboxing videos

**But better because:**
- Transformations aren't random - they reflect depth of sharing
- Surface answer = subtle shift
- Vulnerable answer = dramatic transformation

**The orb rewards honesty with beauty.**

### Visual Language

| Element | Meaning |
|---------|---------|
| Orb pulse speed | Engagement level (faster = more interested) |
| Orb color | Current vibe/emotional territory |
| Background tint | Orb's influence on environment |
| Glow intensity | How much Abby "knows" (coverage %) |

---

## Part 2: The 150 Data Points Problem

### Reframe: Questions vs Data Points

**Wrong approach:** 150 questions asked linearly
**Right approach:** 150 data points extracted from natural conversation

One sentence can fill multiple data points:
> "I love hiking solo on weekends"

Extracts:
- `outdoors_preference`: true
- `introvert_tendencies`: high
- `weekend_availability`: true
- `fitness_level`: active
- `solo_activities`: enjoys

**5 data points from 1 sentence. No questions asked.**

### The Conversation Strategy

Abby doesn't interrogate. She:

1. **Opens with warmth** - Gets user talking freely
2. **Listens for signals** - Extracts data from natural speech
3. **Goes deeper on threads** - "Tell me more about that hiking trip"
4. **Pivots strategically** - When a thread exhausts, moves to high-priority gaps
5. **Rewards progress** - Visual transformation + verbal acknowledgment

### Priority Hierarchy

Not all data points are equal:

| Priority | Type | Examples |
|----------|------|----------|
| P0 - Dealbreakers | Must match exactly | Wants kids, location, smoking |
| P1 - Core Compatibility | Gottman fundamentals | Conflict style, values, life goals |
| P2 - Lifestyle | Day-to-day fit | Schedule, hobbies, social energy |
| P3 - Preferences | Nice to have | Music taste, food preferences |

Abby targets P0/P1 first through natural conversation, lets P2/P3 emerge organically.

### The Jump Logic

User mentions "bananas" while answering Q3 → Abby recognizes this relates to Q10, Q15, Q21

Instead of: "Great, now question 4..."
She says: "Bananas! My favorite. Do you cook much?"

Now Q10 (food preferences), Q15 (domestic habits), Q21 (health consciousness) are all in play - from one natural pivot.

---

## Part 3: Technical Architecture

### Stack Decision

| Component | Choice | Why |
|-----------|--------|-----|
| Database | **Supabase** | Postgres + Auth + Realtime + Storage in one |
| Memory | **Mem0** | Conversational context across sessions |
| Vectors | **pgvector** (in Supabase) | No need for Pinecone at this scale |
| Voice | TBD (Fal.ai current, ElevenLabs planned) | Abby speaks |

**Why not Neon?** It's just a database. Supabase gives auth (phone/SMS), realtime (notifications), storage (photos), and edge functions (agent logic) - all things ABBY needs anyway.

**Why not Pinecone?** Overkill. pgvector in Postgres handles semantic search for 150 data points per user easily. Pinecone is for millions of vectors at sub-millisecond latency. ABBY's matching is deliberately delayed - no need.

### System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   USER SPEAKS / TYPES                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  SEMANTIC EXTRACTOR (LLM)                    │
│  Maps utterances → data points                               │
│  Detects: topics mentioned, sentiment, Gottman flags         │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────┐        ┌──────────────────────┐
│    MEM0 (Session)    │        │  SUPABASE (Persist)  │
│  - Current convo     │        │  - 150 data points   │
│  - User tendencies   │        │  - Coverage map      │
│  - Emotional state   │        │  - Match vectors     │
└──────────────────────┘        └──────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRIORITY ENGINE                           │
│  What's unanswered? What's high priority?                    │
│  What flows naturally from current topic?                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   ABBY'S RESPONSE                            │
│  + VIBE UPDATE (coverage % → visual state)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              VISUAL TRANSFORMATION                           │
│  Orb shifts → Background follows → User sees progress        │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema (Supabase)

```sql
-- Core user record
users (
  id uuid PRIMARY KEY,
  phone text UNIQUE,
  created_at timestamptz,
  profile_complete boolean DEFAULT false
)

-- The 150 data points (sparse - only filled ones stored)
profile_data (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  data_point_key text,        -- e.g., 'wants_children', 'conflict_style'
  value jsonb,                -- flexible: boolean, number, text, array
  confidence float,           -- how certain (explicit answer vs inferred)
  source_utterance text,      -- what the user actually said
  extracted_at timestamptz
)

-- Conversation history
conversations (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  session_id uuid,
  role text,                  -- 'user' or 'abby'
  content text,
  extracted_data jsonb,       -- data points pulled from this message
  vibe_state text,            -- what vibe was active
  created_at timestamptz
)

-- Coverage tracking
profile_coverage (
  user_id uuid PRIMARY KEY REFERENCES users,
  p0_complete float,          -- % of dealbreakers filled
  p1_complete float,          -- % of core compatibility
  p2_complete float,          -- % of lifestyle
  p3_complete float,          -- % of preferences
  total_complete float,       -- overall %
  updated_at timestamptz
)
```

---

## Part 4: Visual-Data Mapping

### Coverage → Vibe State

| Coverage % | Vibe | Orb Color | Background | Meaning |
|------------|------|-----------|------------|---------|
| 0-20% | TRUST | Blue | Calm liquid | "Getting to know you" |
| 20-40% | DEEP | Violet | Swirling currents | "Going deeper" |
| 40-60% | GROWTH | Green | Organic spread | "Building understanding" |
| 60-80% | CAUTION | Orange | Turbulent | "Almost there" |
| 80-100% | PASSION | Red/Pink | Paisley fractals | "Ready to match" |

### Micro-Transformations

Each data point filled = subtle shift within current vibe:
- Orb pulse slightly faster
- Glow radius increases
- Background tint intensifies

Major milestone (completing a priority tier) = vibe transition:
- Full color morph
- Background pattern change
- Abby verbal acknowledgment: "I feel like I'm really getting to know you"

### The Chameleon Effect (What We Built Today)

The orb doesn't just change itself - it projects onto the background via alpha-glow blending.

**Technical implementation:**
- Orb shaders return `vec4(color, alpha)` with glow falloff
- GPU framebuffer composites orb over background
- Orb's colors naturally tint everything beneath

**Creative meaning:**
- Abby's emotional state influences her entire world
- User witnesses her "breathing color into surroundings"
- Not adapting TO environment - shaping it

---

## Part 5: Production Requirements

### For MVP

| Component | Count | Notes |
|-----------|-------|-------|
| Orb shader | 1 (G4) | The talking orb with vibe colors |
| Background shaders | 5 | One per vibe state |
| Vibes | 5 | TRUST, DEEP, GROWTH, CAUTION, PASSION |
| Data points | 150 | Structured schema needed |

### Open Tasks

- [ ] Define the 150 data points schema (keys, types, priorities)
- [ ] Build semantic extractor prompt/logic
- [ ] Set up Supabase project + schema
- [ ] Connect Mem0 for session memory
- [ ] Build Abby's conversation loop (the agent)
- [ ] Map data point categories to vibe transitions
- [ ] Design Abby's voice/personality guidelines

---

## Changelog

| Date | Change |
|------|--------|
| 2024-12-10 | Initial document - unified creative + technical vision |
