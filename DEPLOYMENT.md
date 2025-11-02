# Vercel Deployment Guide

This guide will help you deploy the Ampd Device Savings API to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional): `npm i -g vercel`
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Leave empty (we use `vercel-build` script)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

3. **Environment Variables** (if needed):
   - Add any environment variables in the Vercel dashboard
   - For this project, no additional env vars are required

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: ampd-device-savings-api
# - Directory: ./
```

## Project Structure for Vercel

```
├── api/
│   └── index.ts          # Vercel serverless function
├── data/
│   ├── devices.csv       # Device data
│   └── device-saving.csv # Savings data
├── public/
│   ├── index.html        # Frontend
│   └── app.js           # Frontend JavaScript
├── src/
│   ├── routes/          # API routes
│   ├── utils/           # Utilities
│   └── types/           # TypeScript types
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies and scripts
```

## How It Works

1. **Serverless Function**: The `api/index.ts` file serves as the main entry point
2. **Static Files**: The `public/` directory is served as static files
3. **Data Loading**: CSV data is loaded once per serverless function instance
4. **Routing**: All API requests are routed through the Express app

## API Endpoints

After deployment, your API will be available at:

- `GET /api/devices` - List all devices
- `GET /api/devices/:id` - Get device details
- `GET /api/device-savings/:id` - Get device savings data
- `GET /api/device-savings/:id/aggregated` - Get aggregated savings
- `GET /api/device-stats/:id/monthly` - Get monthly statistics
- `GET /api/health` - Health check

## Frontend

The frontend will be available at your Vercel domain root (e.g., `https://your-app.vercel.app`)

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all TypeScript dependencies are in `dependencies`, not `devDependencies`
   - Ensure `vercel.json` is properly configured

2. **API Not Working**:
   - Check Vercel function logs in the dashboard
   - Ensure data files are included in the deployment

3. **CORS Issues**:
   - The API is configured with permissive CORS for development
   - Adjust CORS settings in `api/index.ts` for production

### Viewing Logs

- Go to Vercel Dashboard → Your Project → Functions tab
- Click on a function to view logs and invocations

## Performance Notes

- **Cold Starts**: First request may be slower due to data loading
- **Memory**: CSV data is loaded into memory for fast access
- **Caching**: Consider implementing caching for production use

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed by Vercel