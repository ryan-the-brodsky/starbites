# Mission North Star: Star Bites Training Game
## Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** January 17, 2026  
**Author:** Ryan Brodsky (Dual Enroll)  
**Target Audience:** Claude Code for autonomous development  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State](#current-state)
3. [Product Vision](#product-vision)
4. [User Stories & Personas](#user-stories--personas)
5. [Game Structure](#game-structure)
6. [Technical Architecture](#technical-architecture)
7. [Level Specifications](#level-specifications)
8. [Real-Time Multiplayer System](#real-time-multiplayer-system)
9. [Scoring & Progression](#scoring--progression)
10. [Admin Dashboard](#admin-dashboard)
11. [Fictional Product: Star Bites](#fictional-product-star-bites)
12. [UI/UX Requirements](#uiux-requirements)
13. [Dependencies & Content Requirements](#dependencies--content-requirements)
14. [Development Phases](#development-phases)
15. [Deployment](#deployment)

---

## Executive Summary

Mission North Star is a gamified training application for a company offsite event (end of February 2026). The game teaches plant trial preparation through a space mission narrative, where approximately 200 attendees (17-25 teams of 8-12 people) work together to "launch Star Bites into orbit."

**Core Concept:** A Spaceteam-style cooperative game with asymmetric roles where a Commander calls out tasks and Crew members must operate dashboard controls to complete them. The game features synchronized play where multiple team members can play simultaneously on different devices, all contributing to the same team state.

**Key Differentiator:** This is not a passive learning module—it's an active, time-pressured, collaborative experience that teaches pretrial checklist processes through gameplay.

---

## Current State

### Existing Codebase
- **Location:** `~/Documents/programming/spacebites/`
- **Stack:** Vite + React 18 + Tailwind CSS + Lucide React
- **Current Implementation:** Level 1 only (Pretrial Checklist) with Spaceteam-style asymmetric roles
- **Run Command:** `npm run dev` → `http://localhost:5173`

### What's Already Built (Level 1)
- Home screen with space theme
- Commander view: Sees tasks to call out verbally (cannot complete them)
- Crew view: Dashboard with interactive controls (button, lever, dial, switch, hold)
- 6-character game code for team joining
- Three phases within Level 1:
  - T-Minus 8 Weeks (6 tasks)
  - T-Minus 4 Weeks (3 tasks)
  - T-Minus 2 Weeks (4 tasks)
- Penalty system (-50 points for wrong sequence)
- Control types: PUSH (button), FLIP (switch), PULL (lever), TURN ×3 (dial), HOLD (press and hold)

### What Needs to Be Built
- Levels 2, 3, and 4
- Real-time synchronized team play (Firebase or similar)
- Password protection for site access
- Admin dashboard
- Team leaderboard
- Document upload functionality (Level 2)
- Resources panel with downloadable templates
- Mission briefing placeholders for each level
- Badges and certificate system
- Full fictional Star Bites product specifications

---

## Product Vision

### Narrative Theme
**"Mission North Star: Launch Star Bites into Orbit!"**

Players are part of an elite space mission team tasked with successfully running a plant trial to produce Star Bites, a futuristic food product designed for space travel. Each level represents a critical phase in preparing for launch.

### Success Metrics
- 200 attendees can play simultaneously without technical issues
- All teams complete at least 3 of 4 levels within 45 minutes
- Training content is absorbed through active gameplay (not passive reading)

---

## User Stories & Personas

### Persona: Team Commander (1 per team)
- Has a laptop with the Commander view open
- Sees the task queue and must verbally communicate tasks to crew
- Cannot complete tasks themselves—must coordinate verbally
- Sees which tasks are completed and current team score

### Persona: Team Crew Member (7-11 per team)
- Has a laptop with the Crew view open
- Sees a dashboard of controls without knowing which to activate
- Must listen for Commander's verbal instructions
- Can activate controls; wrong activation = penalty

### Persona: Event Admin (1-2 people)
- Accesses admin dashboard before and during the event
- Can view all teams and their progress
- Can pause/resume the game globally
- Can adjust timers or reset team progress if needed
- Can export final results

### User Stories

1. **As a Commander**, I want to see a clear list of tasks I need to call out so I can guide my team efficiently.

2. **As a Crew Member**, I want to see clearly labeled controls so I can quickly find and activate the correct one when instructed.

3. **As a Team**, we want synchronized state across all our devices so everyone sees the same progress in real-time.

4. **As an Admin**, I want to pause the game globally if there's a technical issue or announcement.

5. **As a Participant**, I want to download reference materials during the game so I can apply them to challenges.

---

## Game Structure

### Overview
- **Duration:** 45 minutes active gameplay
- **Teams:** 17-25 teams of 8-12 people each
- **Devices:** Multiple laptops per team (synchronized play)
- **Access:** Single shared password to enter the site

### Four Levels

| Level | Name | Theme | Interaction Style |
|-------|------|-------|-------------------|
| 1 | Pretrial Checklist | "Prepare the spacecraft for launch" | Spaceteam-style: Commander calls, Crew operates controls |
| 2 | Sampling Plan Creation | "Calibrate instruments for Star Bites production" | Document upload + configuration interface |
| 3 | Data Collection & Analysis | "Analyze telemetry data from the trial" | Data interpretation, anomaly detection, Q&A |
| 4 | Plant Trial Summary & Report | "Transmit final mission report to HQ" | Report compilation from previous levels |

### Progression Rules
- Levels unlock sequentially (must complete Level 1 to access Level 2)
- All team members see the same level state (synchronized)
- Scoring is accuracy-based only (no time bonuses)
- Teams can access Resources panel at any time during gameplay

---

## Technical Architecture

### Frontend Stack
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Context + real-time sync

### Backend Requirements
- **Real-time Database:** Firebase Realtime Database or Firestore
- **Authentication:** Single shared password (no user accounts)
- **File Upload:** Firebase Storage for document uploads (Level 2)
- **Hosting:** Firebase Hosting or Vercel

### Key Technical Decisions

#### Real-Time Synchronization
All team members must see identical game state. Implementation approach:

```
Firebase Structure:
/games
  /{gameCode}
    /meta
      teamName: string
      createdAt: timestamp
      currentLevel: number
      totalScore: number
    /level1
      currentPhase: number
      completedTasks: string[]
      score: number
    /level2
      uploadedDocs: { uxPyramid: url, dfmea: url }
      samplingPlan: { frequency: string, volume: string, ... }
      evaluationScore: number
    /level3
      answers: { q1: string, q2: string, ... }
      score: number
    /level4
      report: { summary: string, findings: string, recommendations: string }
      score: number
    /players
      /{odUplayerId}
        role: 'commander' | 'crew'
        lastActive: timestamp
```

#### Password Protection
- Single password entered on landing page
- Password stored in environment variable
- Session stored in localStorage after successful entry
- No persistent user accounts

---

## Level Specifications

### Level 1: Pretrial Checklist
**Already implemented - maintain existing Spaceteam mechanics**

**Commander View:**
- Sees ordered list of tasks to call out
- Current task highlighted with "CALL NOW"
- Shows task name (what to say) and control type hint
- Cannot interact with controls

**Crew View:**
- Dashboard of all controls (randomized positions)
- Each control shows: icon, instruction (PUSH/FLIP/PULL/TURN/HOLD), task name
- Activating wrong control in sequence = -50 points penalty
- Controls: button, switch, lever, dial (3 clicks), hold (press and hold until 100%)

**Phases (from actual pretrial checklist):**
- T-Minus 8 Weeks: 6 tasks (pilot results, material lead times, processing flowcharts, ingredient setup, dummy codes, ETQ workflow)
- T-Minus 4 Weeks: 3 tasks (ETQ approval, PO placement, trial BOM request)
- T-Minus 2 Weeks: 4 tasks (pretrial call scheduled, BOM approved, material on-site, badge access)

**Task-to-Control Mapping:** Transform real task names into space mission language:
- "Pilot/trial results communicated to technical team" → "TRANSMIT PILOT DATA TO TECH CREW"
- "Material lead times confirmed" → "CONFIRM MATERIAL TRAJECTORY TIMING"
- etc.

---

### Level 2: Sampling Plan Creation
**New level to implement**

**Concept:** Teams apply their UX Pyramid and DFMEA (completed earlier in the day on paper) to create a sampling plan for Star Bites production. The game evaluates how well their plan addresses their stated consumer needs and failure modes.

**Interaction Flow:**
1. **Document Upload Phase**
   - Teams upload their completed UX Pyramid document (standardized template)
   - Teams upload their completed DFMEA document (standardized template)
   - System parses key elements from structured templates

2. **Sampling Plan Configuration**
   - Interface shows the Star Bites process flow (see Fictional Product section)
   - Teams configure sampling parameters:
     - Sample frequency (dropdown: every 30 min / 1 hr / 2 hr / 4 hr)
     - Sample volume (dropdown: 25g / 50g / 100g / 200g)
     - Sampling points along process flow (checkboxes at each process step)
     - Tests to run at each point (multi-select from predefined list)
   - Visual representation updates in real-time

3. **Evaluation**
   - AI (or rule-based system) evaluates alignment:
     - Do sampling points address identified failure modes from DFMEA?
     - Do tests chosen align with consumer needs from UX Pyramid?
     - Is sampling frequency appropriate for identified critical control points?
   - Score based on coverage and appropriateness (not speed)

**UI Elements:**
- Split view: Process flow diagram (left), Configuration panel (right)
- Process flow shows: Mixing → Forming → Gelling → Portioning → Packaging
- Each step is clickable to add sampling point
- Upload area with drag-and-drop for documents
- Submit button for evaluation

**Scoring:**
- Points for each correctly identified sampling point
- Points for appropriate test selection
- Points for alignment with uploaded documents
- No penalties for incorrect choices (this is a learning exercise)

---

### Level 3: Data Collection & Analysis
**New level to implement**

**Concept:** Teams analyze mock production data from a Star Bites trial run, identify anomalies, interpret results, and make recommendations.

**Interaction Flow:**
1. **Data Dashboard Presentation**
   - Teams see a mock Mission Control dashboard with:
     - Temperature curves over 12-hour production run
     - Moisture levels at each process step
     - Throughput rates per hour
     - Quality scores from sampling (ties back to Level 2)
   - Some data points contain intentional anomalies

2. **Analysis Challenges**
   - Multiple-choice questions:
     - "At which hour did the batch go out of spec?" (Hour 4 / Hour 8 / Hour 10 / Hour 12)
     - "Which parameter should be adjusted to fix the yield drop?" (Temperature / Moisture / Throughput / Gel time)
   - "Spot the error" challenge: identify data entry mistakes
   - "Flag the outlier" challenge: click on anomalous data points in chart

3. **Recommendation Phase**
   - Teams select recommended actions from a list
   - Multiple correct answers possible

**UI Elements:**
- Dashboard with charts (bar charts, line graphs)
- Interactive charts where clicking selects answer
- Question cards that slide in one at a time
- Clear visual feedback on answers

**Scoring:**
- Points per correct answer
- No time pressure
- All teams see the same data (standardized scenario)

---

### Level 4: Plant Trial Summary & Report
**New level to implement**

**Concept:** Teams compile their findings from Levels 1-3 into a structured mission report, demonstrating they understand the full trial process.

**Interaction Flow:**
1. **Report Template**
   - Structured form with sections:
     - Executive Summary (text area, 200 char min)
     - Key Findings (text area, bullet points encouraged)
     - Recommendations (text area)
   - Pre-populated prompts to guide responses

2. **Reference Access**
   - Teams can view their Level 2 sampling plan
   - Teams can view Level 3 analysis results
   - Resources panel available

3. **Submission**
   - Submit report for evaluation
   - AI or rule-based system checks for:
     - Minimum content in each section
     - Keywords related to Star Bites production
     - Logical consistency with previous level choices

**UI Elements:**
- Clean report template interface
- Tabs or accordion for different sections
- Word/character count display
- "View Previous Work" sidebar
- Submit button with confirmation

**Scoring:**
- Points for completing each section
- Bonus points for incorporating specific learnings from Levels 2-3
- All teams can complete this level (no failure state)

---

## Real-Time Multiplayer System

### Team Creation & Joining

**Flow:**
1. User enters site password on landing page
2. User chooses: "Start New Mission" or "Join Mission"
3. **Start New Mission:**
   - Enter team name
   - System generates 6-character alphanumeric code
   - User becomes Commander by default (can switch)
   - Displays code to share with crew
4. **Join Mission:**
   - Enter 6-character code
   - Enter display name (optional)
   - Joins as Crew member
   - Sees current game state immediately

### Synchronized State Requirements

**All team members must see in real-time:**
- Current level and phase
- Completed tasks/challenges
- Team score
- Number of connected players
- Commander's current task (Crew sees "Waiting for command...")

**Firebase listeners to implement:**
```javascript
// Subscribe to game state
onValue(ref(db, `games/${gameCode}`), (snapshot) => {
  // Update local state with server state
});

// Update on task completion
set(ref(db, `games/${gameCode}/level1/completedTasks`), [...completedTasks, taskId]);
```

### Connection Handling
- Show "Reconnecting..." overlay if connection drops
- Maintain game state on server (client can rejoin)
- Show active player count in header
- Graceful degradation if Firebase unavailable (show error, suggest refresh)

---

## Scoring & Progression

### Scoring Philosophy
- **Accuracy-based only:** No time bonuses, no efficiency bonuses
- **Goal:** Get it right, not fast
- **Learning focus:** Completing all levels matters more than high score

### Point Structure

| Level | Max Points | Breakdown |
|-------|------------|-----------|
| Level 1 | 1000 | ~75-100 points per task, -50 penalty for wrong sequence |
| Level 2 | 1000 | Points for sampling coverage, test selection, document alignment |
| Level 3 | 1000 | Points per correct answer/identification |
| Level 4 | 1000 | Points for section completion + bonus for incorporating learnings |
| **Total** | **4000** | |

### Leaderboard Display

**During Gameplay:**
- Shows after completing each level
- Top 3 teams: Show rank + exact score
- Teams 4+: Show rank only (no score)
- Current team always highlighted

**Structure:**
```
🥇 Alpha Squadron     2,450 pts
🥈 Nebula Crew        2,380 pts  
🥉 Star Voyagers      2,290 pts
4. Your Team ← (highlighted)
5. Cosmic Rangers
6. Mission Delta
...
```

### Badges
Display in-app only (no export needed):
- **Launch Engineer** — Complete Level 1
- **Calibration Specialist** — Complete Level 2
- **Data Analyst** — Complete Level 3
- **Mission Commander** — Complete Level 4

### Certificate
- Generic "Mission Accomplished" certificate displayed on screen after Level 4
- Space-themed design with all 4 badge icons
- Team name displayed
- Users can screenshot to save

---

## Admin Dashboard

### Access
- Separate URL path: `/admin`
- Protected by different password (admin-only)

### Features Required

#### Real-Time Monitoring
- View all active teams in a table:
  - Team name
  - Current level
  - Current score
  - Players connected
  - Last activity timestamp
- Auto-refresh every 5 seconds

#### Leaderboard Mirror
- Same view as players see
- Shows all teams with scores

#### Team Management
- Click team row to expand details
- **Reset Progress:** Clear team's progress (confirmation required)
- **Adjust Score:** Manual score adjustment with reason field

#### Global Controls
- **Pause Game:** Freezes all team timers, shows "Game Paused" overlay to all players
- **Resume Game:** Removes pause overlay, continues
- **Timer Controls:**
  - Display: Current session timer (if implemented)
  - Start/stop global countdown
  - Extend time (+5 min, +10 min buttons)

#### Data Export
- **Export Results (CSV):**
  - Team name
  - Final score
  - Completion time
  - Levels completed
  - Badges earned

### Admin UI
- Clean table layout
- Action buttons with confirmation dialogs for destructive actions
- Status indicators (green = active, yellow = idle, red = disconnected)

---

## Fictional Product: Star Bites

### Product Description
**Star Bites** are single-serve nutrient-dense gel cubes designed for space travel. They come in sweet and savory variants, providing complete nutrition in a convenient, zero-crumb format ideal for microgravity environments.

### Variants
1. **Sweet:** Citrus Sunrise, Berry Nebula, Tropical Orbit
2. **Savory:** Umami Station, Herb Galaxy, Smoky Comet

### Specifications (for game reference materials)

#### Ingredient List (Savory - Umami Station)
| Ingredient | Function | Spec |
|------------|----------|------|
| Water | Base, hydration | Purified, <10 ppm TDS |
| Pea Protein Isolate | Protein source | 85% protein, mesh 100 |
| Sunflower Oil | Fat, mouthfeel | High oleic, <2% FFA |
| Mushroom Extract | Umami flavor | Shiitake-derived, 10% glutamates |
| Gellan Gum | Gelling agent | Low-acyl, 0.3-0.5% |
| Salt | Flavor | Iodized, fine grain |
| Natural Flavors | Taste profile | Savory blend |
| Potassium Chloride | Electrolyte | USP grade |
| B-Vitamin Complex | Fortification | B1, B2, B6, B12 |

#### Nutritional Targets (per 50g cube)
- Calories: 120-150
- Protein: 15g
- Fat: 5g
- Carbohydrates: 8g
- Sodium: 200mg
- Potassium: 300mg

### Process Flow
```
[Raw Materials Receiving]
        ↓
[Dry Ingredient Blending] ← Checkpoint: Particle size, moisture
        ↓
[Hydration/Mixing] ← Checkpoint: Temperature, viscosity
        ↓
[Heating/Gelling] ← Checkpoint: Gel strength, temperature
        ↓
[Portioning] ← Checkpoint: Weight accuracy, dimensions
        ↓
[Cooling/Setting] ← Checkpoint: Final texture, temperature
        ↓
[Packaging] ← Checkpoint: Seal integrity, label accuracy
        ↓
[Quality Release]
```

### Critical Control Points (for Level 2)
1. **Mixing Temperature:** 65-70°C (affects gel formation)
2. **Gel Time:** 45-60 seconds (affects texture)
3. **Portioning Weight:** 50g ±2g
4. **Cooling Rate:** Must reach <10°C within 30 minutes
5. **Seal Integrity:** Vacuum seal, <1% leak rate

### Common Failure Modes (for Level 2 DFMEA reference)
- Gel doesn't set properly (wrong temperature or gellan concentration)
- Uneven portioning (calibration drift)
- Off-flavors (ingredient degradation)
- Texture too firm/soft (gel time variation)
- Packaging seal failure (equipment maintenance)

---

## UI/UX Requirements

### Visual Theme
- Space mission aesthetic (dark blues, blacks, with cyan and orange accents)
- Starfield background (subtle, animated)
- Mission Control dashboard feel
- Rocket progress visualization

### Design Tokens
```css
/* Colors */
--bg-primary: #0f172a;      /* Slate 900 */
--bg-secondary: #1e293b;    /* Slate 800 */
--accent-primary: #22d3ee;  /* Cyan 400 */
--accent-secondary: #f97316; /* Orange 500 */
--success: #22c55e;         /* Green 500 */
--warning: #eab308;         /* Yellow 500 */
--error: #ef4444;           /* Red 500 */
--text-primary: #f8fafc;    /* Slate 50 */
--text-secondary: #94a3b8;  /* Slate 400 */

/* Typography */
--font-display: 'Space Grotesk', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
```

### Responsive Requirements
- Primary target: Laptop screens (1366x768 and up)
- Must be usable on tablets (fallback)
- Mobile not required but should not break

### Key UI Components

#### Header (persistent)
- Mission North Star logo/title
- Team name
- Connected players indicator
- Current score
- Resources button
- Leaderboard button

#### Progress Visualization
- Rocket moving toward North Star
- Phase progress bar within each level
- Badge display area

#### Control Dashboard (Level 1)
- Grid of interactive controls
- Clear visual states: default, active, completed, error
- Animation feedback on interaction

#### Resources Panel (modal/drawer)
- List of downloadable documents
- Accessible at any time
- Documents:
  - Pretrial Checklist Template
  - Plant Trial Summary Format
  - UX Pyramid Template
  - DFMEA Template
  - Star Bites Process Flow
  - Ingredient Specifications
  - Packaging Requirements

---

## Dependencies & Content Requirements

### Content to Be Provided by Client (before final build)
1. **Pretrial Checklist document** — Actual company checklist for Level 1 task transformation
2. **Plant Trial Summary format** — Template structure for Level 4
3. **UX Pyramid template** — Standardized format teams complete before game
4. **DFMEA template** — Standardized format teams complete before game

### Content Claude Code Should Generate
1. Star Bites process flow diagram (visual)
2. Ingredient specifications document
3. Packaging requirements document
4. Level 3 mock production data (with intentional anomalies)
5. Level 3 analysis questions
6. Space-themed task names for Level 1 (transform real tasks)

### Technical Dependencies
- Firebase project (Realtime Database + Storage + Hosting)
- Environment variables for passwords
- Node.js 18+ for build

---

## Development Phases

### Phase 1: Demo Ready (Target: Early next week)
**Goal:** Demonstrable prototype to show stakeholders

**Deliverables:**
- Password protection on landing page
- Level 1 fully functional with real-time sync (Firebase)
- Team creation/joining flow
- Basic leaderboard (mock data OK)
- Space theme polished

**Not included in Phase 1:**
- Levels 2-4
- Admin dashboard
- Document upload
- Full scoring system

### Phase 2: Full Build (Target: Mid-February)
**Goal:** Complete game ready for testing

**Deliverables:**
- All 4 levels implemented
- Real-time sync across all levels
- Full leaderboard with live data
- Resources panel with placeholder documents
- Badges and certificate
- Admin dashboard (basic version)

### Phase 3: Polish & Content (Target: End of February)
**Goal:** Production-ready for offsite

**Deliverables:**
- Real content loaded (from client documents)
- Admin dashboard full features
- Load testing (200 simultaneous users)
- Bug fixes from testing
- Mission briefing content (if client provides)

---

## Deployment

### Recommended Stack
- **Hosting:** Firebase Hosting (free tier sufficient for event)
- **Database:** Firebase Realtime Database
- **File Storage:** Firebase Storage (for Level 2 uploads)
- **Domain:** Use Firebase default or connect custom domain

### Environment Variables
```
VITE_SITE_PASSWORD=<shared password for all attendees>
VITE_ADMIN_PASSWORD=<admin-only password>
VITE_FIREBASE_API_KEY=<firebase api key>
VITE_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://<project>.firebaseio.com
VITE_FIREBASE_PROJECT_ID=<project>
VITE_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
```

### Deployment Commands
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and init
firebase login
firebase init

# Deploy
npm run build
firebase deploy
```

### Pre-Event Checklist
- [ ] Load test with 200+ concurrent connections
- [ ] Verify all documents in Resources are downloadable
- [ ] Test admin dashboard functions
- [ ] Confirm passwords are set correctly
- [ ] Clear any test data from database
- [ ] Have backup plan if Firebase has issues (local-only fallback?)

---

## Appendix: Task Reference for Level 1

### Phase 1: T-Minus 8 Weeks

| Real Task | Game Task Name | Control Type |
|-----------|----------------|--------------|
| Pilot/trial results communicated to technical team | TRANSMIT PILOT DATA TO TECH CREW | Button (PUSH) |
| Material lead times confirmed | CONFIRM MATERIAL TRAJECTORY TIMING | Lever (PULL) |
| Processing flowcharts drafted | INITIALIZE PROCESSING FLOWCHART SEQUENCE | Dial (TURN ×3) |
| New ingredients set up in systems | CONFIGURE INGREDIENT PAYLOAD MATRIX | Switch (FLIP) |
| Dummy code requests completed | EXECUTE DUMMY CODE PROTOCOL | Button (PUSH) |
| ETQ workflow for new materials kicked off | ENGAGE ETQ MATERIAL WORKFLOW | Hold (HOLD) |

### Phase 2: T-Minus 4 Weeks

| Real Task | Game Task Name | Control Type |
|-----------|----------------|--------------|
| Material approved in ETQ | VERIFY ETQ MATERIAL CLEARANCE | Switch (FLIP) |
| PO placed with lead time matching trial | LOCK IN PURCHASE ORDER TRAJECTORY | Lever (PULL) |
| Trial BOM creation requested | REQUEST TRIAL BOM COMPILATION | Button (PUSH) |

### Phase 3: T-Minus 2 Weeks

| Real Task | Game Task Name | Control Type |
|-----------|----------------|--------------|
| Pretrial call scheduled | SCHEDULE PRETRIAL COMMS WINDOW | Dial (TURN ×3) |
| Trial BOM approved | AUTHORIZE TRIAL BOM FOR LAUNCH | Switch (FLIP) |
| Trial material on-site or ETA on track | CONFIRM MATERIAL ARRIVAL VECTOR | Hold (HOLD) |
| Badge access completed | ACTIVATE CREW SECURITY CLEARANCE | Button (PUSH) |

---

## End of PRD

**Notes for Claude Code:**
- This document is the single source of truth for the project
- Prioritize Phase 1 deliverables first
- Maintain existing Level 1 code structure where possible
- Ask for clarification if any requirement is ambiguous
- Client will provide additional content documents separately
