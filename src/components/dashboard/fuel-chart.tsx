'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { FuelEntry } from '@/lib/types';
import { useMemo } from 'react';
import { format, isWithinInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';

const chartConfig = {
  fuel: {
    label: 'Fuel (L)',
    color: 'hsl(var(--chart-1))',
  },
};

interface FuelChartProps {
  data: FuelEntry[];
  dateRange?: DateRange;
}

export function FuelChart({ data, dateRange }: FuelChartProps) {
  const chartData = useMemo(() => {
    const filteredData = dateRange?.from && dateRange.to 
      ? data.filter(entry => isWithinInterval(new Date(entry.ts), { start: dateRange.from!, end: dateRange.to! }))
      : data;

    const dailyFuel = filteredData.reduce((acc, entry) => {
      const date = format(new Date(entry.ts), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += entry.fuel_l;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyFuel)
      .map(([date, fuel]) => ({ date: format(new Date(date), 'MMM d'), fuel }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, dateRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Fuel Consumption</CardTitle>
        <CardDescription>Fuel consumed in Liters over the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            <Line dataKey="fuel" type="monotone" stroke="var(--color-fuel)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
