# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Star Bites (Mission North Star) is a Spaceteam-style cooperative training game for plant trial preparation. Teams work together with a Commander reading tasks aloud while Crew members operate interactive cockpit controls in the correct sequence.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Production build
npm run preview      # Preview production build
```

## Architecture

### Tech Stack
- React 18 with Vite
- Tailwind CSS for styling
- Firebase Realtime Database for multiplayer sync (optional - falls back to localStorage)
- React Router for navigation
- Lucide React for icons

### State Management
- **AuthContext** (`src/contexts/AuthContext.jsx`): Password gate authentication
- **GameContext** (`src/contexts/GameContext.jsx`): Central game state management with Firebase sync

### Game Structure (4 Levels)
1. **Success Criteria** - Select mission objectives from DFMEA/UX Pyramid data
2. **Pretrial Checklist** - Spaceteam-style control panel game (Commander/Crew roles)
3. **Sampling Plan** - Configure test parameters
4. **Mission Report** - Summary and findings

### Key Files
- `src/App.jsx` - Router setup with protected routes
- `src/pages/Game.jsx` - Main game page that loads level components
- `src/pages/Home.jsx` - Team creation/joining
- `src/pages/Admin.jsx` - Game administration (separate password)
- `src/components/levels/` - Individual level implementations
- `src/components/controls/` - Interactive cockpit controls (PushButton, ToggleSwitch, PullLever, RotaryDial, HoldButton)
- `src/data/missionData.js` - Success criteria and DFMEA data
- `src/data/level1Tasks.js` - Pretrial checklist task definitions
- `src/firebase.js` - Firebase configuration and database operations

### Firebase Configuration
Firebase is optional. Set environment variables in `.env`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Without Firebase, the app uses localStorage (single-browser only).

### Game Mechanics
- Teams have max 4 players
- Commander sees task list in order, reads aloud to crew
- Crew sees shuffled controls and must activate them in correct sequence
- Wrong sequence = -50 points penalty
- Controls: PUSH (button), FLIP (switch), PULL (lever), TURN x3 (dial), HOLD (hold until 100%)
