
'use client';

import { VehicleAvailabilityReport } from '@/components/reports/vehicle-availability-report';
import { vehicles, maintenanceTickets } from '@/lib/data';

export default function VehicleAvailabilityPage() {
  return (
    <VehicleAvailabilityReport
      vehicles={vehicles}
      maintenanceTickets={maintenanceTickets}
    />
  );
}
