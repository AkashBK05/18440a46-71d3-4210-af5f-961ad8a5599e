import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { loadData } from '../src/utils/dataLoader';
import apiRoutes from '../src/routes';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Initialize data loading (singleton pattern)
let dataLoaded = false;
let dataLoadingPromise: Promise<void> | null = null;

async function ensureDataLoaded(): Promise<void> {
  if (dataLoaded) return;
  
  if (dataLoadingPromise) {
    return dataLoadingPromise;
  }
  
  dataLoadingPromise = loadData().then(() => {
    dataLoaded = true;
    dataLoadingPromise = null;
  });
  
  return dataLoadingPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Ensure data is loaded before handling requests
    await ensureDataLoaded();
    
    // Convert Vercel request/response to Express format
    const expressReq = req as any;
    const expressRes = res as any;
    
    // Handle the request with Express
    app(expressReq, expressRes);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}