import express from 'express';
import cors from 'cors';
import path from 'path';
import { loadData } from './utils/dataLoader';
import apiRoutes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.use('/api', apiRoutes);

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start server
async function startServer(): Promise<void> {
  try {
    await loadData();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API endpoints:`);
      console.log(`  GET /api/devices - List all devices`);
      console.log(`  GET /api/devices/:id - Get device details`);
      console.log(`  GET /api/device-savings/:id - Get device savings data`);
      console.log(`  GET /api/device-savings/:id/aggregated - Get aggregated savings data`);
      console.log(`  GET /api/device-stats/:id/monthly - Get monthly statistics`);
      console.log(`  GET /api/health - Health check`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();