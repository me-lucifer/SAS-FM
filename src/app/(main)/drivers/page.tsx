'use client';

import { PageHeader } from '@/components/shared/page-header';
import { DriverTable } from '@/components/drivers/driver-table';
import { drivers, vehicles, fuelEntries } from '@/lib/data';

export default function DriversPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Driver Management"
        description="Manage your team of drivers and their performance."
      />
      <DriverTable 
        drivers={drivers}
        vehicles={vehicles}
        fuelEntries={fuelEntries}
      />
    </div>
  );
}
