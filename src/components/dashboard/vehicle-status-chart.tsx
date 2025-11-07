'use client';

import { Pie, PieChart, Cell } from 'recharts';
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
  ChartLegendContent,
} from '@/components/ui/chart';
import { Vehicle } from '@/lib/types';
import { useMemo } from 'react';

const chartConfig = {
  Active: { label: 'Active', color: 'hsl(var(--chart-1))' },
  Maintenance: { label: 'Maintenance', color: 'hsl(var(--chart-2))' },
  Down: { label: 'Down', color: 'hsl(var(--chart-3))' },
};

const COLORS = {
  Active: 'hsl(var(--chart-1))',
  Maintenance: 'hsl(var(--chart-2))',
  Down: 'hsl(var(--chart-3))',
};

export function VehicleStatusChart({ data }: { data: Vehicle[] }) {
  const chartData = useMemo(() => {
    const statusCounts = data.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Status Distribution</CardTitle>
        <CardDescription>Current status of all vehicles in the fleet.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="min-h-[300px] w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={70}
              paddingAngle={5}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              verticalAlign="bottom"
              height={40}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
