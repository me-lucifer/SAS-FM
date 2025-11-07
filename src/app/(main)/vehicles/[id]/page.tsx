
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getVehicleById, getDriverById, fleets } from '@/lib/data';
import { VehicleDetailHeader } from '@/components/vehicles/vehicle-detail-header';
import { VehicleDetailTabs } from '@/components/vehicles/vehicle-detail-tabs';
import { CreateWorkOrderDialog } from '@/components/maintenance/create-work-order-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, ChevronLeft, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { MaintenanceTicket } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function VehicleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [isWorkOrderDialogOpen, setIsWorkOrderDialogOpen] = useState(false);
  const { toast } = useToast();

  const vehicle = getVehicleById(id);
  const driver = vehicle ? getDriverById(vehicle.driver_id) : undefined;
  const fleet = fleets.find(f => f.name === vehicle?.fleet);

  const handleTicketCreate = (newTicket: MaintenanceTicket) => {
    // In a real app, you would also update a shared state or refetch data.
    // For this mock, we just show a toast.
    toast({
        title: 'Work Order Scheduled',
        description: `A ${newTicket.type.toLowerCase()} has been scheduled for vehicle ${newTicket.vehicle_id}.`,
    });
  };

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/vehicles">
                <ChevronLeft />
                <span className="sr-only">Back to vehicles</span>
            </Link>
        </Button>
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard"><Home className="h-4 w-4"/></Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/vehicles">Vehicles</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{vehicle.plate}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      </div>

      <VehicleDetailHeader vehicle={vehicle} driver={driver} fleet={fleet}>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="font-semibold text-sm">Driver</p>
                <p className="text-muted-foreground">{driver?.name || 'Unassigned'}</p>
            </div>
            <div className="text-right">
                <p className="font-semibold text-sm">Fleet</p>
                <p className="text-muted-foreground">{fleet?.name || 'N/A'}</p>
            </div>
            <Button variant="outline"><Pencil className="mr-2"/>Edit Vehicle</Button>
        </div>
      </VehicleDetailHeader>
      <VehicleDetailTabs vehicle={vehicle} onScheduleMaintenance={() => setIsWorkOrderDialogOpen(true)} />
      <CreateWorkOrderDialog 
        isOpen={isWorkOrderDialogOpen}
        setIsOpen={setIsWorkOrderDialogOpen}
        vehicle={vehicle}
        onTicketCreate={handleTicketCreate}
      />
    </div>
  );
}
