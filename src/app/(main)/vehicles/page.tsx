
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { VehicleTable } from '@/components/vehicles/vehicle-table';
import { Button } from '@/components/ui/button';
import { Download, PlusCircle } from 'lucide-react';
import { vehicles as initialVehicles, drivers, fleets } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vehicle, VehicleStatus } from '@/lib/types';
import Link from 'next/link';
import { CreateWorkOrderDialog } from '@/components/maintenance/create-work-order-dialog';
import { exportToCsv } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const vehicleTypes = [...new Set(initialVehicles.map((v) => v.type))];
const vehicleStatuses: VehicleStatus[] = ['Active', 'Maintenance', 'Down'];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [fleetFilter, setFleetFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isWorkOrderDialogOpen, setIsWorkOrderDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { toast } = useToast();

  const handleScheduleMaintenance = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsWorkOrderDialogOpen(true);
  };

  const handleToggleStatus = (vehicleId: string, newStatus: VehicleStatus) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
    const vehicle = vehicles.find(v => v.id === vehicleId);
    toast({
        title: 'Vehicle Status Updated',
        description: `Vehicle ${vehicle?.plate} has been set to "${newStatus}".`,
    });
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (vehicleToDelete) {
        setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete.id));
        toast({
            title: 'Vehicle Deleted',
            description: `Vehicle ${vehicleToDelete.plate} has been removed from the fleet.`,
            variant: 'destructive'
        });
    }
    setIsDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    return (
      (fleetFilter === 'all' || vehicle.fleet === fleetFilter) &&
      (statusFilter === 'all' || vehicle.status === statusFilter) &&
      (typeFilter === 'all' || vehicle.type === typeFilter)
    );
  });

  const handleExport = () => {
    const dataToExport = filteredVehicles.map(vehicle => {
        const driver = drivers.find(d => d.id === vehicle.driver_id);
        return {
            'Plate': vehicle.plate,
            'Type': vehicle.type,
            'Fleet': vehicle.fleet,
            'Driver': driver?.name || 'Unassigned',
            'Odometer (km)': vehicle.odo_km,
            'Status': vehicle.status,
        };
    });
    exportToCsv(dataToExport, 'vehicles', fleetFilter);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Vehicle Fleet"
          description="Manage your fleet of vehicles."
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2" />
              Export CSV
            </Button>
            <Button asChild>
              <Link href="/vehicles/new">
                  <PlusCircle className="mr-2" />
                  Add Vehicle
              </Link>
            </Button>
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={fleetFilter} onValueChange={setFleetFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Fleet..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fleets</SelectItem>
              {fleets.map((fleet) => (
                <SelectItem key={fleet.id} value={fleet.name}>
                  {fleet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {vehicleStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {vehicleTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <VehicleTable 
          vehicles={filteredVehicles} 
          drivers={drivers} 
          onScheduleMaintenance={handleScheduleMaintenance}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteClick}
        />
      </div>
      {selectedVehicle && (
        <CreateWorkOrderDialog
          isOpen={isWorkOrderDialogOpen}
          setIsOpen={setIsWorkOrderDialogOpen}
          vehicle={selectedVehicle}
          onTicketCreate={(newTicket) => {
            // This is a mock implementation. In a real app, you'd likely refetch or update a global state.
            toast({
              title: 'Work Order Scheduled',
              description: `A ${newTicket.type.toLowerCase()} has been scheduled for vehicle ${newTicket.vehicle_id}.`
            });
          }}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete vehicle {vehicleToDelete?.plate}. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
