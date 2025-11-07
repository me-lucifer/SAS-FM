
'use client';

import { useState } from 'react';
import { fuelEntries, vehicles, stations, fleets } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DailyFuelLogTable } from '@/components/reports/daily-fuel-log-table';

export default function DailyFuelLogPage() {
  const [filters, setFilters] = useState({
    fleet: 'all',
    vehicle: 'all',
    station: 'all',
  });

  const handleFilterChange = (filterName: string) => (value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const filteredFuelEntries = fuelEntries.filter(entry => {
    const vehicle = vehicles.find(v => v.id === entry.vehicle_id);
    return (
        (filters.fleet === 'all' || vehicle?.fleet === filters.fleet) &&
        (filters.vehicle === 'all' || entry.vehicle_id === filters.vehicle) &&
        (filters.station === 'all' || entry.station === filters.station)
    )
  });

  const filteredVehicles = filters.fleet === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.fleet === filters.fleet);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select value={filters.fleet} onValueChange={handleFilterChange('fleet')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Fleet..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fleets</SelectItem>
            {fleets.map((fleet) => (
                <SelectItem key={fleet.id} value={fleet.name}>
                {fleet.name}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.vehicle} onValueChange={handleFilterChange('vehicle')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Vehicle..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            {filteredVehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.plate}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.station} onValueChange={handleFilterChange('station')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Station..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stations</SelectItem>
            {stations.map((station) => (
                <SelectItem key={station.id} value={station.name}>
                    {station.name}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DailyFuelLogTable entries={filteredFuelEntries} />
    </div>
  );
}
