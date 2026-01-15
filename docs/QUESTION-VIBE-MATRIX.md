# ABBY Question → Vibe Matrix

> Generated 2026-01-15 | 150 Questions | 6 Color Themes

This document shows exactly what visual state users will see for each question.

## How It Works

1. **Manual vibe_shift** (set in questions-schema.ts) takes precedence
2. **Sentiment analysis** kicks in when vibe_shift is `null`
3. Result: Color theme + Complexity + Shader texture

## Color Legend

| Theme | Color | Meaning |
|-------|-------|---------|
| 🔵 TRUST | Blue | Safe, casual, getting-to-know-you |
| 🟣 DEEP | Violet | Vulnerable, intimate, emotional |
| 🔴 PASSION | Red/Pink | Love, romance, connection |
| 🟢 GROWTH | Green | Goals, aspirations, development |
| 🟠 CAUTION | Orange | Boundaries, dealbreakers |
| ⚫ ALERT | Grey | Intervention, crisis |

---

## P0: DEALBREAKERS (Questions 1-20)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 1 | Do you want children someday? | 🟣 DEEP | Manual |
| 2 | Are you looking for a monogamous relationship? | 🟣 DEEP | Manual |
| 3 | How important is religion or spirituality in your life? | 🟣 DEEP | Manual |
| 4 | Do you smoke cigarettes? | 🔵 TRUST | Sentiment* |
| 5 | How often do you drink alcohol? | 🔵 TRUST | Sentiment* |
| 6 | What are your views on recreational drug use? | 🔵 TRUST | Sentiment* |
| 7 | Where do you see yourself living long-term? | 🔵 TRUST | Sentiment* |
| 8 | How do you feel about pets? | 🔵 TRUST | Manual |
| 9 | What is your political orientation? | 🟠 CAUTION | Manual |
| 10 | Is physical attraction important to you in a partner? | 🔴 PASSION | Sentiment* |
| 11 | Do you want to get married someday? | 🟣 DEEP | Manual |
| 12 | How do you feel about someone who has children from a previous relationship? | 🔵 TRUST | Sentiment* |
| 13 | What is your current relationship status? | 🔵 TRUST | Sentiment* |
| 14 | What is your dietary preference? | 🔵 TRUST | Sentiment* |
| 15 | How important is it that your partner shares your religious beliefs? | 🟣 DEEP | Manual |
| 16 | Are you willing to date someone significantly older or younger than you? | 🔵 TRUST | Sentiment* |
| 17 | How do you feel about long-distance relationships? | 🔵 TRUST | Sentiment* |
| 18 | Is shared ethnicity or cultural background important to you? | 🔵 TRUST | Sentiment* |
| 19 | Would you date someone with significant debt? | 🔵 TRUST | Sentiment* |
| 20 | How do you feel about dating someone in the military or with a demanding career? | 🔵 TRUST | Sentiment* |

---

## P1: CORE COMPATIBILITY (Questions 21-60)

### Friendship & Intimacy (21-32)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 21 | How do you prefer to spend quality time with a partner? | 🔵 TRUST | Manual |
| 22 | How comfortable are you sharing your deepest fears and insecurities? | 🟣 DEEP | Manual |
| 23 | How important is it for your partner to be your best friend? | 🔵 TRUST | Manual |
| 24 | How do you show love and appreciation? | 🔴 PASSION | Manual |
| 25 | How do you prefer to receive love and appreciation? | 🔴 PASSION | Manual |
| 26 | How much personal space do you need in a relationship? | 🔵 TRUST | Sentiment* |
| 27 | How do you typically respond when your partner is stressed or upset? | 🟢 GROWTH | Manual |
| 28 | When something good happens to you, what do you want from your partner? | 🔴 PASSION | Manual |
| 29 | How easily do you trust others? | 🟣 DEEP | Manual |
| 30 | Have you ever been cheated on? | 🟣 DEEP | Manual |
| 31 | Have you ever cheated on a partner? | 🟣 DEEP | Manual |
| 32 | How important is emotional availability in a partner? | 🔵 TRUST | Manual |

