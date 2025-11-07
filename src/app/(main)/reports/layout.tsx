'use client';

import { PageHeader } from '@/components/shared/page-header';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DateRangePicker } from '@/components/shared/date-range-picker';
import { exportToCsv } from '@/lib/utils';
import { fuelEntries, vehicles, stations } from '@/lib/data';
import { useReportFilters } from '@/hooks/use-report-filters';
import { DateRange } from 'react-day-picker';

const reportsNav = [
  { name: 'Daily Fuel Issue Log', href: '/reports/daily-fuel-log' },
  { name: 'Vehicle Log & Availability', href: '/reports/vehicle-availability' },
  { name: 'Fuel Consumption & Cost', href: '/reports/fuel-consumption' },
];

const reportTitles: { [key: string]: string } = {
    '/reports/daily-fuel-log': 'Daily Fuel Issue Log',
    '/reports/vehicle-availability': 'Vehicle Log & Availability',
    '/reports/fuel-consumption': 'Fuel Consumption & Cost',
};

const reportDescriptions: { [key: string]: string } = {
    '/reports/daily-fuel-log': 'View and export detailed fuel transaction logs.',
    '/reports/vehicle-availability': 'Analyze vehicle uptime, maintenance, and downtime.',
    '/reports/fuel-consumption': 'Summarize fuel consumption and costs across the fleet.',
};


export default function ReportsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { dateRange, onDateChange, setExportData } = useReportFilters();
  
  const showDatepicker = pathname === '/reports/daily-fuel-log' || pathname === '/reports/fuel-consumption';

  const handleExport = () => {
    const { exportData, reportName } = (window as any).reportContext || {};
    if (exportData && exportData.length > 0) {
        exportToCsv(exportData, reportName || 'report');
    } else {
        alert('No data available to export for the current view.');
    }
  };


  return (
    <div className="flex flex-col gap-6">
        <PageHeader
            title={reportTitles[pathname] || 'Reports'}
            description={reportDescriptions[pathname] || 'Generate customizable reports on fleet performance.'}
        >
            <div className="flex items-center gap-2">
                {showDatepicker && <DateRangePicker onDateChange={onDateChange} initialDateRange={dateRange} />}
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2" />
                    Export CSV
                </Button>
            </div>
        </PageHeader>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <aside className="md:col-span-1 lg:col-span-1">
            <nav className="flex flex-col space-y-2">
                {reportsNav.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.href
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                >
                    {item.name}
                </Link>
                ))}
            </nav>
            </aside>
            <main className="md:col-span-3 lg:col-span-4">{children}</main>
        </div>
    </div>
  );
}
