# NBA Stats Web

Modern React web application for NBA statistics with Chinese localization. Built with an **API-first architecture** where the frontend consumes clean, pre-processed data from the backend.

## Features

- **API-First Design**: Frontend consumes clean, pre-processed data - no complex client-side processing
- **Games Today**: View NBA games for any date with live scores, featured games, and date navigation
- **Game Details**: Detailed game view with boxscore, player statistics, and pre-calculated top performers
- **Player Statistics**: View top players by various statistical categories (pre-calculated on backend)
- **Player Details**: Complete player information with stats, bio, and game log
- **Team Details**: Team information, leaders, recent games, and player roster
- **Team Standings**: Current NBA standings organized by conference (pre-formatted)
- **Home Dashboard**: Featured games, today's top performers, and season leaders
- **News Feed**: NBA news from Twitter/X
- **Auto-refresh**: Live games automatically refresh every 2 seconds
- **Date Navigation**: Browse games by date with timezone-aware date selection
- **Chinese Localization**: All UI text in Chinese with China Standard Time (GMT+8) support
- **Modern UI**: Clean, responsive design with loading states and error handling

## Tech Stack

- React 19
- Vite
- React Router
- Tailwind CSS v4
- Framer Motion (animations)

## Architecture

### API-First Pattern

This frontend follows an **API-first consumption pattern**:

1. **Clean Data**: Frontend receives only the data it needs, pre-processed by backend
2. **No Transformation**: All data extraction and processing happens on backend
3. **Simple Consumption**: Frontend components directly use API responses
4. **Type Safety**: JSDoc data models document expected data structures
5. **Minimal Logic**: Only UI formatting (dates, colors) happens on frontend

### Benefits

- **Simplified Code**: No complex data processing logic
- **Better Performance**: Calculations done once on backend
- **Easier Maintenance**: Data structure changes only affect backend
- **iOS-Ready**: Same API can be used for mobile apps
- **Consistency**: All pages follow the same pattern

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file for production:

```env
VITE_API_URL=https://your-api-domain.com
```

For local development, the app will use `http://localhost:3000` by default.

### Development

```bash
npm run dev
```

Runs on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Pages & Routes

### Home (`/`)
- Featured games (OT games, marquee matchups, closest scores)
- Today's top performers (points, rebounds, assists)
- Season leaders
- Upcoming games
- Latest news

### Games Today (`/games`)
- Games for selected date
- Date navigation
- Live game updates
- Game cards with scores and status

### Game Details (`/games/:gameId`)
- Complete game information
- Boxscore with starters and bench
- Pre-calculated top performers (with team info)
- Period-by-period scores
- Auto-refresh for live games

### Player Statistics (`/stats/players`)
- Top players by stat category
- Filter by season, position
- Pre-calculated top 9 players per category
- Stat rankings

### Player Details (`/players/:playerId`)
- Player bio and information
- Current season stats
- Regular season stats (all seasons, newest first)
- Advanced stats
- Last 5 games (game log)

### Team Details (`/teams/:teamAbbreviation`)
- Team information and record
- Team statistics grid
- Team leaders (offense & defense)
- Last 5 games and next 3 games
- Player roster with stats

### Team Standings (`/teams`)
- Conference standings
- Pre-formatted win percentages and games behind
- Team records and streaks

### News (`/news`)
- NBA news from Twitter/X
- Shams Charania tweets
- Images and timestamps

## API Integration

The frontend communicates with the backend API. All endpoints return clean, pre-processed data:

### Games
- `GET /api/nba/games/today?date=YYYYMMDD&featured=true` - Games with featured games
- `GET /api/nba/games/:gameId` - Game details with boxscore and top performers

### Players
- `GET /api/nba/players/:playerId` - Player details
- `GET /api/nba/players/:playerId/bio` - Player bio
- `GET /api/nba/players/:playerId/stats/current` - Current season stats
- `GET /api/nba/players/:playerId/stats` - Regular season stats (all seasons)
- `GET /api/nba/players/:playerId/stats/advanced` - Advanced stats
- `GET /api/nba/players/:playerId/gamelog` - Last 5 games