### Conflict Resolution (33-44)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 33 | When you have a disagreement, do you prefer to resolve it immediately or take time to cool off? | 🟠 CAUTION | Manual |
| 34 | How do you typically behave during arguments? | 🟠 CAUTION | Manual |
| 35 | Is it important to you to "win" arguments? | 🟠 CAUTION | Manual |
| 36 | How do you feel about apologizing when you're wrong? | 🟢 GROWTH | Manual |
| 37 | How do you handle criticism from a partner? | 🟠 CAUTION | Manual |
| 38 | Do you tend to bring up past issues during current arguments? | 🟠 CAUTION | Manual |
| 39 | How comfortable are you expressing anger? | 🟠 CAUTION | Manual |
| 40 | Would you ever give your partner the silent treatment? | ⚫ ALERT | Manual |
| 41 | How important is it to you that your partner validates your feelings even when they disagree? | 🟢 GROWTH | Manual |
| 42 | How do you feel about couples therapy? | 🟢 GROWTH | Manual |
| 43 | Can you compromise on things that matter to you? | 🟢 GROWTH | Manual |
| 44 | How do you recover after a big fight? | 🟢 GROWTH | Manual |

### Shared Meaning & Values (45-52)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 45 | What gives your life the most meaning? | 🟣 DEEP | Manual |
| 46 | How important is it that your partner shares your core values? | 🟣 DEEP | Manual |
| 47 | What role does honesty play in your relationships? | 🔵 TRUST | Manual |
| 48 | How do you define success? | 🟣 DEEP | Manual |
| 49 | How important is personal growth and self-improvement to you? | 🟢 GROWTH | Manual |
| 50 | What traditions are important to you to maintain or create? | 🔵 TRUST | Manual |
| 51 | How do you feel about giving back to the community? | 🟢 GROWTH | Manual |
| 52 | How aligned should a couple be on how to raise children? | 🟣 DEEP | Manual |

### Communication (53-60)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 53 | How do you prefer to communicate important things? | 🔵 TRUST | Sentiment* |
| 54 | How often do you need to check in with a partner throughout the day? | 🔵 TRUST | Sentiment* |
| 55 | How comfortable are you discussing your needs and wants? | 🟢 GROWTH | Manual |
| 56 | Are you a good listener? | 🔵 TRUST | Manual |
| 57 | How do you feel about sarcasm in a relationship? | 🔵 TRUST | Sentiment* |
| 58 | How do you handle secrets in a relationship? | 🔵 TRUST | Manual |
| 59 | How important is intellectual conversation to you? | 🟣 DEEP | Manual |
| 60 | Do you prefer directness or subtlety when communicating? | 🔵 TRUST | Sentiment* |

---

## P2: LIFESTYLE (Questions 61-110)

### Daily Life & Habits (61-75)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 61 | Are you a morning person or night owl? | 🔵 TRUST | Sentiment* |
| 62 | How would you describe your cleanliness/tidiness? | 🔵 TRUST | Sentiment* |
| 63 | How do you prefer to spend your weekends? | 🔵 TRUST | Manual |
| 64 | How often do you exercise? | 🔵 TRUST | Sentiment* |
| 65 | How important is healthy eating to you? | 🔵 TRUST | Sentiment* |
| 66 | How much TV/streaming do you typically watch? | 🔵 TRUST | Sentiment* |
| 67 | How do you feel about video games? | 🔵 TRUST | Sentiment* |
| 68 | How often do you like to travel? | 🔴 PASSION | Manual |
| 69 | What type of travel do you prefer? | 🔴 PASSION | Manual |
| 70 | How do you prefer to decompress after a stressful day? | 🔵 TRUST | Sentiment* |
| 71 | How important is spending time outdoors? | 🔵 TRUST | Sentiment* |
| 72 | Do you prefer city, suburbs, or countryside? | 🔵 TRUST | Sentiment* |
| 73 | How do you feel about cooking? | 🔵 TRUST | Sentiment* |
| 74 | How often do you eat out or order in? | 🔵 TRUST | Sentiment* |
| 75 | How punctual are you? | 🔵 TRUST | Sentiment* |

