
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
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
import { Separator } from '@/components/ui/separator';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  type Vehicle,
  type FuelEntry,
  type Driver,
} from '@/lib/types';
import { fuelEntries, drivers } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Eye,
  AlertTriangle,
  Truck,
  Gauge,
  Fuel,
  Paperclip,
  StickyNote,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface VehicleFuelTabProps {
  vehicle: Vehicle;
}

const statusVariant = {
  Submitted: 'warning',
  Approved: 'success',
  Rejected: 'destructive',
} as const;

const flagIcons: { [key: string]: React.ElementType } = {
  'odo delta high': AlertTriangle,
  'fuel over max': AlertTriangle,
  'low ocr': AlertTriangle,
};

const chartConfig = {
  fuel: {
    label: 'Fuel (L)',
    color: 'hsl(var(--chart-1))',
  },
};

export function VehicleFuelTab({ vehicle }: VehicleFuelTabProps) {
  const { toast } = useToast();
  const [isClient, setIsClient] = React.useState(false);
  const [vehicleFuelEntries, setVehicleFuelEntries] = React.useState<FuelEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = React.useState<FuelEntry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    setVehicleFuelEntries(fuelEntries.filter((e) => e.vehicle_id === vehicle.id));
  }, [vehicle.id]);

  const handleViewClick = (entry: FuelEntry) => {
    setSelectedEntry(entry);
    setIsSheetOpen(true);
  };
  
  const handleStatusChange = (entryId: string, newStatus: 'Approved' | 'Rejected') => {
    setVehicleFuelEntries(prevEntries => 
        prevEntries.map(entry => 
            entry.id === entryId ? { ...entry, status: newStatus } : entry
        )
    );
    toast({
        title: `Entry ${newStatus}`,
        description: `The fuel entry has been marked as ${newStatus.toLowerCase()}.`,
    });
    setIsSheetOpen(false);
  };

  const chartData = React.useMemo(() => {
    const fourteenDaysAgo = subDays(new Date(), 14);
    const recentEntries = vehicleFuelEntries.filter((entry) =>
      isAfter(parseISO(entry.ts), fourteenDaysAgo)
    );

    const dailyFuel = recentEntries.reduce((acc, entry) => {
      const date = format(parseISO(entry.ts), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += entry.fuel_l;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyFuel)
      .map(([date, fuel]) => ({ date: format(parseISO(date), 'MMM d'), fuel }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [vehicleFuelEntries]);

  const getDriver = (driverId: string) => drivers.find((d) => d.id === driverId);
  const selectedDriver = selectedEntry ? getDriver(selectedEntry.driver_id) : null;
  const driverAvatar = selectedDriver ? PlaceHolderImages.find(img => img.id === selectedDriver.avatar) : null;
  const pumpBeforeImg = PlaceHolderImages.find(p => p.id === 'pump-before');
  const pumpAfterImg = PlaceHolderImages.find(p => p.id === 'pump-after');
  const receiptImg = PlaceHolderImages.find(p => p.id === 'receipt');

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Fuel Consumption Chart</CardTitle>
        <CardDescription>
          Daily fuel consumption in Liters for the last 14 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="fuel"
              type="monotone"
              stroke="var(--color-fuel)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Fuel History</CardTitle>
        <CardDescription>
          All fuel entries for vehicle {vehicle.plate}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Liters</TableHead>
              <TableHead>Odo (km)</TableHead>
              <TableHead>Δ km</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isClient && vehicleFuelEntries.length > 0 ? (
              vehicleFuelEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(parseISO(entry.ts), 'PP')}</TableCell>
                  <TableCell>{entry.station}</TableCell>
                  <TableCell>{entry.fuel_l.toFixed(2)}</TableCell>
                  <TableCell>{entry.odo_km.toLocaleString()}</TableCell>
                  <TableCell>{entry.odo_delta_km.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {entry.flags.map((flag, i) => {
                        const Icon = flagIcons[flag] || AlertTriangle;
                        return <Icon key={i} className="h-4 w-4 text-destructive" title={flag} />;
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[entry.status]}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewClick(entry)}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {isClient ? 'No fuel entries for this vehicle.' : 'Loading...'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col">
          <SheetHeader className="pr-12">
            <SheetTitle>Fuel Entry Details</SheetTitle>
            {isClient && selectedEntry && (
              <SheetDescription>
                {vehicle.plate} on {format(new Date(selectedEntry.ts), 'PPp')}
              </SheetDescription>
            )}
          </SheetHeader>
          {isClient && selectedEntry && (
            <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Fuel</span>
                        <span className="text-2xl font-bold text-primary">{selectedEntry.fuel_l.toFixed(2)} L</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm">{selectedEntry.station}</p>
                    </div>
                </div>

                {selectedEntry.flags.length > 0 && (
                  <Card className="border-destructive bg-destructive/5">
                    <CardHeader className="flex-row gap-4 items-center !pb-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        <h3 className="text-lg font-semibold text-destructive">Flags Detected</h3>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 list-disc list-inside text-destructive">
                          {selectedEntry.flags.map((flag, index) => (
                              <li key={index} className="capitalize">{flag}</li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Truck size={20} /> Vehicle &amp; Driver</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Vehicle:</strong> {vehicle.plate} ({vehicle.type})</p>
                    <p><strong>Fleet:</strong> {vehicle.fleet}</p>
                    {selectedDriver && <div className="flex items-center gap-2">
                        <p><strong>Driver:</strong></p>
                        <Avatar className="h-6 w-6">
                            {driverAvatar && <AvatarImage src={driverAvatar.imageUrl} alt={selectedDriver.name} />}
                            <AvatarFallback>{selectedDriver.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{selectedDriver.name}</span>
                    </div>}
                  </div>
                  <Separator />

                  <h3 className="font-semibold text-lg flex items-center gap-2"><Gauge size={20} /> Odometer</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Odometer Reading:</strong> {selectedEntry.odo_km.toLocaleString()} km</p>
                    <p><strong>Distance Since Last Fill:</strong> {selectedEntry.odo_delta_km.toLocaleString()} km</p>
                  </div>
                  <Separator />
                  
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Fuel size={20} /> Pump Meter</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {pumpBeforeImg && <div><p className="text-sm font-medium mb-2">Before</p><Image data-ai-hint="gas pump" src={pumpBeforeImg.imageUrl} alt="Pump before" width={300} height={400} className="rounded-md" /></div>}
                    {pumpAfterImg && <div><p className="text-sm font-medium mb-2">After</p><Image data-ai-hint="gas pump" src={pumpAfterImg.imageUrl} alt="Pump after" width={300} height={400} className="rounded-md" /></div>}
                  </div>
                  <Separator />

                  <h3 className="font-semibold text-lg flex items-center gap-2"><Paperclip size={20} /> Attachments</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {receiptImg && <a href={receiptImg.imageUrl} target="_blank"><Image data-ai-hint="receipt" src={receiptImg.imageUrl} alt="Receipt" width={200} height={300} className="rounded-md" /></a>}
                  </div>
                  <Separator />

                  <h3 className="font-semibold text-lg flex items-center gap-2"><StickyNote size={20} /> Notes</h3>
                  <p className="text-sm text-muted-foreground italic">No notes for this entry.</p>
                </div>
            </div>
            <SheetFooter className="bg-background pt-4 -mx-6 px-6 pb-6 border-t sticky bottom-0">
                {selectedEntry.status === 'Submitted' && (
                    <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="flex-1 sm:flex-initial">
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </Button>
                      </AlertDialogTrigger>
                       <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Approve Fuel Entry?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will mark the fuel entry as approved. You can add an optional note.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Textarea placeholder="Optional note..."/>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleStatusChange(selectedEntry!.id, 'Approved')}>Approve</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="flex-1 sm:flex-initial">
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reject Fuel Entry?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will mark the fuel entry as rejected. Please provide a reason.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Textarea placeholder="Reason for rejection..."/>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleStatusChange(selectedEntry!.id, 'Rejected')}>Reject</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    </>
                )}
                <SheetClose asChild>
                    <Button variant="secondary" className="flex-1 sm:flex-initial sm:ml-auto">Close</Button>
                </SheetClose>
            </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

    