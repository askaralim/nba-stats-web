# NBA Stats Web

Modern React web application for NBA statistics with Chinese localization.

## Features

- **Games Today**: View NBA games for any date with live scores and date navigation
- **Game Details**: Detailed game view with boxscore, player statistics, and period-by-period scores
- **Player Statistics**: View top players by various statistical categories (points, assists, rebounds, etc.)
- **Team Standings**: Current NBA standings organized by conference
- **Auto-refresh**: Live games automatically refresh every 2 seconds
- **Date Navigation**: Browse games by date with timezone-aware date selection
- **Chinese Localization**: All UI text in Chinese with China Standard Time (GMT+8) support
- **Modern UI**: Clean, responsive design with loading states and error handling

## Tech Stack

- React 19
- Vite
- React Router
- Tailwind CSS

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

**Detailed instructions**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

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

## Project Structure

```
src/
├── components/      # Reusable components
│   ├── GameCard.jsx      # Game card component
│   └── Navigation.jsx    # Top navigation bar
├── pages/          # Page components
│   ├── GamesToday.jsx    # Games list with date navigator
│   ├── GameDetails.jsx   # Game details with boxscore
│   ├── PlayerStats.jsx   # Player statistics by category
│   ├── TeamsList.jsx     # Team standings
│   └── PlayerDetails.jsx # Player details (placeholder)
├── config.js       # Configuration (API URLs)
├── App.jsx         # Main app with routing
└── main.jsx        # Entry point
```

## Routes

- `/` or `/games` - Games Today page
- `/games/:gameId` - Game Details page
- `/teams` - Team Standings page
- `/stats/players` - Player Statistics page

## API Integration

The frontend communicates with the backend API. Make sure to:

1. Set `VITE_API_URL` environment variable in production
2. Ensure CORS is properly configured on the backend
3. Backend should allow requests from your frontend domain