### Social Life (76-85)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 76 | How often do you like to socialize with friends? | 🔵 TRUST | Sentiment* |
| 77 | Do you prefer small gatherings or larger parties? | 🔵 TRUST | Sentiment* |
| 78 | How close are you with your family? | 🔵 TRUST | Manual |
| 79 | How often do you see your family? | 🔵 TRUST | Sentiment* |
| 80 | How important is it that your partner gets along with your friends? | 🔵 TRUST | Manual |
| 81 | How important is it that your partner gets along with your family? | 🔵 TRUST | Manual |
| 82 | How do you feel about your partner having close friends of the opposite sex? | 🟠 CAUTION | Manual |
| 83 | How do you feel about maintaining friendships with exes? | 🟠 CAUTION | Manual |
| 84 | How much do you value your partner's opinion on your friendships? | 🔵 TRUST | Sentiment* |
| 85 | Are you active on social media? | 🔵 TRUST | Sentiment* |

### Career & Finances (86-100)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 86 | How important is career success to you? | 🟢 GROWTH | Sentiment* |
| 87 | How many hours do you typically work per week? | 🔵 TRUST | Sentiment* |
| 88 | How do you feel about work-life balance? | 🔵 TRUST | Sentiment* |
| 89 | How would you feel about a partner who earns significantly more or less than you? | 🔵 TRUST | Sentiment* |
| 90 | How would you describe your spending habits? | 🔵 TRUST | Sentiment* |
| 91 | How do you feel about splitting expenses in a relationship? | 🔵 TRUST | Sentiment* |
| 92 | How important is financial security to you? | 🔵 TRUST | Sentiment* |
| 93 | Do you prefer combined or separate finances in a relationship? | 🔵 TRUST | Sentiment* |
| 94 | How do you feel about financial risk (investments, entrepreneurship)? | 🔵 TRUST | Sentiment* |
| 95 | How would you feel if your partner wanted to change careers significantly? | 🟢 GROWTH | Manual |
| 96 | How do you feel about one partner staying home to raise children? | 🔵 TRUST | Sentiment* |
| 97 | How much do you have saved for retirement? | 🔵 TRUST | Sentiment* |
| 98 | What's your view on large purchases (car, house)? | 🔵 TRUST | Sentiment* |
| 99 | How ambitious are you? | 🟢 GROWTH | Sentiment* |
| 100 | Would you relocate for your partner's career? | 🔵 TRUST | Sentiment* |

### Intimacy & Physical (101-110)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 101 | How important is physical intimacy in a relationship? | 🔴 PASSION | Manual |
| 102 | How often would you ideally be physically intimate? | 🔴 PASSION | Manual |
| 103 | How important is non-sexual physical affection (cuddling, hand-holding)? | 🔴 PASSION | Manual |
| 104 | How comfortable are you with public displays of affection? | 🔵 TRUST | Sentiment* |
| 105 | How adventurous are you in the bedroom? | 🔴 PASSION | Manual |
| 106 | How comfortable are you discussing sexual preferences? | 🟣 DEEP | Manual |
| 107 | How long do you typically wait before becoming physically intimate with someone new? | 🔵 TRUST | Sentiment* |
| 108 | How do you feel about watching adult content? | 🔵 TRUST | Sentiment* |
| 109 | How important is physical fitness/attractiveness in maintaining a relationship? | 🔵 TRUST | Sentiment* |
| 110 | How do you feel about sharing bedroom fantasies? | 🟣 DEEP | Manual |

---

## P3: PERSONALITY & PREFERENCES (Questions 111-150)

### Big Five Personality (111-125)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 111 | How would you describe yourself at a party? | 🔵 TRUST | Sentiment* |
| 112 | How do you recharge after a busy week? | 🔵 TRUST | Sentiment* |
| 113 | How open are you to trying new experiences? | 🟢 GROWTH | Manual |
| 114 | How interested are you in art, music, and culture? | 🔵 TRUST | Sentiment* |
| 115 | Do you prefer routine or spontaneity? | 🔵 TRUST | Sentiment* |
| 116 | How organized are you? | 🔵 TRUST | Sentiment* |
| 117 | How do you feel about deadlines and schedules? | 🔵 TRUST | Sentiment* |
| 118 | How empathetic would you say you are? | 🟢 GROWTH | Manual |
| 119 | How do you handle other people's emotions? | 🔵 TRUST | Sentiment* |
| 120 | How competitive are you? | 🔵 TRUST | Sentiment* |
| 121 | How often do you worry or feel anxious? | 🟣 DEEP | Sentiment* |
| 122 | How do you handle stress? | 🔵 TRUST | Sentiment* |
| 123 | How would your friends describe you? | 🔵 TRUST | Manual |
| 124 | What's your biggest strength? | 🟢 GROWTH | Manual |
| 125 | What's something you're working on improving about yourself? | 🟢 GROWTH | Manual |