### Player Statistics
- `GET /api/nba/stats/players?season=2026|2&limit=100` - Top players by category

### Teams
- `GET /api/nba/teams/:teamAbbreviation` - Team details
- `GET /api/nba/teams/:teamAbbreviation/leaders` - Team leaders
- `GET /api/nba/teams/:teamAbbreviation/recent-games` - Recent games
- `GET /api/nba/standings` - Team standings

### Home Dashboard
- `GET /api/nba/home?date=YYYYMMDD` - Home page data (top performers + season leaders)

### News
- `GET /api/nba/news` - NBA news/tweets

See [nba-stats-api/README.md](../nba-stats-api/README.md) for detailed API documentation.

## Data Models

The frontend uses JSDoc-based data models for type documentation:

- `models/gameModels.js` - Game-related types
- `models/playerModels.js` - Player detail types
- `models/playerStatsModels.js` - Player stats types
- `models/standingsModels.js` - Standings types
- `models/teamModels.js` - Team-related types

These models document the expected structure of API responses, providing type safety and clear documentation.

## Project Structure

```
src/
├── components/        # Reusable components
│   ├── GameCard.jsx          # Game card component
│   └── Navigation.jsx        # Top navigation bar
├── pages/            # Page components
│   ├── Home.jsx              # Home dashboard
│   ├── GamesToday.jsx        # Games list with date navigator
│   ├── GameDetails.jsx       # Game details with boxscore
│   ├── PlayerStats.jsx       # Player statistics by category
│   ├── PlayerDetails.jsx     # Player details
│   ├── TeamDetails.jsx      # Team details
│   ├── TeamsList.jsx         # Team standings
│   └── News.jsx              # News feed
├── models/           # Data models (JSDoc types)
│   ├── gameModels.js
│   ├── playerModels.js
│   ├── playerStatsModels.js
│   ├── standingsModels.js
│   └── teamModels.js
├── config.js         # Configuration (API URLs)
├── App.jsx           # Main app with routing
└── main.jsx          # Entry point
```

## Deployment

### Vercel Deployment (Recommended)

Vercel is the recommended platform for deploying React/Vite applications.

**Quick Steps:**

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Set Environment Variable**
   - Add `VITE_API_URL` with your Railway API URL:
     ```
     VITE_API_URL=https://your-railway-app.up.railway.app
     ```

4. **Deploy**
   - Click "Deploy"
   - Get your frontend URL (e.g., `https://your-app.vercel.app`)

5. **Update Backend CORS**
   - In Railway, set `CORS_ORIGIN` to your Vercel URL

### Cloudflare Pages

The frontend can also be deployed to Cloudflare Pages:

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variable: `VITE_API_URL`

### Other Deployment Options

The frontend can also be deployed to:
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**
- **Any static hosting service**

For all platforms, remember to:
- Set `VITE_API_URL` environment variable
- Configure CORS on your backend
- Set output directory to `dist` (Vite default)

## Development Notes

### Client-Side Processing

The frontend performs **minimal client-side processing**:

- ✅ **Date formatting** - Display formatting only (e.g., `formatDateForDisplay`)
- ✅ **Status badges** - UI display helpers (e.g., `getStatusBadge`)
- ✅ **Color helpers** - UI styling (e.g., `getStreakColor`)
- ✅ **State management** - React state and effects
- ❌ **Data transformation** - All done on backend
- ❌ **Data extraction** - All done on backend
- ❌ **Calculations** - All done on backend

### API Response Consumption

All pages follow this pattern:

```javascript
// 1. Fetch from API
const response = await fetch(`${API_BASE_URL}/api/nba/endpoint`);
const data = await response.json();

// 2. Use data directly (no transformation)
setState(data);

// 3. Render using data
{data.field && <Component data={data.field} />}
```

## License

ISC
