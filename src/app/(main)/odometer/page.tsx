
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { OdometerTable } from '@/components/odometer/odometer-table';
import { fuelEntries, vehicles, drivers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';
import { FuelEntry } from '@/lib/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';

const statuses = ['Submitted', 'Approved', 'Rejected'];
const flagOptions = ['any', 'none'];

export default function OdometerPage() {
    const [filteredEntries, setFilteredEntries] = useState<FuelEntry[]>(fuelEntries);
    const [statusFilter, setStatusFilter] = useState('all');
    const [flagFilter, setFlagFilter] = useState('all');

    const handleExport = () => {
        const dataToExport = filteredEntries.map(entry => {
            const vehicle = vehicles.find(v => v.id === entry.vehicle_id);
            const driver = drivers.find(d => d.id === entry.driver_id);
            return {
                'Date Time': format(new Date(entry.ts), 'yyyy-MM-dd HH:mm:ss'),
                'Vehicle Plate': vehicle?.plate,
                'Driver Name': driver?.name,
                'Odometer (km)': entry.odo_km,
                'Delta (km)': entry.odo_delta_km,
                'OCR Confidence (%)': entry.ocr_confidence.toFixed(0),
                'Status': entry.status,
                'Flags': entry.flags.join(', '),
            }
        });
        exportToCsv(dataToExport, 'odometer_submissions');
      };
    
    const entriesToDisplay = useMemo(() => {
        return fuelEntries.filter(entry => {
            const statusMatch = statusFilter === 'all' || entry.status === statusFilter;
            const flagMatch = flagFilter === 'all' || (flagFilter === 'any' && entry.flags.length > 0) || (flagFilter === 'none' && entry.flags.length === 0);
            return statusMatch && flagMatch;
        });
    }, [statusFilter, flagFilter]);

    // Update filteredEntries whenever entriesToDisplay changes
    useState(() => {
        setFilteredEntries(entriesToDisplay);
    });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Odometer Submissions"
        description="Review and manage vehicle odometer readings."
      >
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2" />
            Export CSV
        </Button>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
                <SelectValue placeholder="Filter by status..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
        </Select>
        <Select value={flagFilter} onValueChange={setFlagFilter}>
            <SelectTrigger>
                <SelectValue placeholder="Filter by flags..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Flags</SelectItem>
                <SelectItem value="any">Has Flags</SelectItem>
                <SelectItem value="none">No Flags</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <OdometerTable
        fuelEntries={entriesToDisplay}
        vehicles={vehicles}
        drivers={drivers}
      />
    </div>
  );
}
