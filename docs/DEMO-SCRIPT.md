# ABBY Demo Script

> **For stakeholder presentations** | Last updated: 2026-01-02

---

## Quick Start (Skip Auth)

**Secret Navigation**: Invisible 70x70 tap zones in the top corners of every screen.

| Location | Action |
|----------|--------|
| **Top-Left** | Go BACK one screen |
| **Top-Right** | Go FORWARD one screen |
| **Top-Center** | Primary action (varies by screen) |

**To skip straight to the demo flow:**
1. Launch app → Login screen appears
2. Tap **top-right corner 14 times** to skip through auth/onboarding
3. You'll land on COACH_INTRO (Abby's welcome screen)

---

## Demo Flow (7 screens)

### 1. COACH_INTRO - "Meet Abby"
**What it shows:** Abby introduces herself with voice (or demo mode script)

**Talking points:**
- "This is Abby, your AI matchmaker"
- "She greets every user personally"
- "Notice the living shader background - it responds to the conversation"

**Action:** Tap "Start Interview" or top-right to advance

---

### 2. INTERVIEW - "The Conversation"
**What it shows:** Question cards with voice/text input

**Talking points:**
- "Abby asks personalized questions"
- "Users can speak or type their answers"
- "The background shifts colors based on question themes"
- "Progress indicator shows X/10 questions"

**Action:** Answer questions or top-right to skip to searching

---

### 3. SEARCHING - "Finding Your Match"
**What it shows:** Animated search with status messages

**Talking points:**
- "Abby analyzes responses in real-time"
- "Watch the status messages cycle"
- "The orb pulses with anticipation"

**Action:** Auto-advances after ~10 seconds, or top-right to skip

---

### 4. MATCH - "Your Match Bio"
**What it shows:** Match card with bio (no photo yet)

**Talking points:**
- "First, you see their personality - not their photo"
- "Compatibility score based on your conversation"
- "This reverses typical dating app dynamics"

**Action:** Tap "Continue" or top-right to advance

---

### 5. PAYMENT - "Reveal Gate"
**What it shows:** Payment screen to unlock photo

**Talking points:**
- "Premium experience - pay to reveal"
- "This is our monetization model"
- "Demo mode bypasses actual payment"

**Action:** Tap "Pay to Reveal" or top-right to skip

---

### 6. REVEAL - "The Big Moment"
**What it shows:** Match photo reveal with animation

**Talking points:**
- "The reveal moment users pay for"
- "Full photo with match details"
- "This is where the magic happens"

**Action:** Tap "Chat with Coach" or top-right to advance

---

### 7. COACH - "Ongoing Support"
**What it shows:** Abby helps prepare for the date

**Talking points:**
- "Abby becomes your dating coach"
- "Conversation tips, date ideas"
- "Ongoing relationship support"

**Action:** End of demo flow (can cycle back with top-left)

---

## Hamburger Menu Features

When authenticated, the **hamburger menu** (top-left, below secret zone) provides:

| Item | What it shows |
|------|---------------|
| **Profile** | User profile from /v1/me API |
| **Photos** | Photo gallery management |
| **Matches** | List of match candidates |
| **Settings** | Input mode (voice/text/both) |
| **Logout** | Return to login screen |

---

## Fallback Behaviors

| Scenario | What Happens |
|----------|--------------|
| No internet | Demo mode - scripted Abby responses |
| No auth token | Demo mode - all features work with mock data |
| Voice API down | Falls back to text interaction |
| Backend 404 | Demo data displayed |

---

## Visual Highlights to Mention

1. **Living Background** - GLSL shaders that breathe and respond
2. **Vibe Transitions** - Colors morph between screens (never cut)
3. **Glass UI** - BlurView with subtle transparency
4. **Orb States** - Center (Abby speaking) vs Docked (user focus)

---

## Known Issues (Don't Demo)

- [ ] New user registration fails (Nathan's Lambda blocker)
- [ ] Real voice requires backend connection

---

## Reset for Next Demo

1. Kill the app completely
2. Relaunch - starts fresh at LOGIN
3. Use secret nav to skip to desired starting point
