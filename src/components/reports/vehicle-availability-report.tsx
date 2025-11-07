
'use client';

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
  TableFooter,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { type Vehicle, type MaintenanceTicket } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { Truck, Wrench, CircleOff, Percent } from 'lucide-react';
import { useReportFilters } from '@/hooks/use-report-filters';


interface VehicleAvailabilityReportProps {
  vehicles: Vehicle[];
  maintenanceTickets: MaintenanceTicket[];
}

const chartConfig = {
  active: { label: 'Active', color: 'hsl(var(--chart-1))' },
  maintenance: { label: 'Maintenance', color: 'hsl(var(--chart-2))' },
  down: { label: 'Down', color: 'hsl(var(--chart-3))' },
};

const COLORS = {
  active: 'hsl(var(--chart-1))',
  maintenance: 'hsl(var(--chart-2))',
  down: 'hsl(var(--chart-3))',
};

export function VehicleAvailabilityReport({ vehicles, maintenanceTickets }: VehicleAvailabilityReportProps) {
    const { setExportData } = useReportFilters();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);
    
    const reportData = useMemo(() => {
        if (!isClient) {
            return {
                kpis: { avgUptime: 0, avgMaintenance: 0, avgDown: 0 },
                tableData: [],
                chartData: [],
                totals: { uptime: 0, maintenance: 0, down: 0 },
            };
        }
    
        const totalHoursInPeriod = 240; // Mock: 10 hours/day * 24 days
    
        const tableData = vehicles.map(vehicle => {
            let downHours = 0;
            let maintenanceHours = 0;
            
            if (vehicle.status === 'Down') {
                downHours = Math.floor(Math.random() * 80) + 40; // Mock: 40-120 hours down
            } else if (vehicle.status === 'Maintenance') {
                maintenanceHours = Math.floor(Math.random() * 40) + 20; // Mock: 20-60 hours in maintenance
            }

            // Add hours from completed/in-progress tickets
            const vehicleTickets = maintenanceTickets.filter(t => t.vehicle_id === vehicle.id);
            maintenanceHours += vehicleTickets.length * (Math.floor(Math.random() * 8) + 4); // Mock: 4-12 hours per ticket

            const uptimeHours = Math.max(0, totalHoursInPeriod - downHours - maintenanceHours);
            const availability = (uptimeHours / totalHoursInPeriod) * 100;
            
            return {
                ...vehicle,
                uptimeHours,
                maintenanceHours,
                downHours,
                availability,
            };
        });

        const totalUptime = tableData.reduce((sum, v) => sum + v.uptimeHours, 0);
        const totalMaintenance = tableData.reduce((sum, v) => sum + v.maintenanceHours, 0);
        const totalDown = tableData.reduce((sum, v) => sum + v.downHours, 0);
        const totalHours = totalUptime + totalMaintenance + totalDown;

        const kpis = {
            avgUptime: totalHours > 0 ? (totalUptime / totalHours) * 100 : 0,
            avgMaintenance: totalHours > 0 ? (totalMaintenance / totalHours) * 100 : 0,
            avgDown: totalHours > 0 ? (totalDown / totalHours) * 100 : 0,
        };

        const chartData = [
            { name: 'active', value: totalUptime, label: 'Active' },
            { name: 'maintenance', value: totalMaintenance, label: 'Maintenance' },
            { name: 'down', value: totalDown, label: 'Down' },
        ];

        const totals = { uptime: totalUptime, maintenance: totalMaintenance, down: totalDown };

        return { kpis, tableData, chartData, totals };
    }, [vehicles, maintenanceTickets, isClient]);

    useEffect(() => {
        const dataToExport = reportData.tableData.map(v => ({
            'Vehicle': v.plate,
            'Uptime (hrs)': v.uptimeHours.toFixed(0),
            'Maintenance (hrs)': v.maintenanceHours.toFixed(0),
            'Down (hrs)': v.downHours.toFixed(0),
            'Availability (%)': v.availability.toFixed(1),
        }));

        if (reportData.tableData.length > 0) {
            dataToExport.push({
                'Vehicle': 'Fleet Totals',
                'Uptime (hrs)': reportData.totals.uptime.toFixed(0),
                'Maintenance (hrs)': reportData.totals.maintenance.toFixed(0),
                'Down (hrs)': reportData.totals.down.toFixed(0),
                'Availability (%)': reportData.kpis.avgUptime.toFixed(1),
            });
        }
        setExportData(dataToExport, 'vehicle_availability');
    }, [reportData, setExportData]);

    if (!isClient) return <p>Loading report...</p>;

  return (
    <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Uptime</CardTitle>
                    <Truck className="h-5 w-5 text-success" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{reportData.kpis.avgUptime.toFixed(1)}%</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Maintenance</CardTitle>
                    <Wrench className="h-5 w-5 text-warning-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{reportData.kpis.avgMaintenance.toFixed(1)}%</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Downtime</CardTitle>
                    <CircleOff className="h-5 w-5 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{reportData.kpis.avgDown.toFixed(1)}%</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Availability Breakdown by Vehicle</CardTitle>
                        <CardDescription>Mocked uptime, maintenance, and downtime hours for each vehicle.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Uptime (hrs)</TableHead>
                                    <TableHead>Maint. (hrs)</TableHead>
                                    <TableHead>Down (hrs)</TableHead>
                                    <TableHead>Availability</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.tableData.map(v => (
                                    <TableRow key={v.id}>
                                        <TableCell className="font-medium">{v.plate}</TableCell>
                                        <TableCell>{v.uptimeHours.toFixed(0)}</TableCell>
                                        <TableCell>{v.maintenanceHours.toFixed(0)}</TableCell>
                                        <TableCell>{v.downHours.toFixed(0)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={v.availability} className="w-20" />
                                                <span>{v.availability.toFixed(1)}%</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell className="font-bold">Fleet Totals</TableCell>
                                    <TableCell className="font-bold">{reportData.totals.uptime.toFixed(0)}</TableCell>
                                    <TableCell className="font-bold">{reportData.totals.maintenance.toFixed(0)}</TableCell>
                                    <TableCell className="font-bold">{reportData.totals.down.toFixed(0)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-bold">
                                            <Progress value={reportData.kpis.avgUptime} className="w-20" />
                                            <span>{reportData.kpis.avgUptime.toFixed(1)}%</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            {/* Donut Chart */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Fleet-wide Time Distribution</CardTitle>
                        <CardDescription>Total hours distribution across all vehicles.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full max-w-[300px]">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Pie data={reportData.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
                                    {reportData.chartData.map(entry => (
                                        <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} verticalAlign="bottom" height={40}/>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
