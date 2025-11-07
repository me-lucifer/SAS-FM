
'use client';

import * as React from 'react';
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
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import {
  type Vehicle,
  type MaintenanceTicket,
} from '@/lib/types';
import { maintenanceTickets } from '@/lib/data';
import { MoreHorizontal, PlusCircle, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

interface VehicleMaintenanceTabProps {
  vehicle: Vehicle;
  onScheduleMaintenance: () => void;
}

const statusVariant = {
  Scheduled: 'secondary',
  'In Progress': 'warning',
  Completed: 'success',
  Deferred: 'destructive',
} as const;

const priorityVariant = {
    Low: 'secondary',
    Medium: 'warning',
    High: 'destructive',
  } as const;
  
function TableSkeleton() {
    return (
        [...Array(3)].map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
        ))
    )
}

export function VehicleMaintenanceTab({ vehicle, onScheduleMaintenance }: VehicleMaintenanceTabProps) {
  const [isClient, setIsClient] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredTickets = React.useMemo(() => {
    const vehicleTickets = maintenanceTickets.filter(
      (t) => t.vehicle_id === vehicle.id
    );
    if (statusFilter === 'all') {
      return vehicleTickets;
    }
    return vehicleTickets.filter((t) => t.status === statusFilter);
  }, [vehicle.id, statusFilter]);

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className='mb-4 md:mb-0'>
          <CardTitle>Maintenance History</CardTitle>
          <CardDescription>
            All maintenance tickets for vehicle {vehicle.plate}.
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Deferred">Deferred</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={onScheduleMaintenance}>
                <PlusCircle className="mr-2" />
                Create Work Order
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isClient ? <TableSkeleton /> : (
              filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className='font-medium'>{ticket.id}</TableCell>
                    <TableCell>{ticket.type}</TableCell>
                    <TableCell>{format(parseISO(ticket.due_date), 'PP')}</TableCell>
                    <TableCell>{ticket.vendor}</TableCell>
                    <TableCell><Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge></TableCell>
                    <TableCell><Badge variant={statusVariant[ticket.status]}>{ticket.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                              <Link href={`/maintenance/${ticket.id}`}>
                                  <ExternalLink className="mr-2 h-4 w-4"/>
                                  Open Ticket
                              </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No maintenance tickets for this vehicle.
                    <Button variant="link" onClick={onScheduleMaintenance}>Create one now</Button>
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
