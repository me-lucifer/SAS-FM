'use client';

import { Suspense } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { FuelQueueTable } from '@/components/fuel-queue/fuel-queue-table';
import { fuelEntries, vehicles, drivers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { FuelEntry } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

function FuelQueuePageContent() {
  const [filteredEntries, setFilteredEntries] = useState<FuelEntry[]>(fuelEntries);
  const searchParams = useSearchParams();
  const entryId = searchParams.get('entryId');

  const handleExport = () => {
    const dataToExport = filteredEntries.map(entry => {
        const vehicle = vehicles.find(v => v.id === entry.vehicle_id);
        const driver = drivers.find(d => d.id === entry.driver_id);
        return {
            'Date Time': format(new Date(entry.ts), 'yyyy-MM-dd HH:mm:ss'),
            'Vehicle Plate': vehicle?.plate,
            'Driver Name': driver?.name,
            'Station': entry.station,
            'Fuel (L)': entry.fuel_l.toFixed(2),
            'Odometer (km)': entry.odo_km,
            'Delta (km)': entry.odo_delta_km,
            'Status': entry.status,
            'Flags': entry.flags.join(', '),
        }
    });
    exportToCsv(dataToExport, 'fuel_queue');
  };

  return (
    <>
      <PageHeader
        title="Fuel Queue"
        description="Monitor and manage vehicle fuel entries."
      >
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2" />
            Export CSV
        </Button>
      </PageHeader>
      <FuelQueueTable
        fuelEntries={fuelEntries}
        vehicles={vehicles}
        drivers={drivers}
        onFilteredEntriesChange={setFilteredEntries}
        initialSelectedEntryId={entryId}
      />
    </>
  );
}

function PageSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-[600px] w-full" />
        </div>
    )
}

export default function FuelQueuePage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<PageSkeleton />}>
        <FuelQueuePageContent />
      </Suspense>
    </div>
  );
}
