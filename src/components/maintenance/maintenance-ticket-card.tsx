'use client';

import { MaintenanceTicket } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { vehicles } from '@/lib/data';
import {
  MoreHorizontal,
  Wrench,
  ScanEye,
  Calendar,
  Tag,
  DollarSign,
  Truck,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import Link from 'next/link';

interface MaintenanceTicketCardProps {
  ticket: MaintenanceTicket;
  onEdit: (ticket: MaintenanceTicket) => void;
}

const priorityVariant = {
  Low: 'secondary',
  Medium: 'warning',
  High: 'destructive',
} as const;

const typeIcon = {
    Service: Wrench,
    Repair: Wrench,
    Inspection: ScanEye
}

export function MaintenanceTicketCard({ ticket, onEdit }: MaintenanceTicketCardProps) {
  const vehicle = vehicles.find((v) => v.id === ticket.vehicle_id);
  const Icon = typeIcon[ticket.type] || Wrench;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between !pb-2">
        <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">{ticket.type}</CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/maintenance/${ticket.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEdit(ticket)}>Edit Ticket</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="text-sm space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>{vehicle?.plate || ticket.vehicle_id}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due: {format(new Date(ticket.due_date), 'PP')}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span>{ticket.vendor}</span>
        </div>
        
        <div className="pt-2">
            <Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
