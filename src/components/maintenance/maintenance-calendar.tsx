
'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { MaintenanceTicket } from '@/lib/types';
import { parseISO, isSameDay, format } from 'date-fns';
import { MaintenanceTicketCard } from './maintenance-ticket-card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';


interface MaintenanceCalendarProps {
  tickets: MaintenanceTicket[];
}

export function MaintenanceCalendar({ tickets }: MaintenanceCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleEditTicketPlaceholder = () => {
    toast({
      title: 'Edit from Calendar',
      description:
        'To edit a ticket, please use the "Board" view.',
    });
  };

  const ticketsByDay = tickets.reduce((acc, ticket) => {
    const day = format(new Date(ticket.due_date), 'yyyy-MM-dd');
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(ticket);
    return acc;
  }, {} as Record<string, MaintenanceTicket[]>);

  const modifiers = {
    scheduled: (day: Date) => {
      return Object.keys(ticketsByDay).some((scheduledDay) =>
        isSameDay(parseISO(scheduledDay), day)
      );
    },
  };

  const modifiersStyles = {
    scheduled: {
      fontWeight: 'bold',
    },
  };
  
  const selectedDayString = date ? format(date, 'yyyy-MM-dd') : '';
  const ticketsForSelectedDay = ticketsByDay[selectedDayString] || [];


  return (
    <Card>
      <CardContent className="p-2 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              components={{
                DayContent: (props) => {
                  const dayKey = format(props.date, 'yyyy-MM-dd');
                  const dayTickets = ticketsByDay[dayKey] || [];
                  const isScheduled = dayTickets.length > 0;
                  return (
                    <div className="relative flex items-center justify-center h-9 w-9">
                      {isScheduled ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <div
                              className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-full cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{props.date.getDate()}</span>
                              <span className="absolute top-0 right-0 block h-2 w-2 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-background"></span>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <h4 className="font-medium leading-none">
                                  Maintenance for {format(props.date, 'PP')}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {dayTickets.length} ticket(s) scheduled.
                                </p>
                              </div>
                              <div className="grid gap-2">
                                {dayTickets.map((ticket) => (
                                  <div key={ticket.id} className="text-sm">
                                    {ticket.type} for {ticket.vehicle_id}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span>{props.date.getDate()}</span>
                      )}
                    </div>
                  );
                },
              }}
            />
          </div>
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4">
              Tickets for {date ? format(date, 'PP') : 'selected date'}
            </h3>
            <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                {ticketsForSelectedDay.length > 0 ? (
                    ticketsForSelectedDay.map(
                      (ticket) => (
                        <Link key={ticket.id} href={`/maintenance/${ticket.id}`} className="block">
                           <MaintenanceTicketCard ticket={ticket} onEdit={handleEditTicketPlaceholder} />
                        </Link>
                      )
                    )
                ) : (
                    <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-muted-foreground/30 rounded-lg h-[200px] flex flex-col justify-center items-center">
                        <p>No tickets scheduled for this day.</p>
                    </div>
                )}
                </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
