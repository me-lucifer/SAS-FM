
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertTriangle,
  Fuel,
  Gauge,
  ScanEye,
  Wrench,
  CalendarClock,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { addDays, isWithinInterval, format } from 'date-fns';
import { FuelEntry, MaintenanceTicket } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

interface AlertsPanelProps {
  fuelEntries: FuelEntry[];
  maintenanceTickets: MaintenanceTicket[];
}

const flagIcons: { [key: string]: React.ElementType } = {
  'odo delta high': Gauge,
  'fuel over max': Fuel,
  'low ocr': ScanEye,
};

const maintenanceIcons: { [key: string]: React.ElementType } = {
  Service: Wrench,
  Repair: Wrench,
  Inspection: ScanEye,
};

function AlertSkeleton() {
    return (
        <div className="flex items-start gap-4 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
            </div>
        </div>
    )
}

export function AlertsPanel({
  fuelEntries,
  maintenanceTickets,
}: AlertsPanelProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const alerts = useMemo(() => {
    if (!isClient) return [];
    const fuelAlerts = fuelEntries
      .filter(entry => entry.flags.length > 0 && entry.status === 'Submitted')
      .flatMap((entry) =>
        entry.flags.map((flag) => ({
          id: `${entry.id}-${flag}`,
          type: 'fuel' as const,
          icon: flagIcons[flag] || AlertTriangle,
          title: flag.charAt(0).toUpperCase() + flag.slice(1),
          subtitle: `Vehicle ${entry.vehicle_id} on ${format(
            new Date(entry.ts),
            'MMM d'
          )}`,
          date: new Date(entry.ts),
          link: `/fuel-queue?entryId=${entry.id}`,
        }))
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    const sevenDaysFromNow = addDays(new Date(), 7);
    const now = new Date();
    const maintenanceAlerts = maintenanceTickets
      .filter((ticket) => {
        const dueDate = new Date(ticket.due_date);
        return (
          isWithinInterval(dueDate, { start: now, end: sevenDaysFromNow }) &&
          ticket.status === 'Scheduled'
        );
      })
      .map((ticket) => ({
        id: ticket.id,
        type: 'maintenance' as const,
        icon: maintenanceIcons[ticket.type] || Wrench,
        title: `${ticket.type} Due`,
        subtitle: `Vehicle ${ticket.vehicle_id} on ${format(
          new Date(ticket.due_date),
          'MMM d'
        )}`,
        date: new Date(ticket.due_date),
        link: `/maintenance/${ticket.id}`,
      }));

    return [...fuelAlerts, ...maintenanceAlerts]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 6);
  }, [fuelEntries, maintenanceTickets, isClient]);

  if (!isClient) {
    return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>
              Recent warnings and upcoming maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <AlertSkeleton key={i} />)}
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
        <CardDescription>
          Recent warnings and upcoming maintenance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Link href={alert.link} key={alert.id} className="block">
                <div className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div
                    className={`mt-1 p-2 rounded-full ${
                      alert.type === 'fuel'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-warning/10 text-warning-foreground'
                    }`}
                  >
                    <alert.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
            <CalendarClock className="w-10 h-10 mb-2" />
            <p className="font-medium">All Clear!</p>
            <p className="text-sm">No current alerts or upcoming maintenance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
