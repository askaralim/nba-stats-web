# Mock Data for Local Testing

This project includes mock game data for testing different game statuses locally without needing a backend API.

## Setup

1. Create a `.env.local` file in the `nba-stats-web` directory (if it doesn't exist)
2. Add the following line to enable mock data:

```bash
VITE_USE_MOCK_DATA=true
```

3. Restart your development server

## Features

The mock data includes 10 games with different statuses:

### Game Statuses Tested:

1. **Scheduled Games** (2 games)
   - Games that haven't started yet
   - Status: `gameStatus: 1`
   - Status Text: "Scheduled"

2. **Live Games** (3 games)
   - Games currently in progress
   - Status: `gameStatus: 2`
   - Status Text: "Q4 2:34", "Q3 5:12", "Q4 0:45"
   - Includes close games, blowouts, and tied games

3. **Final Games** (5 games)
   - Completed games
   - Status: `gameStatus: 3`
   - Status Text: "Final" or "Final/OT"
   - Includes:
     - Close games (≤5 points difference) - marked as "exciting"
     - Overtime games - marked as "overtime"
     - Normal score differences

### Test Scenarios:

- **Total Games**: 10 games
- **In Progress**: 3 games (live)
- **Exciting Games**: 3 games (final with ≤5 point difference)
- **Overtime Games**: 1 game (period > 4)

### Featured Games Logic:

The mock data automatically identifies featured games based on:
1. **Overtime games** (highest priority)
2. **Marquee matchups** (LAL vs GSW, LAL vs BOS, etc.)
3. **Best game** (closest score difference)
4. **Live games**

## Usage

When `VITE_USE_MOCK_DATA=true` is set:

- **Home Page** (`/`): Shows mock featured games, other games, top performers, and season leaders
- **Games Today Page** (`/games`): Shows all 10 mock games with different statuses

## Mock Data Structure

The mock data follows the same structure as the real API:

```javascript
{
  date: "2024-01-15",
  totalGames: 10,
  games: [...], // All games
  featured: [...], // Featured games (max 3)
  other: [...] // Other games
}
```

Each game includes:
- `gameId`: Unique identifier
- `gameStatus`: 1 (scheduled), 2 (live), 3 (final)
- `gameStatusText`: Human-readable status
- `period`: Game period (0-5+)
- `awayTeam`: Team object with name, city, abbreviation, logo, wins, losses, score
- `homeTeam`: Team object with name, city, abbreviation, logo, wins, losses, score

## Disabling Mock Data

To disable mock data and use the real API:

1. Remove `VITE_USE_MOCK_DATA=true` from `.env.local`, or
2. Set `VITE_USE_MOCK_DATA=false`, or
3. Delete the `.env.local` file

**Note**: Mock data only works in development mode (`npm run dev`). It's automatically disabled in production builds.

## Files

- `src/utils/mockGameData.js`: Mock data definitions and helper functions
- `src/config.js`: Configuration that checks for `VITE_USE_MOCK_DATA` flag
- `.env.local`: Local environment variables (not committed to git)

## Testing GameStatsSummary Component

The mock data is perfect for testing the `GameStatsSummary` component which displays:
- Total games count
- In-progress games (with pulsing red indicator)
- Exciting games (≤5 points difference)
- Overtime games

With the mock data, you should see:
- **10 场比赛** (10 games total)
- **3 进行中** (3 in progress)
- **3 精彩** (3 exciting)
- **1 加时** (1 overtime)

