
'use client';

import { MaintenanceTicket } from '@/lib/types';
import { MaintenanceTicketCard } from './maintenance-ticket-card';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface MaintenanceBoardProps {
  tickets: MaintenanceTicket[];
  onCreateWorkOrder: () => void;
  onEditTicket: (ticket: MaintenanceTicket) => void;
}

type Status = 'Scheduled' | 'In Progress' | 'Completed' | 'Deferred';

const columns: Status[] = ['Scheduled', 'In Progress', 'Completed', 'Deferred'];

export function MaintenanceBoard({ tickets, onCreateWorkOrder, onEditTicket }: MaintenanceBoardProps) {
  const ticketsByStatus = columns.reduce((acc, status) => {
    acc[status] = tickets.filter((ticket) => ticket.status === status);
    return acc;
  }, {} as Record<Status, MaintenanceTicket[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start h-[calc(100vh-22rem)]">
      {columns.map((status) => (
        <div key={status} className="bg-muted/50 rounded-lg h-full flex flex-col">
          <h3 className="font-semibold text-lg p-4 pb-2">{status} ({ticketsByStatus[status].length})</h3>
          <ScrollArea className="flex-1">
            <div className="space-y-4 p-4 pt-2">
              {ticketsByStatus[status].length > 0 ? (
                  ticketsByStatus[status].map((ticket) => (
                      <MaintenanceTicketCard key={ticket.id} ticket={ticket} onEdit={onEditTicket} />
                  ))
              ) : (
                  <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                      <p>No tickets in this status.</p>
                      {status === 'Scheduled' && (
                          <Button variant="link" size="sm" onClick={onCreateWorkOrder} className="mt-2">
                             <PlusCircle className="mr-2"/> Create Work Order
                          </Button>
                      )}
                  </div>
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
