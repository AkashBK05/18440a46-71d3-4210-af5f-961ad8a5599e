import express, { Request, Response } from 'express';
import { getDevices, getDeviceById } from '../utils/dataLoader';

const router = express.Router();

// Get all devices
router.get('/', (_req: Request, res: Response) => {
  res.json(getDevices());
});

// Get device by ID
router.get('/:id', (req: Request, res: Response) => {
  const deviceId = parseInt(req.params.id);
  const device = getDeviceById(deviceId);

  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  res.json(device);
});

export default router;