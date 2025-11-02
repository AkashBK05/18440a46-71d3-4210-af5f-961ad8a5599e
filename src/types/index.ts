export interface Device {
  id: number;
  name: string;
  timezone: string;
}

export interface DeviceSaving {
  device_id: number;
  timestamp: Date;
  device_timestamp: Date;
  carbon_saved: number;
  fuel_saved: number;
}

export interface AggregatedSaving {
  timestamp: string;
  carbon_saved: number;
  fuel_saved: number;
  count: number;
}

export interface MonthlyStats {
  carbon_saved: number;
  fuel_saved: number;
  months_count: number;
}

export interface ApiResponse<T> {
  device?: Device;
  data?: T;
  total_records?: number;
  interval?: string;
}

export interface HealthResponse {
  status: string;
  devices_loaded: number;
  savings_records: number;
}