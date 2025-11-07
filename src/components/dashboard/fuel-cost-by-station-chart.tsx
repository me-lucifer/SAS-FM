
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
} from '@/components/ui/chart';
import { FuelEntry } from '@/lib/types';
import { useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { isWithinInterval } from 'date-fns';

const chartConfig = {
  cost: {
    label: 'Cost (OMR)',
    color: 'hsl(var(--chart-2))',
  },
};

interface FuelCostByStationChartProps {
  data: FuelEntry[];
  dateRange?: DateRange;
}

export function FuelCostByStationChart({
  data,
  dateRange,
}: FuelCostByStationChartProps) {
  const chartData = useMemo(() => {
    const filteredData =
      dateRange?.from && dateRange.to
        ? data.filter((entry) =>
            isWithinInterval(new Date(entry.ts), {
              start: dateRange.from!,
              end: dateRange.to!,
            })
          )
        : data;

    const costByStation = filteredData.reduce((acc, entry) => {
      if (!acc[entry.station]) {
        acc[entry.station] = 0;
      }
      acc[entry.station] += entry.total_cost || 0;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(costByStation).map(([station, cost]) => ({
      station,
      cost,
    }));
  }, [data, dateRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fuel Cost by Station</CardTitle>
        <CardDescription>Total fuel cost in OMR by station for the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 10, right: 10 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="station"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={80}
            />
            <XAxis dataKey="cost" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="cost"
              fill="var(--color-cost)"
              radius={4}
              barSize={30}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

    