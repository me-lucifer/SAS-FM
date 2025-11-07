'use client';

import { useParams } from 'next/navigation';
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
  } from "@/components/ui/alert-dialog"
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

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

export default function MaintenanceTicketDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const ticket = getTicketById(id);
  const vehicle = ticket ? getVehicleById(ticket.vehicle_id) : undefined;

  if (!ticket || !vehicle) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Work Order: ${ticket.type} for ${vehicle.plate}`}
        description={`Ticket #${ticket.id} • Created on ${format(new Date(), 'PP')}`}
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
                                <Button size="sm" variant="outline"><Play className="mr-2" />Start Work</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Start Work?</AlertDialogTitle>
                                    <AlertDialogDescription>This will change the ticket status to "In Progress".</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction>Confirm</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm"><CheckCircle className="mr-2"/>Complete Work</Button>
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
                                        <Input id="actual_cost" type="number" placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label htmlFor="close_odo_km" className="text-sm font-medium">Closing Odometer (km)</label>
                                        <Input id="close_odo_km" type="number" placeholder={vehicle.odo_km.toString()} />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction>Complete</AlertDialogAction>
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
                    <p className="text-muted-foreground text-sm">No attachments uploaded yet.</p>
                    <Button variant="outline" size="sm" className="mt-4"><Paperclip className="mr-2" />Upload File</Button>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Timeline & Notes</CardTitle>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8"><MessageSquare className="h-4 w-4"/></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Add a Note</AlertDialogTitle></AlertDialogHeader>
                        <Textarea placeholder="Type your note here."/>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Save Note</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm">Timeline coming soon...</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Other Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full justify-start"><XCircle className="mr-2"/>Defer Ticket</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Defer Ticket?</AlertDialogTitle>
                            <AlertDialogDescription>This action will postpone the maintenance. Please provide a reason.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea placeholder="Reason for deferral..." />
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Defer</AlertDialogAction>
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
