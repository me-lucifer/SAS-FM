'use client';

import { useState, useMemo, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { vehicles } from '@/lib/data';

const initialState = {
  fleet: 'all',
  vehicle: 'all',
  station: 'all',
};

// Create a context-like state outside of React components
let reportState = {
  dateRange: {
    from: subDays(new Date(), 13),
    to: new Date(),
  } as DateRange | undefined,
  filters: initialState,
  exportData: [] as any[],
  reportName: 'report'
};

const listeners = new Set<() => void>();

const notify = () => listeners.forEach(l => l());

const setDateRange = (dateRange: DateRange | undefined) => {
  reportState.dateRange = dateRange;
  notify();
};

const setFilters = (filters: typeof initialState) => {
  reportState.filters = filters;
  notify();
}

const setExportData = (data: any[], name: string) => {
  reportState.exportData = data;
  reportState.reportName = name;
  // No need to notify listeners for export data
}

// Hook to use and interact with the shared state
export function useReportFilters() {
  const [state, setState] = useState(reportState);

  useEffect(() => {
    const listener = () => setState(reportState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    }
  }, []);

  const handleFilterChange = (filterName: string) => (value: string) => {
    setFilters({ ...state.filters, [filterName]: value });
  };
  
  const onDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  const filteredVehicles = useMemo(() => state.filters.fleet === 'all'
    ? vehicles
    : vehicles.filter(v => v.fleet === state.filters.fleet), [state.filters.fleet]);

  useEffect(() => {
    // Make data available globally for the export function
    (window as any).reportContext = {
      exportData: reportState.exportData,
      reportName: reportState.reportName,
    };
  }, [state.exportData, state.reportName]);

  return {
    dateRange: state.dateRange,
    onDateChange,
    filters: state.filters,
    handleFilterChange,
    filteredVehicles,
    setExportData,
  };
}
