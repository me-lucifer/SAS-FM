
'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type Vehicle, type FuelEntry, type MaintenanceTicket } from '@/lib/types';
import { fuelEntries, maintenanceTickets } from '@/lib/data';
import { format, isAfter, parseISO, subDays, differenceInDays } from 'date-fns';
import {
  Fuel,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Gauge,
  Calendar,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

interface VehicleOverviewTabProps {
  vehicle: Vehicle;
}

type ActivityEvent = {
  date: Date;
  type: 'Fuel' | 'Maintenance' | 'Odometer';
  description: string;
  link: string;
};

const getServiceBadgeVariant = (dueDate: Date) => {
  const today = new Date();
  const daysUntil = differenceInDays(dueDate, today);

  if (daysUntil < 0) return 'destructive';
  if (daysUntil <= 7) return 'warning';
  return 'secondary';
};

export function VehicleOverviewTab({ vehicle }: VehicleOverviewTabProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const vehicleData = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);

    const vehicleFuelEntries = fuelEntries
      .filter((e) => e.vehicle_id === vehicle.id)
      .sort((a, b) => (isAfter(parseISO(b.ts), parseISO(a.ts)) ? 1 : -1));
    
    const lastFuelEntry = vehicleFuelEntries[0];

    const fuelEntriesLast7Days = vehicleFuelEntries.filter((e) =>
      isAfter(parseISO(e.ts), sevenDaysAgo)
    );

    const totalFuelLast7Days = fuelEntriesLast7Days.reduce(
      (sum, e) => sum + e.fuel_l,
      0
    );
    const totalDistanceLast7Days = fuelEntriesLast7Days.reduce(
      (sum, e) => sum + e.odo_delta_km,
      0
    );
    const avgConsumption =
      totalDistanceLast7Days > 0
        ? (totalFuelLast7Days / totalDistanceLast7Days) * 100
        : 0;

    const flagsLast7Days = [
      ...new Set(fuelEntriesLast7Days.flatMap((e) => e.flags)),
    ];

    const vehicleMaintenanceTickets = maintenanceTickets
      .filter(
        (t) =>
          t.vehicle_id === vehicle.id &&
          ['Scheduled', 'In Progress'].includes(t.status)
      )
      .sort((a, b) =>
        isAfter(parseISO(a.due_date), parseISO(b.due_date)) ? 1 : -1
      );

    const nextService = vehicleMaintenanceTickets[0];

    // Combine and sort recent activities
    const fuelActivity: ActivityEvent[] = vehicleFuelEntries.slice(0, 5).map(e => ({
        date: parseISO(e.ts),
        type: 'Fuel',
        description: `Fueled ${e.fuel_l.toFixed(2)}L at ${e.station}`,
        link: `/fuel-queue?entryId=${e.id}`,
    }));

    const maintenanceActivity: ActivityEvent[] = maintenanceTickets.filter(t => t.vehicle_id === vehicle.id).slice(0, 5).map(t => ({
        date: parseISO(t.due_date),
        type: 'Maintenance',
        description: `${t.type} ticket #${t.id} - ${t.status}`,
        link: `/maintenance/${t.id}`,
    }));

    const recentActivity = [...fuelActivity, ...maintenanceActivity]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);


    return {
      lastFuelEntry,
      avgConsumption,
      totalDistanceLast7Days,
      flagsLast7Days,
      nextService,
      recentActivity,
    };
  }, [vehicle.id]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
            <CardDescription>
              Summary of vehicle performance over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Fuel size={16} /> Last Fuel
                </h4>
                {vehicleData.lastFuelEntry && isClient ? (
                  <>
                    <p>
                      <strong>Date:</strong>{' '}
                      {format(new Date(vehicleData.lastFuelEntry.ts), 'PPp')}
                    </p>
                    <p>
                      <strong>Liters:</strong>{' '}
                      {vehicleData.lastFuelEntry.fuel_l.toFixed(2)} L
                    </p>
                    <p>
                      <strong>Station:</strong> {vehicleData.lastFuelEntry.station}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">{isClient ? 'No fuel entries found.' : 'Loading...'}</p>
                )}
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Wrench size={16} /> Next Service
                </h4>
                {vehicleData.nextService && isClient ? (
                  <>
                    <div className="flex items-center gap-2">
                      <strong>Date:</strong>
                      <Badge variant={getServiceBadgeVariant(parseISO(vehicleData.nextService.due_date))}>
                        {format(new Date(vehicleData.nextService.due_date), 'PP')}
                      </Badge>
                    </div>
                    <p>
                      <strong>Vendor:</strong> {vehicleData.nextService.vendor}
                    </p>
                     <p>
                      <strong>Type:</strong> {vehicleData.nextService.type}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">{isClient ? 'No upcoming services.' : 'Loading...'}</p>
                )}
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp size={16} /> Consumption
                </h4>
                <p>
                  <strong>Avg (7d):</strong>{' '}
                  {isClient ? `${vehicleData.avgConsumption.toFixed(2)} L/100km` : '...'}
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Gauge size={16} /> Distance
                </h4>
                <p>
                  <strong>Total (7d):</strong>{' '}
                  {isClient ? `${vehicleData.totalDistanceLast7Days.toLocaleString()} km` : '...'}
                </p>
              </div>
              <div className="space-y-1 col-span-2">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} /> Flags (7d)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {isClient ? (
                    vehicleData.flagsLast7Days.length > 0 ? (
                      vehicleData.flagsLast7Days.map((flag) => (
                        <Badge key={flag} variant="destructive">
                          {flag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No flags raised.</p>
                    )
                  ) : (
                    <p className="text-muted-foreground">Loading...</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Last 5 events for this vehicle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Event</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isClient && vehicleData.recentActivity.length > 0 ? (
                        vehicleData.recentActivity.map((event, index) => (
                            <TableRow key={index}>
                                <TableCell className="w-1/3">{format(event.date, 'PP')}</TableCell>
                                <TableCell>
                                    <Link href={event.link} className="hover:underline">
                                        <div className="flex items-center gap-2">
                                            {event.type === 'Fuel' && <Fuel className="h-4 w-4 text-muted-foreground" />}
                                            {event.type === 'Maintenance' && <Wrench className="h-4 w-4 text-muted-foreground" />}
                                            {event.description}
                                        </div>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center h-24">
                                {isClient ? 'No recent activity.' : 'Loading...'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    