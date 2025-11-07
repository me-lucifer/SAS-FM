
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { maintenanceTickets as initialMaintenanceTickets, vehicles } from '@/lib/data';
import { MaintenanceBoard } from '@/components/maintenance/maintenance-board';
import { MaintenanceCalendar } from '@/components/maintenance/maintenance-calendar';
import { MaintenanceFilters } from '@/components/maintenance/maintenance-filters';
import { MaintenanceTicket } from '@/lib/types';
import { CreateWorkOrderDialog } from '@/components/maintenance/create-work-order-dialog';
import { EditWorkOrderDialog } from '@/components/maintenance/edit-work-order-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download } from 'lucide-react';
import { Vehicle } from '@/lib/types';
import { exportToCsv } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function MaintenancePage() {
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(initialMaintenanceTickets);
  const [filters, setFilters] = useState({
    fleet: 'all',
    vehicle: 'all',
    priority: 'all',
    vendor: 'all',
  });
  const [isWorkOrderDialogOpen, setIsWorkOrderDialogOpen] = useState(false);
  const [isEditWorkOrderDialogOpen, setIsEditWorkOrderDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);

  const { toast } = useToast();
  
  // This is a stand-in. In a real app, you'd select a vehicle in a more sophisticated way.
  const firstVehicle = vehicles[0];

  const filteredTickets = maintenanceTickets.filter((ticket) => {
    const vehicle = vehicles.find((v) => v.id === ticket.vehicle_id);
    return (
      (filters.fleet === 'all' || vehicle?.fleet === filters.fleet) &&
      (filters.vehicle === 'all' || ticket.vehicle_id === filters.vehicle) &&
      (filters.priority === 'all' || ticket.priority === filters.priority) &&
      (filters.vendor === 'all' || ticket.vendor === filters.vendor)
    );
  });
  
  const handleCreateWorkOrder = () => setIsWorkOrderDialogOpen(true);

  const handleEditTicket = (ticket: MaintenanceTicket) => {
    setSelectedTicket(ticket);
    setIsEditWorkOrderDialogOpen(true);
  };
  
  const handleTicketUpdate = (updatedTicket: MaintenanceTicket) => {
    setMaintenanceTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    toast({
      title: 'Ticket Updated',
      description: `Work order #${updatedTicket.id} has been successfully updated.`,
    });
    setIsEditWorkOrderDialogOpen(false);
  };

  const handleTicketCreate = (newTicket: MaintenanceTicket) => {
    setMaintenanceTickets(prev => [newTicket, ...prev]);
    toast({
        title: 'Work Order Scheduled',
        description: `A ${newTicket.type.toLowerCase()} has been scheduled for vehicle ${newTicket.vehicle_id}.`,
    });
  };

  const handleExport = () => {
    const dataToExport = filteredTickets.map(ticket => {
        const vehicle = vehicles.find(v => v.id === ticket.vehicle_id);
        return {
            'Ticket ID': ticket.id,
            'Vehicle Plate': vehicle?.plate,
            'Work Type': ticket.type,
            'Priority': ticket.priority,
            'Status': ticket.status,
            'Due Date': ticket.due_date,
            'Vendor': ticket.vendor,
        }
    });
    exportToCsv(dataToExport, 'maintenance_tickets');
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Maintenance"
          description="Track and manage all maintenance tasks."
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2" />
                Export CSV
            </Button>
            <Button onClick={handleCreateWorkOrder}>
                <PlusCircle className="mr-2" />
                Create Work Order
            </Button>
          </div>
        </PageHeader>
        <MaintenanceFilters onFilterChange={setFilters} />
        <Tabs defaultValue="board">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="board">
            <MaintenanceBoard 
              tickets={filteredTickets} 
              onCreateWorkOrder={handleCreateWorkOrder}
              onEditTicket={handleEditTicket}
            />
          </TabsContent>
          <TabsContent value="calendar">
            <MaintenanceCalendar tickets={filteredTickets} />
          </TabsContent>
        </Tabs>
      </div>
      {firstVehicle && (
        <CreateWorkOrderDialog
            isOpen={isWorkOrderDialogOpen}
            setIsOpen={setIsWorkOrderDialogOpen}
            vehicle={firstVehicle}
            onTicketCreate={handleTicketCreate}
        />
      )}
      {selectedTicket && (
        <EditWorkOrderDialog
            isOpen={isEditWorkOrderDialogOpen}
            setIsOpen={setIsEditWorkOrderDialogOpen}
            ticket={selectedTicket}
            onTicketUpdate={handleTicketUpdate}
        />
      )}
    </>
  );
}
