
'use client';

import { useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { FuelChart } from '@/components/dashboard/fuel-chart';
import { FuelCostByStationChart } from '@/components/dashboard/fuel-cost-by-station-chart';
import { Banknote, Fuel, Droplets } from 'lucide-react';
import type { FuelEntry } from '@/lib/types';
import { useReportFilters } from '@/hooks/use-report-filters';
import { stations, fleets } from '@/lib/data';

interface FuelConsumptionReportProps {
  entries: FuelEntry[];
}

export function FuelConsumptionReport({ entries }: FuelConsumptionReportProps) {
  const { setExportData } = useReportFilters();

  const kpis = useMemo(() => {
    const totalLiters = entries.reduce((sum, entry) => sum + entry.fuel_l, 0);
    const totalCost = entries.reduce((sum, entry) => sum + (entry.total_cost || 0), 0);
    const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
    return { totalLiters, totalCost, avgPricePerLiter };
  }, [entries]);

  const pivotTableData = useMemo(() => {
    const pivot: { [fleet: string]: { [station: string]: { liters: number; cost: number } } } = {};
    const fleetTotals: { [fleet: string]: { liters: number; cost: number } } = {};
    const stationTotals: { [station: string]: { liters: number; cost: number } } = {};
    const grandTotals = { liters: 0, cost: 0 };

    fleets.forEach(fleet => {
        pivot[fleet.name] = {};
        fleetTotals[fleet.name] = { liters: 0, cost: 0 };
    });

    stations.forEach(station => {
        stationTotals[station.name] = { liters: 0, cost: 0 };
    });

    entries.forEach(entry => {
        if (!pivot[entry.fleet]) {
            pivot[entry.fleet] = {};
            fleetTotals[entry.fleet] = { liters: 0, cost: 0 };
        }
        if (!pivot[entry.fleet][entry.station]) {
            pivot[entry.fleet][entry.station] = { liters: 0, cost: 0 };
        }

        const cost = entry.total_cost || 0;

        pivot[entry.fleet][entry.station].liters += entry.fuel_l;
        pivot[entry.fleet][entry.station].cost += cost;

        fleetTotals[entry.fleet].liters += entry.fuel_l;
        fleetTotals[entry.fleet].cost += cost;

        if (!stationTotals[entry.station]) {
            stationTotals[entry.station] = { liters: 0, cost: 0 };
        }
        stationTotals[entry.station].liters += entry.fuel_l;
        stationTotals[entry.station].cost += cost;
        
        grandTotals.liters += entry.fuel_l;
        grandTotals.cost += cost;
    });

    return { pivot, fleetTotals, stationTotals, grandTotals };
  }, [entries]);
  
  useEffect(() => {
    const dataToExport = fleets.flatMap(fleet => {
        return stations.map(station => {
            const pivotCell = pivotTableData.pivot[fleet.name]?.[station.name];
            return {
                'Fleet': fleet.name,
                'Station': station.name,
                'Total Liters': pivotCell ? pivotCell.liters.toFixed(2) : '0.00',
                'Total Cost (OMR)': pivotCell ? pivotCell.cost.toFixed(2) : '0.00',
            };
        });
    });
    setExportData(dataToExport, 'fuel_consumption_pivot');
  }, [pivotTableData, setExportData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Liters</CardTitle>
            <Fuel className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalLiters.toFixed(2)} L</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <Banknote className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalCost.toFixed(2)} OMR</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Price/Liter</CardTitle>
            <Droplets className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgPricePerLiter.toFixed(3)} OMR</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FuelCostByStationChart data={entries} />
        <FuelChart data={entries} />
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Pivot Table: Consumption by Fleet and Station</CardTitle>
              <CardDescription>Summarizes total liters and cost for each combination of fleet and station.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Fleet</TableHead>
                          {stations.map(s => <TableHead key={s.id} className="text-right">{s.name}</TableHead>)}
                          <TableHead className="text-right font-bold border-l">Fleet Total</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fleets.map(fleet => (
                        <TableRow key={fleet.id}>
                            <TableCell className="font-medium">{fleet.name}</TableCell>
                            {stations.map(station => (
                                <TableCell key={station.id} className="text-right">
                                    <div className="text-sm">{pivotTableData.pivot[fleet.name]?.[station.name]?.liters.toFixed(2) || '0.00'} L</div>
                                    <div className="text-xs text-muted-foreground">{pivotTableData.pivot[fleet.name]?.[station.name]?.cost.toFixed(2) || '0.00'} OMR</div>
                                </TableCell>
                            ))}
                            <TableCell className="text-right font-bold border-l">
                                <div>{pivotTableData.fleetTotals[fleet.name]?.liters.toFixed(2) || '0.00'} L</div>
                                <div className="text-xs text-muted-foreground">{pivotTableData.fleetTotals[fleet.name]?.cost.toFixed(2) || '0.00'} OMR</div>
                            </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                      <TableRow>
                          <TableCell className="font-bold">Station Totals</TableCell>
                          {stations.map(station => (
                              <TableCell key={station.id} className="text-right font-bold">
                                  <div>{pivotTableData.stationTotals[station.name]?.liters.toFixed(2) || '0.00'} L</div>
                                  <div className="text-xs text-muted-foreground">{pivotTableData.stationTotals[station.name]?.cost.toFixed(2) || '0.00'} OMR</div>
                              </TableCell>
                          ))}
                          <TableCell className="text-right font-bold border-l">
                                <div>{pivotTableData.grandTotals.liters.toFixed(2)} L</div>
                                <div className="text-xs text-muted-foreground">{pivotTableData.grandTotals.cost.toFixed(2)} OMR</div>
                          </TableCell>
                      </TableRow>
                  </TableFooter>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
}

    