
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTicketById, getVehicleById } from '@/lib/data';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  FileText,
  MessageSquare,
  Wrench,
  Calendar,
  Tag,
  DollarSign,
  Truck,
  Paperclip,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Home,
  Trash2,
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { format, subDays } from 'date-fns';
import { MaintenanceTicket, MaintenanceTicketStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
  } from '@/components/ui/table';

const priorityVariant = {
  Low: 'secondary',
  Medium: 'warning',
  High: 'destructive',
} as const;

const statusVariant = {
    Scheduled: 'secondary',
    'In Progress': 'warning',
    Completed: 'success',
    Deferred: 'destructive',
} as const;

type TimelineEvent = {
    date: Date;
    event: string;
    author: string;
}

type Attachment = {
    id: string;
    filename: string;
    uploadDate: Date;
};

export default function MaintenanceTicketDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<MaintenanceTicket | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const fetchedTicket = getTicketById(id);
    if (fetchedTicket) {
      setTicket(fetchedTicket);
      // Create mock timeline based on ticket data
      setTimeline([
          { date: new Date(fetchedTicket.due_date), event: `Status updated to ${fetchedTicket.status}`, author: 'System' },
          { date: subDays(new Date(fetchedTicket.due_date), 2), event: 'Assigned to City Garage.', author: 'Fleet Manager' },
          { date: subDays(new Date(fetchedTicket.due_date), 3), event: 'Work order created.', author: 'Fleet Manager' },
      ].sort((a,b) => b.date.getTime() - a.date.getTime()));
    }
  }, [id]);


  const vehicle = ticket ? getVehicleById(ticket.vehicle_id) : undefined;
  
  const handleStatusChange = (newStatus: MaintenanceTicketStatus) => {
    if (ticket) {
      const updatedTicket = { ...ticket, status: newStatus };
      setTicket(updatedTicket);
      setTimeline(prev => [
          { date: new Date(), event: `Status updated to ${newStatus}`, author: 'Fleet Manager'},
          ...prev
      ]);
      toast({
          title: 'Status Updated',
          description: `Ticket status changed to "${newStatus}".`,
      });
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
        setTimeline(prev => [
            { date: new Date(), event: newNote, author: 'Fleet Manager'},
            ...prev
        ]);
        setNewNote('');
        toast({ title: 'Note Added' });
    }
  };

  const handleAddAttachment = () => {
    const newAttachment: Attachment = {
        id: `att${attachments.length + 1}`,
        filename: `placeholder_invoice_${attachments.length + 1}.pdf`,
        uploadDate: new Date(),
    };
    setAttachments(prev => [...prev, newAttachment]);
    toast({ title: 'Attachment Added' });
  };
  
  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    toast({ title: 'Attachment Removed', variant: 'destructive' });
  };


  if (!ticket || !vehicle) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/maintenance">
            <ChevronLeft />
            <span className="sr-only">Back to Maintenance</span>
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
                <Link href="/maintenance">Maintenance</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>#{ticket.id}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <PageHeader
        title={`Work Order: ${ticket.type} for ${vehicle.plate}`}
        description={`Ticket #${ticket.id} • Created on ${format(subDays(new Date(ticket.due_date), 3), 'PP')}`}
      >
        <div className="flex items-center gap-2">
            <Badge variant={statusVariant[ticket.status]}>{ticket.status}</Badge>
            <Badge variant={priorityVariant[ticket.priority]}>Priority: {ticket.priority}</Badge>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Work Information</CardTitle>
                        <CardDescription>Details of the maintenance task.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" disabled={ticket.status !== 'Scheduled'}><Play className="mr-2" />Start Work</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Start Work?</AlertDialogTitle>
                                    <AlertDialogDescription>This will change the ticket status to "In Progress".</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleStatusChange('In Progress')}>Confirm</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" disabled={ticket.status !== 'In Progress'}><CheckCircle className="mr-2"/>Complete Work</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Complete Work Order</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Enter the final details to mark this ticket as complete.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="actual_cost" className="text-sm font-medium">Actual Cost (OMR)</label>
                                        <Input id="actual_cost" type="number" placeholder="0.00" defaultValue={ticket.est_cost} />
                                    </div>
                                    <div>
                                        <label htmlFor="close_odo_km" className="text-sm font-medium">Closing Odometer (km)</label>
                                        <Input id="close_odo_km" type="number" placeholder={vehicle.odo_km.toString()} />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleStatusChange('Completed')}>Complete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-muted-foreground" /><strong>Type:</strong> {ticket.type}</div>
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><strong>Due:</strong> {format(new Date(ticket.due_date), 'PP')}</div>
                        <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" /><strong>Vendor:</strong> {ticket.vendor}</div>
                        <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><strong>Est. Cost:</strong> {ticket.est_cost.toFixed(2)} OMR</div>
                        <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" /><strong>Vehicle:</strong> {vehicle.plate}</div>
                        <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" /><strong>Odometer:</strong> {vehicle.odo_km.toLocaleString()} km</div>
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{ticket.notes}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                    {attachments.length > 0 ? (
                        <Table>
                            <TableBody>
                                {attachments.map(att => (
                                    <TableRow key={att.id}>
                                        <TableCell><Paperclip className="h-4 w-4 inline mr-2 text-muted-foreground"/>{att.filename}</TableCell>
                                        <TableCell className="text-muted-foreground">{format(att.uploadDate, 'PP')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveAttachment(att.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-sm">No attachments uploaded yet.</p>
                    )}
                    <Button variant="outline" size="sm" className="mt-4" onClick={handleAddAttachment}><Paperclip className="mr-2" />Upload File</Button>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Timeline & Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Textarea placeholder="Type your note here." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                        <Button onClick={handleAddNote}>Add</Button>
                    </div>
                    <div className="space-y-6">
                        {timeline.map((item, index) => (
                             <div key={index} className="flex gap-3">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground"/>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm">{item.event}</p>
                                    <p className="text-xs text-muted-foreground">{item.author} • {format(item.date, 'PP HH:mm')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Other Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full justify-start" disabled={ticket.status === 'Completed' || ticket.status === 'Deferred'}>
                            <XCircle className="mr-2"/>Defer Ticket
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Defer Ticket?</AlertDialogTitle>
                            <AlertDialogDescription>This action will postpone the maintenance. Please provide a reason.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea placeholder="Reason for deferral..." />
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleStatusChange('Deferred')}>Defer</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" className="w-full justify-start"><FileText className="mr-2"/>Print Work Order</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
