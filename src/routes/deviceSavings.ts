import express, { Request, Response } from 'express';
import moment from 'moment-timezone';
import { getDeviceById, getDeviceSavingsById } from '../utils/dataLoader';
import { DeviceSaving, AggregatedSaving, ApiResponse } from '../types';

const router = express.Router();

// Helper function to apply date filtering with boundary inclusion
function applyDateFilter(
  savings: DeviceSaving[],
  startDate?: string,
  endDate?: string,
  timezone?: string
): DeviceSaving[] {
  if (!startDate && !endDate) {
    return savings;
  }

  // Ensure a default timezone if not provided (UTC fallback)
  const tz: string = timezone || 'UTC';

  // Validate dates if provided
  if (startDate && !moment.tz(startDate, tz).isValid()) {
    throw new Error("Invalid start_date format");
  }
  if (endDate && !moment.tz(endDate, tz).isValid()) {
    throw new Error("Invalid end_date format");
  }

  // Validate logical ordering
  if (startDate && endDate) {
    const start = moment.tz(startDate, tz);
    const end = moment.tz(endDate, tz);
    if (start.isAfter(end)) {
      throw new Error("start_date must be before or equal to end_date");
    }
  }

  let filtered = savings;

  if (startDate || endDate) {
    const startMoment = startDate ? moment.tz(startDate, tz) : null;
    const endMoment = endDate ? moment.tz(endDate, tz) : null;

    filtered = filtered.filter((s) => {
      const timestamp = moment(s.device_timestamp).tz(tz);
      if (startMoment && timestamp.isBefore(startMoment)) return false;
      if (endMoment && timestamp.isAfter(endMoment)) return false;
      return true;
    });
  }

  return filtered;
}


// Get device savings with optional date filtering
router.get('/:id', (req: Request, res: Response) => {
  const deviceId = parseInt(req.params.id);
  const { start_date, end_date, timezone } = req.query as {
    start_date?: string;
    end_date?: string;
    timezone?: string;
  };

  const device = getDeviceById(deviceId);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  let filteredSavings = getDeviceSavingsById(deviceId);

  // Apply date filtering if provided
  const deviceTimezone = timezone || device.timezone;
  filteredSavings = applyDateFilter(filteredSavings, start_date, end_date, deviceTimezone);

  // Sort by device timestamp (local time)
  filteredSavings.sort((a, b) => a.device_timestamp.getTime() - b.device_timestamp.getTime());

  const response: ApiResponse<DeviceSaving[]> = {
    device: device,
    data: filteredSavings,
    total_records: filteredSavings.length
  };

  res.json(response);
});

// Get aggregated savings data for charting
router.get('/:id/aggregated', (req: Request, res: Response) => {
  const deviceId = parseInt(req.params.id);
  const { start_date, end_date, interval = 'hour', timezone } = req.query as {
    start_date?: string;
    end_date?: string;
    interval?: string;
    timezone?: string;
  };

  const device = getDeviceById(deviceId);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  let filteredSavings = getDeviceSavingsById(deviceId);

  // Apply date filtering
  const deviceTimezone = timezone || device.timezone;
  filteredSavings = applyDateFilter(filteredSavings, start_date, end_date, deviceTimezone);

  // Group by interval (hour, day, etc.)
  const grouped: { [key: string]: AggregatedSaving } = {};

  filteredSavings.forEach(saving => {
    let key: string;
    const momentTime = moment(saving.device_timestamp).tz(deviceTimezone);

    switch (interval) {
      case 'hour':
        key = momentTime.format('YYYY-MM-DD HH:00:00');
        break;
      case 'day':
        key = momentTime.format('YYYY-MM-DD');
        break;
      case 'month':
        key = momentTime.format('MMM,YYYY'); // Use first day of month for consistency
        break;
      case 'raw':
      default:
        key = momentTime.format('YYYY-MM-DD HH:mm:ss');
        break;
    }

    if (!grouped[key]) {
      grouped[key] = {
        timestamp: key,
        carbon_saved: 0,
        fuel_saved: 0,
        count: 0
      };
    }

    grouped[key].carbon_saved += saving.carbon_saved;
    grouped[key].fuel_saved += saving.fuel_saved;
    grouped[key].count += 1;
  });

  // Convert to array - use sums for aggregated intervals to show total savings per period
  const result = Object.values(grouped);

  // Sort by timestamp
  result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const response: ApiResponse<AggregatedSaving[]> = {
    device: device,
    interval: interval,
    data: result,
    total_records: result.length
  };

  res.json(response);
});

export default router;