import express, { Request, Response } from 'express';
import { getDevices, getDeviceSavings } from '../utils/dataLoader';
import { HealthResponse } from '../types';

const router = express.Router();

// Health check endpoint
router.get('/', (_req: Request, res: Response) => {
  const response: HealthResponse = {
    status: 'OK',
    devices_loaded: getDevices().length,
    savings_records: getDeviceSavings().length
  };
  res.json(response);
});

export default router;