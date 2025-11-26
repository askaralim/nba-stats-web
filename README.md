# NBA Stats Web

Modern React web application for NBA statistics.

## Features

- **Games Today**: View all NBA games scheduled for today with live scores
- **Game Details**: Detailed view with score by period and game leaders
- **Player Details**: Player statistics (coming soon)
- **Auto-refresh**: Live games automatically refresh every 2 seconds
- **Modern UI**: Clean, flat design focused on data presentation

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
│   ├── GameCard.jsx
│   └── Navigation.jsx
├── pages/          # Page components
│   ├── GamesToday.jsx
│   ├── GameDetails.jsx
│   └── PlayerDetails.jsx
├── config.js       # Configuration (API URLs)
├── App.jsx         # Main app with routing
└── main.jsx        # Entry point
```

## API Integration

The frontend communicates with the backend API. Make sure to:

1. Set `VITE_API_URL` environment variable in production
2. Ensure CORS is properly configured on the backend
3. Backend should allow requests from your frontend domain
