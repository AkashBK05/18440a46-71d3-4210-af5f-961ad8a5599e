import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { Device, DeviceSaving } from '../types';

// In-memory data storage
let devices: Device[] = [];
let deviceSavings: DeviceSaving[] = [];

// Load CSV data on startup
export async function loadData(): Promise<void> {

  // Clear existing data to avoid duplication on repeated loads
  devices.length = 0;
  deviceSavings.length = 0;

  // Load devices
  return new Promise((resolve, reject) => {
    const devicesPath = path.join(process.cwd(), 'data', 'devices.csv');
    fs.createReadStream(devicesPath)
      .pipe(csv())
      .on('data', (row: any) => {
        devices.push({
          id: parseInt(row.id),
          name: row.name,
          timezone: row.timezone
        });
      })
      .on('end', () => {
        console.log(`Loaded ${devices.length} devices`);

        // Load device savings
        const savingsPath = path.join(process.cwd(), 'data', 'device-saving.csv');
        fs.createReadStream(savingsPath)
          .pipe(csv())
          .on('data', (row: any) => {
            deviceSavings.push({
              device_id: parseInt(row.device_id),
              timestamp: new Date(row.timestamp),
              device_timestamp: new Date(row.device_timestamp),
              carbon_saved: parseFloat(row.carbon_saved),
              fuel_saved: parseFloat(row.fueld_saved) 
            });
          })
          .on('end', () => {
            console.log(`Loaded ${deviceSavings.length} device saving records`);
            resolve();
          })
          .on('error', reject);
      })
      .on('error', reject);
  });
}

export function getDevices(): Device[] {
  return [...devices]; // Return defensive copy
}

export function getDeviceSavings(): DeviceSaving[] {
  return [...deviceSavings]; // Return defensive copy
}

export function getDeviceById(id: number): Device | undefined {
  const device = devices.find(d => d.id === id);
  return device ? { ...device } : undefined; // Return defensive copy of device object
}

export function getDeviceSavingsById(deviceId: number): DeviceSaving[] {
  return deviceSavings.filter(s => s.device_id === deviceId).map(saving => ({ ...saving })); // Return defensive copies
}