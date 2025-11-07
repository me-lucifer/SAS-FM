
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { vehicles, fuelEntries } from '@/lib/data';
import { Truck, Wrench, Fuel, Gauge, CircleOff, Banknote, HelpCircle } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { isWithinInterval } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Skeleton } from '../ui/skeleton';

interface StatsCardsProps {
  dateRange?: DateRange;
}

function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-5" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-7 w-24" />
            </CardContent>
        </Card>
    );
}

const flagTooltips = {
  'low ocr': 'OCR confidence under threshold on latest odometer photo.',
  'fuel over max': 'Dispensed liters exceed the configured tank capacity.',
  'odo delta high': 'Unusual distance since last fill (> configured threshold).',
};

export function StatsCards({ dateRange }: StatsCardsProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredData = useMemo(() => {
    if (!isClient) return { fuelToday: [] };

    if (!dateRange || !dateRange.from || !dateRange.to) {
      const today = new Date();
      const from = new Date(today.setHours(0, 0, 0, 0));
      const to = new Date(today.setHours(23, 59, 59, 999));
      return {
        fuelToday: fuelEntries.filter(entry => isWithinInterval(new Date(entry.ts), { start: from, end: to })),
      };
    }

    const { from, to } = dateRange;
    to.setHours(23, 59, 59, 999);

    const fuelToday = fuelEntries.filter(entry =>
      isWithinInterval(new Date(entry.ts), { start: from, end: to })
    );

    return { fuelToday };
  }, [dateRange, isClient]);

  const fuelTodayLiters = useMemo(() => {
    return filteredData.fuelToday.reduce((sum, entry) => sum + entry.fuel_l, 0);
  }, [filteredData.fuelToday]);

  const odoDeltaToday = useMemo(() => {
    return filteredData.fuelToday.reduce((sum, entry) => sum + entry.odo_delta_km, 0);
  }, [filteredData.fuelToday]);

  const stats = [
    {
      title: 'Active Vehicles',
      value: vehicles.filter((v) => v.status === 'Active').length,
      icon: Truck,
      color: 'text-success-foreground',
      bgColor: 'bg-success',
      tooltip: 'Total count of vehicles currently in an "Active" operational status.',
    },
    {
      title: 'In Maintenance',
      value: vehicles.filter((v) => v.status === 'Maintenance').length,
      icon: Wrench,
      color: 'text-warning-foreground',
      bgColor: 'bg-warning',
      tooltip: 'Total count of vehicles currently undergoing scheduled or unscheduled maintenance.',
    },
    {
      title: 'Down',
      value: vehicles.filter((v) => v.status === 'Down').length,
      icon: CircleOff,
      color: 'text-destructive-foreground',
      bgColor: 'bg-destructive',
      tooltip: 'Total count of vehicles that are out of service and not operational.',
    },
    {
      title: 'Fuel Today',
      value: `${fuelTodayLiters.toFixed(2)} L`,
      icon: Fuel,
      color: 'text-blue-500',
      tooltip: 'Total liters of fuel dispensed for the selected period.',
    },
    {
      title: 'Odo Δ Today',
      value: `${odoDeltaToday.toLocaleString()} km`,
      icon: Gauge,
      color: 'text-indigo-500',
      tooltip: 'Sum of distance traveled between refueling stops for the selected period. Formula: sum(odo_delta_km)',
    },
  ];

  if (!isClient) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="flex items-center gap-2">
              {stat.tooltip && (
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stat.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <stat.icon className={`h-5 w-5 ${stat.color} ${stat.bgColor ? `${stat.bgColor} p-0.5 rounded-sm` : ''}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
