'use client';

import { StatsCards } from '@/components/dashboard/stats-cards';
import { FuelChart } from '@/components/dashboard/fuel-chart';
import { VehicleStatusChart } from '@/components/dashboard/vehicle-status-chart';
import { FuelCostByStationChart } from '@/components/dashboard/fuel-cost-by-station-chart';
import { AlertsPanel } from '@/components/dashboard/alerts-panel';
import { fuelEntries, maintenanceTickets, vehicles } from '@/lib/data';
import { DateRange } from 'react-day-picker';
import { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import { DateRangePicker } from '@/components/shared/date-range-picker';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 13),
    to: new Date(),
  });

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <DateRangePicker onDateChange={setDateRange} />
      </div>
      <StatsCards dateRange={dateRange} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FuelChart data={fuelEntries} dateRange={dateRange} />
        </div>
        <div className="lg:col-span-1">
          <AlertsPanel
            fuelEntries={fuelEntries}
            maintenanceTickets={maintenanceTickets}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <FuelCostByStationChart data={fuelEntries} dateRange={dateRange} />
        </div>
        <div className="lg:col-span-2">
          <VehicleStatusChart data={vehicles} />
        </div>
      </div>
    </div>
  );
}
