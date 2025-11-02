import express from 'express';
import devicesRouter from './devices';
import deviceSavingsRouter from './deviceSavings';
import deviceStatsRouter from './deviceStats';
import healthRouter from './health';

const router = express.Router();

// Clean route organization:
// - /devices for device listing and details
// - /device-savings for savings data endpoints
// - /device-stats for statistics endpoints
// - /health for health check
router.use('/devices', devicesRouter);
router.use('/device-savings', deviceSavingsRouter);
router.use('/device-stats', deviceStatsRouter);
router.use('/health', healthRouter);

export default router;