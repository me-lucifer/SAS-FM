'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Paperclip } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { MaintenanceTicket, Vehicle } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CreateWorkOrderDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  vehicle: Vehicle;
  onTicketCreate: (newTicket: MaintenanceTicket) => void;
}

const workOrderSchema = z.object({
  workType: z.enum(['Service', 'Repair', 'Inspection'], {
    required_error: 'Work type is required.',
  }),
  priority: z.enum(['Low', 'Medium', 'High'], {
    required_error: 'Priority is required.',
  }),
  description: z.string().optional(),
  vendor: z.string().optional(),
  scheduledDate: z.date({
    required_error: 'A scheduled date is required.',
  }),
  estCost: z.coerce.number().optional(),
});

export function CreateWorkOrderDialog({
  isOpen,
  setIsOpen,
  vehicle,
  onTicketCreate,
}: CreateWorkOrderDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof workOrderSchema>>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      description: '',
      vendor: '',
      estCost: 0,
    },
  });

  function onSubmit(values: z.infer<typeof workOrderSchema>) {
    const newTicket: MaintenanceTicket = {
        id: `M${Math.floor(Math.random() * 1000) + 11}`, // Temporary random ID
        vehicle_id: vehicle.id,
        type: values.workType,
        priority: values.priority,
        due_date: format(values.scheduledDate, 'yyyy-MM-dd'),
        status: 'Scheduled',
        vendor: values.vendor || 'Unassigned',
        est_cost: values.estCost || 0,
        notes: values.description || '',
    };
    onTicketCreate(newTicket);
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
          <DialogDescription>
            Schedule a new maintenance task for vehicle: <strong>{vehicle.plate}</strong>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a work type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Service">Service</SelectItem>
                        <SelectItem value="Repair">Repair</SelectItem>
                        <SelectItem value="Inspection">Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the work to be done..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. City Garage" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Scheduled Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0,0,0,0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="estCost"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Est. Cost (OMR)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormItem>
                    <FormLabel>Attachments</FormLabel>
                    <FormControl>
                        <Input type="file" disabled />
                    </FormControl>
                    <FormDescription>
                        You can't upload files yet. This is a placeholder.
                    </FormDescription>
                </FormItem>
             </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Save Draft</Button>
              <Button type="submit">Schedule</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
