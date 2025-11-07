
'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter
  } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { type FuelEntry } from '@/lib/types';
import { format } from 'date-fns';
import { useMemo, useEffect } from 'react';
import { useReportFilters } from '@/hooks/use-report-filters';

interface DailyFuelLogTableProps {
    entries: FuelEntry[];
}

export function DailyFuelLogTable({ entries }: DailyFuelLogTableProps) {
    const { setExportData } = useReportFilters();
    const [isClient, setIsClient] = React.useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    const totals = useMemo(() => {
        return entries.reduce((acc, entry) => {
            acc.quantity += entry.fuel_l;
            acc.deltaOdometer += entry.odo_delta_km;
            return acc;
        }, { quantity: 0, deltaOdometer: 0 });
    }, [entries]);

    useEffect(() => {
      const dataToExport = entries.map(entry => ({
        'Issue Date/Time': format(new Date(entry.ts), 'PPpp'),
        'Vehicle Plate': entry.vehicle_id,
        'Odometer': entry.odo_km.toLocaleString(),
        'Delta Odometer': entry.odo_delta_km.toLocaleString(),
        'Quantity (L)': entry.fuel_l.toFixed(2),
        'Station': entry.station,
      }));

      // Add totals row
      if (entries.length > 0) {
        dataToExport.push({
            'Issue Date/Time': 'Totals',
            'Vehicle Plate': '',
            'Odometer': '',
            'Delta Odometer': totals.deltaOdometer.toLocaleString(),
            'Quantity (L)': totals.quantity.toFixed(2),
            'Station': '',
        });
      }

      setExportData(dataToExport, 'daily_fuel_log');
    }, [entries, totals, setExportData]);

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issue Date/Time</TableHead>
              <TableHead>Vehicle Plate</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead>Delta Odometer</TableHead>
              <TableHead>Quantity (L)</TableHead>
              <TableHead>Station</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isClient && entries.length > 0 ? entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{format(new Date(entry.ts), 'PPpp')}</TableCell>
                <TableCell>{entry.vehicle_id}</TableCell>
                <TableCell>{entry.odo_km.toLocaleString()}</TableCell>
                <TableCell>{entry.odo_delta_km.toLocaleString()}</TableCell>
                <TableCell>{entry.fuel_l.toFixed(2)}</TableCell>
                <TableCell>{entry.station}</TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        {isClient ? 'No results found.' : 'Loading...'}
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
          {isClient && entries.length > 0 && (
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3}><strong>Totals</strong></TableCell>
                    <TableCell><strong>{totals.deltaOdometer.toLocaleString()} km</strong></TableCell>
                    <TableCell><strong>{totals.quantity.toFixed(2)} L</strong></TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableFooter>
          )}
        </Table>
      </CardContent>
    </Card>
  );
}
