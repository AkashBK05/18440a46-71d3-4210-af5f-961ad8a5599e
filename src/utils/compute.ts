import { DeviceSaving, MonthlyStats } from '../types';

interface GroupedData {
  [key: string]: {
    carbon: number;
    fuel: number;
    count: number;
  };
}

// Utility to group data by month
export const groupByMonth = (data: DeviceSaving[], dateKey: keyof DeviceSaving): GroupedData =>
  data.reduce((acc: GroupedData, item) => {
    const date = new Date(item[dateKey] as Date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`; // +1 for human-readable month
    acc[key] = acc[key] || { carbon: 0, fuel: 0, count: 0 };
    acc[key].carbon += item.carbon_saved || 0;
    acc[key].fuel += item.fuel_saved || 0;
    acc[key].count += 1;
    return acc;
  }, {});

// Utility to compute averages
export const calculateAverages = (groupedData: GroupedData): MonthlyStats => {
  const months = Object.values(groupedData);
  const totalMonths = months.length || 1;

  const { carbon, fuel } = months.reduce(
    (acc, { carbon, fuel }) => ({
      carbon: acc.carbon + carbon,
      fuel: acc.fuel + fuel,
    }),
    { carbon: 0, fuel: 0 }
  );

  return {
    carbon_saved: +(carbon / totalMonths).toFixed(2),
    fuel_saved: +(fuel / totalMonths).toFixed(2),
    months_count: totalMonths,
  };
};