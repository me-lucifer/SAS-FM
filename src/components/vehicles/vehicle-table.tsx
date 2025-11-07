
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Pencil, Wrench, AlertTriangle, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type Vehicle, type Driver, type VehicleStatus } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { fuelEntries, maintenanceTickets } from '@/lib/data';
import { format, isAfter, parseISO } from 'date-fns';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

interface VehicleTableProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onScheduleMaintenance: (vehicle: Vehicle) => void;
  onToggleStatus: (vehicleId: string, newStatus: VehicleStatus) => void;
  onDelete: (vehicle: Vehicle) => void;
}

const statusVariant = {
  Active: 'success',
  Maintenance: 'warning',
  Down: 'destructive',
} as const;

function TableSkeleton() {
  return (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16 mt-1" />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  )
}

export function VehicleTable({ vehicles, drivers, onScheduleMaintenance, onToggleStatus, onDelete }: VehicleTableProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const getDriver = (driverId?: string) => drivers.find((d) => d.id === driverId);

  const getVehicleInfo = (vehicleId: string) => {
    const lastFuelEntry = fuelEntries
      .filter(entry => entry.vehicle_id === vehicleId)
      .sort((a, b) => isAfter(parseISO(b.ts), parseISO(a.ts)) ? 1 : -1)[0];

    const nextService = maintenanceTickets
      .filter(ticket => ticket.vehicle_id === vehicleId && (ticket.status === 'Scheduled' || ticket.status === 'In Progress'))
      .sort((a, b) => isAfter(parseISO(a.due_date), parseISO(b.due_date)) ? 1 : -1)[0];
      
    return {
      lastFuelDate: lastFuelEntry ? parseISO(lastFuelEntry.ts) : null,
      nextServiceDate: nextService ? parseISO(nextService.due_date) : null,
    };
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Fleet</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead>Last Fuel</TableHead>
              <TableHead>Next Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isClient ? <TableSkeleton /> : (
              vehicles.length > 0 ? vehicles.map((vehicle) => {
                const driver = getDriver(vehicle.driver_id);
                const driverAvatar = PlaceHolderImages.find(img => img.id === driver?.avatar);
                const { lastFuelDate, nextServiceDate } = getVehicleInfo(vehicle.id);

                return (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">
                      <Link href={`/vehicles/${vehicle.id}`} className="hover:underline">
                        <div>{vehicle.plate}</div>
                        <div className="text-xs text-muted-foreground">{vehicle.type}</div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {driver ? (
                         <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                              {driverAvatar && <AvatarImage src={driverAvatar.imageUrl} alt={driver.name} />}
                              <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                           <Link href={`/drivers/${driver.id}`} className="hover:underline">
                            {driver.name}
                          </Link>
                         </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{vehicle.fleet}</TableCell>
                    <TableCell>{vehicle.odo_km.toLocaleString()} km</TableCell>
                    <TableCell>
                      {lastFuelDate ? format(lastFuelDate, 'PP') : 'N/A'}
                    </TableCell>
                    <TableCell>
                    {nextServiceDate ? format(nextServiceDate, 'PP') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[vehicle.status]}>{vehicle.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                              <Link href={`/vehicles/${vehicle.id}`}>
                                  <Pencil className="mr-2 h-4 w-4" />View / Edit
                              </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onScheduleMaintenance(vehicle)}>
                              <Wrench className="mr-2 h-4 w-4" />Schedule Maintenance
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {vehicle.status === 'Down' ? (
                              <DropdownMenuItem onSelect={() => onToggleStatus(vehicle.id, 'Active')}><PlayCircle className="mr-2 h-4 w-4" />Return to Service</DropdownMenuItem>
                          ) : (
                              <DropdownMenuItem onSelect={() => onToggleStatus(vehicle.id, 'Down')}><AlertTriangle className="mr-2 h-4 w-4" />Set as Down</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => onDelete(vehicle)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                  <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                          No vehicles found for the selected filters.
                          <Button variant="link" asChild><Link href="/vehicles/new">Add a vehicle</Link></Button>
                      </TableCell>
                  </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
