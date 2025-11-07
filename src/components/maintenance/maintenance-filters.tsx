'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { vehicles, maintenanceTickets } from '@/lib/data';
import { MaintenanceTicket, Vehicle } from '@/lib/types';

interface MaintenanceFiltersProps {
  onFilterChange: (filters: {
    fleet: string;
    vehicle: string;
    priority: string;
    vendor: string;
  }) => void;
}

const fleets = [...new Set(vehicles.map((v) => v.fleet))];
const priorities = ['Low', 'Medium', 'High'];
const vendors = [...new Set(maintenanceTickets.map((t) => t.vendor))];

export function MaintenanceFilters({ onFilterChange }: MaintenanceFiltersProps) {
  const [fleet, setFleet] = useState('all');
  const [vehicle, setVehicle] = useState('all');
  const [priority, setPriority] = useState('all');
  const [vendor, setVendor] = useState('all');

  useEffect(() => {
    onFilterChange({ fleet, vehicle, priority, vendor });
  }, [fleet, vehicle, priority, vendor, onFilterChange]);

  const filteredVehicles = fleet === 'all' ? vehicles : vehicles.filter(v => v.fleet === fleet);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Select value={fleet} onValueChange={setFleet}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by Fleet..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Fleets</SelectItem>
          {fleets.map((f) => (
            <SelectItem key={f} value={f}>
              {f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={vehicle} onValueChange={setVehicle}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by Vehicle..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Vehicles</SelectItem>
          {filteredVehicles.map((v) => (
            <SelectItem key={v.id} value={v.id}>
              {v.plate}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by Priority..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          {priorities.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={vendor} onValueChange={setVendor}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by Vendor..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Vendors</SelectItem>
          {vendors.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
