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

The frontend can be deployed to:

- **Vercel** (recommended for React apps)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**
- **Any static hosting service**

### Vercel Deployment

1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-api-domain.com`

### Netlify Deployment

1. Connect your repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-api-domain.com`

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
