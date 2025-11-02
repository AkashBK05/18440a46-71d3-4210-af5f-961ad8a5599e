import express, { Request, Response } from 'express';
import { getDeviceById, getDeviceSavingsById } from '../utils/dataLoader';
import { groupByMonth, calculateAverages } from '../utils/compute';

const router = express.Router();

// Route: Get monthly average statistics for a device
router.get('/:id/monthly', (req: Request, res: Response) => {
  const deviceId = Number(req.params.id);

  if (Number.isNaN(deviceId)) {
    return res.status(400).json({ error: 'Invalid device ID' });
  }

  const device = getDeviceById(deviceId);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  const savingsData = getDeviceSavingsById(deviceId);
  if (!Array.isArray(savingsData) || savingsData.length === 0) {
    return res.json({ carbon_saved: 0, fuel_saved: 0, months_count: 0 });
  }

  const groupedData = groupByMonth(savingsData, 'device_timestamp');
  const averages = calculateAverages(groupedData);

  return res.json(averages);
});

export default router;