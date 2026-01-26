# Mission North Star - Star Bites Training Game

A Spaceteam-style cooperative training game for plant trial preparation.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open http://localhost:5173 in your browser.

## How to Play

1. **Commander** starts a new mission and shares the 6-character code with crew
2. **Crew members** join using the mission code
3. **Commander** reads tasks aloud in order from their screen
4. **Crew** finds the matching control on their dashboard and operates it:
   - **PUSH** - Click the red button
   - **FLIP** - Click the toggle switch
   - **PULL** - Click the lever to pull it down
   - **TURN ×3** - Click the dial 3 times to rotate it
   - **HOLD** - Press and hold until the ring fills to 100%

⚠️ **Wrong sequence = -50 points penalty!**

## Game Structure

**Level 1: Pretrial Checklist**
- T-Minus 8 Weeks (6 tasks)
- T-Minus 4 Weeks (3 tasks)  
- T-Minus 2 Weeks (4 tasks)

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

## Building for Production

```bash
npm run build
npm run preview
```
