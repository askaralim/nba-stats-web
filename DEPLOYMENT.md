# Vercel Deployment Guide

## Quick Start

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   cd nba-stats-web
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

2. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

3. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Vercel will auto-detect Vite configuration

4. **Configure Project Settings**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `nba-stats-web` (if your repo has both frontend and backend)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. **Set Environment Variables**
   - Go to "Environment Variables" section
   - Add `VITE_API_URL` with your Railway API URL:
     ```
     VITE_API_URL=https://your-railway-app.up.railway.app
     ```
   - Make sure to add it for all environments (Production, Preview, Development)

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 1-2 minutes)

7. **Get Your Web URL**
   - Vercel provides a URL like: `https://your-app-name.vercel.app`
   - This is your frontend URL
   - Update Railway's `CORS_ORIGIN` to this URL

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   cd nba-stats-web
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_URL
   # Enter your Railway API URL when prompted
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | `https://your-app.up.railway.app` |

**Important**: 
- Vite requires the `VITE_` prefix for environment variables
- These variables are embedded at build time
- You need to rebuild after changing environment variables

## Post-Deployment

1. **Update Backend CORS**
   - Go to Railway dashboard
   - Update `CORS_ORIGIN` environment variable to your Vercel URL:
     ```
     CORS_ORIGIN=https://your-app-name.vercel.app
     ```

2. **Test Your App**
   - Visit your Vercel URL
   - Check browser console for any errors
   - Test API calls to ensure CORS is working

3. **Custom Domain (Optional)**
   - Go to Vercel project → Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

## Vercel Configuration

The `vercel.json` file includes:
- **Build settings**: Auto-detected from Vite
- **SPA routing**: Rewrites all routes to `index.html` for React Router
- **Framework**: Set to Vite for optimal performance

## Troubleshooting

### Build Fails
- Check Vercel build logs for errors
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility

### API Not Working
- Verify `VITE_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend allows requests from Vercel domain

### 404 Errors on Routes
- The `vercel.json` includes rewrites for React Router
- If still having issues, check the rewrites configuration

### Environment Variables Not Working
- Remember: Vite variables need `VITE_` prefix
- Rebuild after changing environment variables
- Check that variables are set for the correct environment

## Continuous Deployment

Vercel automatically deploys:
- **Production**: On push to main/master branch
- **Preview**: On every push to other branches
- **Pull Requests**: Creates preview deployments automatically

## Monitoring

- View deployment logs in Vercel dashboard
- Check analytics and performance metrics
- Set up alerts for failed deployments

## Example Workflow

1. Deploy backend to Railway → Get API URL
2. Deploy frontend to Vercel → Set `VITE_API_URL` to Railway URL
3. Update Railway `CORS_ORIGIN` to Vercel URL
4. Test both services
5. Done! 🎉

