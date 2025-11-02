# Ampd Energy Device Savings API

**Repository UUID:** 4841cb59-343d-48ae-955e-2a549a387422

A Node.js API and Vue.js frontend for visualizing carbon and diesel savings from Ampd Energy devices.

## Features

- RESTful API for device savings data
- Interactive dashboard with date filtering
- Real-time charts using ECharts
- Timezone-aware data handling
- Responsive design matching the provided mockup

## Prerequisites

- Node.js v18.19.0
- npm or yarn

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Development

For development with auto-reload:
```bash
npm run dev
```

## Deployment

### Vercel (Recommended)

This project is optimized for Vercel deployment with serverless functions.

**Quick Deploy:**
1. Push your code to GitHub/GitLab
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically

**Manual Deploy:**
```bash
npm i -g vercel
vercel
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Traditional Hosting

For traditional Node.js hosting:
```bash
npm run build
npm start
```

## API Endpoints

### Devices
- `GET /api/devices` - List all devices
- `GET /api/devices/:id` - Get device details

### Device Savings
- `GET /api/device-savings/:id/savings` - Get raw savings data
  - Query params: `start_date`, `end_date`, `timezone`
- `GET /api/device-savings/:id/savings/aggregated` - Get aggregated data for charts
  - Query params: `start_date`, `end_date`, `interval` (hour/day/month/raw), `timezone`

### Device Statistics
- `GET /api/device-stats/:id/stats/monthly` - Get monthly statistics (average per month)

### Health Check
- `GET /api/health` - API health status

## Data Structure

The API loads data from CSV files in the `./data` directory:
- `devices.csv` - Device information (id, name, timezone)
- `device-saving.csv` - Time series savings data (device_id, timestamps, carbon_saved, fuel_saved)

## Frontend Features

- **Device Selection:** Dropdown to select different devices
- **Date Range Filtering:** Custom date picker with preset options (30 days, 60 days, 1 year)
- **Summary Cards:** Total and monthly statistics for carbon and diesel savings
- **Interactive Chart:** Dual-axis bar chart showing savings over time
- **Responsive Design:** Works on desktop and mobile devices

## Technology Stack

### Backend
- Node.js v18.19.0
- Express.js
- CSV Parser
- Moment.js with timezone support

### Frontend
- Vue.js 3
- ECharts for data visualization
- Vanilla CSS for styling

## Project Structure

```
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── public/            # Frontend files
│   ├── index.html     # Main HTML file
│   └── app.js         # Vue.js application
├── routes/            # API route handlers
│   ├── index.js       # Main router configuration
│   ├── devices.js     # Device endpoints
│   ├── deviceSavings.js # Device savings endpoints
│   ├── deviceStats.js # Device statistics endpoints
│   └── health.js      # Health check endpoint
├── utils/             # Utility functions
│   └── dataLoader.js  # CSV data loading and caching
├── data/              # CSV data files
│   ├── devices.csv    # Device information
│   └── device-saving.csv # Time series savings data
└── README.md          # This file
```

## Environment Compatibility

This application is designed to run on:
- macOS
- Linux
- Node.js v18.19.0

## Sample API Usage

```bash
# Get all devices
curl http://localhost:3000/api/devices

# Get device savings for date range with data
curl "http://localhost:3000/api/devices/1/savings/aggregated?start_date=2023-12-01&end_date=2024-01-31&interval=month"

# Get monthly average statistics
curl http://localhost:3000/api/devices/1/stats/monthly

# Health check
curl http://localhost:3000/api/health
```

## Data Notes

- **Total Stats**: Shows lifetime total savings for the selected device
- **Monthly Stats**: Shows average monthly savings across all available months
- **Date Range**: Sample data spans from 2023 to early 2024
- **Chart**: Displays monthly aggregated totals for the selected date range

## Notes

- Data is loaded into memory on server startup for fast access
- Timezone handling uses the device's configured timezone
- Chart data is aggregated by day for better performance
- The UI closely matches the provided mockup design