### Attachment Style (126-132)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 126 | In relationships, do you tend to worry about your partner leaving? | 🟣 DEEP | Manual |
| 127 | How comfortable are you depending on others? | 🟣 DEEP | Manual |
| 128 | Do you find it easy to get close to others? | 🔵 TRUST | Manual |
| 129 | Do you often feel your partners want more intimacy than you're comfortable with? | 🟣 DEEP | Manual |
| 130 | How do you react when a partner needs space? | 🟠 CAUTION | Manual |
| 131 | How long have your past serious relationships lasted? | 🔵 TRUST | Sentiment* |
| 132 | What typically ends your relationships? | 🟣 DEEP | Manual |

### Interests & Hobbies (133-145)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 133 | What type of music do you enjoy most? | 🔵 TRUST | Sentiment* |
| 134 | What type of movies/shows do you enjoy? | 🔵 TRUST | Sentiment* |
| 135 | How do you feel about reading? | 🔵 TRUST | Sentiment* |
| 136 | What sports or physical activities do you enjoy? | 🔵 TRUST | Sentiment* |
| 137 | Do you have any creative hobbies? | 🔵 TRUST | Sentiment* |
| 138 | How do you feel about concerts and live events? | 🔵 TRUST | Sentiment* |
| 139 | Are you interested in sports as a spectator? | 🔵 TRUST | Sentiment* |
| 140 | How important is it to share hobbies with your partner? | 🔵 TRUST | Sentiment* |
| 141 | Are you learning anything new currently? | 🟢 GROWTH | Manual |
| 142 | What's on your bucket list? | 🔴 PASSION | Manual |
| 143 | What topic could you talk about for hours? | 🔵 TRUST | Manual |
| 144 | What's an unpopular opinion you hold? | 🔵 TRUST | Manual |
| 145 | What's something most people don't know about you? | 🟣 DEEP | Manual |

### Health & Wellness (146-150)

| # | Question | Vibe | Source |
|---|----------|------|--------|
| 146 | How do you prioritize mental health? | 🟢 GROWTH | Manual |
| 147 | Have you done any personal development work (therapy, coaching, etc.)? | 🟢 GROWTH | Manual |
| 148 | How important is work-life balance in your life? | 🔵 TRUST | Sentiment* |
| 149 | What does self-care look like for you? | 🟢 GROWTH | Manual |
| 150 | What does your ideal day off look like? | 🔵 TRUST | Manual |

---

## Summary Statistics

| Theme | Count | Percentage |
|-------|-------|------------|
| 🔵 TRUST | 74 | 49.3% |
| 🟣 DEEP | 28 | 18.7% |
| 🟢 GROWTH | 22 | 14.7% |
| 🟠 CAUTION | 13 | 8.7% |
| 🔴 PASSION | 12 | 8.0% |
| ⚫ ALERT | 1 | 0.7% |

### By Source

- **Manual vibe_shift**: 72 questions (48%)
- **Sentiment analysis**: 78 questions (52%)

---

## Visual Journey

As users progress through the 150 questions, they'll see this flow:

```
P0: DEALBREAKERS (1-20)
├── Starts with DEEP (children, commitment)
├── Mix of TRUST for basic preferences
├── CAUTION spike at political question
└── Returns to DEEP for marriage

P1: CORE COMPATIBILITY (21-60)
├── Opens with TRUST/PASSION (love languages)
├── DEEP section (vulnerability, trust, cheating)
├── CAUTION stretch (conflict resolution)
├── GROWTH section (therapy, compromise)
├── ALERT moment (silent treatment)
└── Closes with TRUST (communication)

P2: LIFESTYLE (61-110)
├── Mostly TRUST (daily life questions)
├── PASSION spike for travel & intimacy
├── CAUTION for friend boundaries
├── DEEP for sexual comfort
└── Returns to TRUST

P3: PERSONALITY (111-150)
├── TRUST for personality questions
├── GROWTH for self-improvement
├── DEEP for attachment & secrets
├── PASSION for bucket list
└── Ends with TRUST (ideal day)
```

---

*Note: Questions marked "Sentiment*" don't have a manual vibe_shift, so the sentiment analyzer determines their theme based on keyword matching.*
