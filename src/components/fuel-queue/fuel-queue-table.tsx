
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, CheckCircle, XCircle, AlertTriangle, User, Truck, Gauge, Fuel, Paperclip, StickyNote, FileImage } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type Vehicle, type Driver, type FuelEntry } from '@/lib/types';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Skeleton } from '../ui/skeleton';

interface FuelQueueTableProps {
  fuelEntries: FuelEntry[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onFilteredEntriesChange?: (entries: FuelEntry[]) => void;
  initialSelectedEntryId?: string | null;
}

type TabValue = 'all' | 'submitted' | 'flagged' | 'approved' | 'rejected';

const statusVariant = {
  Submitted: 'warning',
  Approved: 'success',
  Rejected: 'destructive',
} as const;

const flagTooltips: { [key: string]: string } = {
  'low ocr': 'OCR confidence under threshold on latest odometer photo.',
  'fuel over max': 'Dispensed liters exceed the configured tank capacity.',
  'odo delta high': 'Unusual distance since last fill (> configured threshold).',
};

function TableSkeleton() {
  return (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  )
}

export function FuelQueueTable({
  fuelEntries: initialFuelEntries,
  vehicles,
  drivers,
  onFilteredEntriesChange,
  initialSelectedEntryId,
}: FuelQueueTableProps) {
  const [activeTab, setActiveTab] = React.useState<TabValue>('all');
  const [selectedEntry, setSelectedEntry] = React.useState<FuelEntry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const [fuelEntries, setFuelEntries] = React.useState(initialFuelEntries);
  const { toast } = useToast();

  React.useEffect(() => {
    setIsClient(true);
    if (initialSelectedEntryId) {
      const entry = initialFuelEntries.find(e => e.id === initialSelectedEntryId);
      if (entry) {
        setSelectedEntry(entry);
        setIsSheetOpen(true);
      }
    }
  }, [initialSelectedEntryId, initialFuelEntries]);
  
  const handleStatusChange = (entryId: string, newStatus: 'Approved' | 'Rejected') => {
    setFuelEntries(prevEntries => 
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

  const getVehicle = (vehicleId: string) => vehicles.find((v) => v.id === vehicleId);
  const getDriver = (driverId: string) => drivers.find((d) => d.id === driverId);

  const handleViewClick = (entry: FuelEntry) => {
    setSelectedEntry(entry);
    setIsSheetOpen(true);
  };

  const filteredEntries = React.useMemo(() => {
    if (!isClient) return [];
    if (activeTab === 'all') return fuelEntries;
    if (activeTab === 'flagged') return fuelEntries.filter(e => e.flags.length > 0 && e.status === 'Submitted');
    return fuelEntries.filter(
      (entry) => entry.status.toLowerCase() === activeTab
    );
  }, [activeTab, fuelEntries, isClient]);

  React.useEffect(() => {
    if (onFilteredEntriesChange) {
      onFilteredEntriesChange(filteredEntries);
    }
  }, [filteredEntries, onFilteredEntriesChange]);

  const flagIcons: { [key: string]: React.ElementType } = {
    'odo delta high': AlertTriangle,
    'fuel over max': AlertTriangle,
    'low ocr': AlertTriangle,
  };

  const selectedVehicle = selectedEntry ? getVehicle(selectedEntry.vehicle_id) : null;
  const selectedDriver = selectedEntry ? getDriver(selectedEntry.driver_id) : null;
  const driverAvatar = selectedDriver ? PlaceHolderImages.find(img => img.id === selectedDriver.avatar) : null;
  const pumpBeforeImg = PlaceHolderImages.find(p => p.id === 'pump-before');
  const pumpAfterImg = PlaceHolderImages.find(p => p.id === 'pump-after');
  const receiptImg = PlaceHolderImages.find(p => p.id === 'receipt');

  return (
    <>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList>
          <TabsTrigger value="all">All ({fuelEntries.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({fuelEntries.filter(e => e.status === 'Submitted').length})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({fuelEntries.filter(e => e.flags.length > 0 && e.status === 'Submitted').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({fuelEntries.filter(e => e.status === 'Approved').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({fuelEntries.filter(e => e.status === 'Rejected').length})</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Fuel (L)</TableHead>
                    <TableHead>Odo (km)</TableHead>
                    <TableHead>Δ km</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!isClient ? <TableSkeleton /> : (
                    filteredEntries.length > 0 ? filteredEntries.map((entry) => {
                      const vehicle = getVehicle(entry.vehicle_id);
                      const driver = getDriver(entry.driver_id);
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>{format(new Date(entry.ts), 'PPpp')}</TableCell>
                          <TableCell>{vehicle?.plate || entry.vehicle_id}</TableCell>
                          <TableCell>{driver?.name || entry.driver_id}</TableCell>
                          <TableCell>{entry.station}</TableCell>
                          <TableCell>{entry.fuel_l.toFixed(2)}</TableCell>
                          <TableCell>{entry.odo_km.toLocaleString()}</TableCell>
                          <TableCell>{entry.odo_delta_km.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {entry.flags.map((flag, i) => {
                                const Icon = flagIcons[flag] || AlertTriangle;
                                return (
                                  <Tooltip key={i}>
                                    <TooltipTrigger>
                                      <Icon className="h-4 w-4 text-destructive" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{flagTooltips[flag]}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant[entry.status]}>{entry.status}</Badge>
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
                                <DropdownMenuItem onSelect={() => handleViewClick(entry)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={entry.status !== 'Submitted'}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve
                                    </DropdownMenuItem>
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
                                          <AlertDialogAction onClick={() => handleStatusChange(entry.id, 'Approved')}>Approve</AlertDialogAction>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={(e) => e.preventDefault()} disabled={entry.status !== 'Submitted'}>
                                          <XCircle className="mr-2 h-4 w-4" />
                                          Reject
                                      </DropdownMenuItem>
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
                                          <AlertDialogAction onClick={() => handleStatusChange(entry.id, 'Rejected')}>Reject</AlertDialogAction>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                              No fuel entries in this category.
                          </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col">
          <SheetHeader className="pr-12">
            <SheetTitle>Fuel Entry Details</SheetTitle>
            {isClient && selectedEntry && (
              <SheetDescription>
                {selectedVehicle?.plate} on {format(new Date(selectedEntry.ts), 'PPp')}
              </SheetDescription>
            )}
          </SheetHeader>
          {isClient && selectedEntry && (
            <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-6">
                {/* Summary Section */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Fuel</span>
                        <span className="text-2xl font-bold text-primary">{selectedEntry.fuel_l.toFixed(2)} L</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm">{selectedEntry.station}</span>
                    </div>
                </div>

                {/* Flags */}
                {selectedEntry.flags.length > 0 && (
                  <Card className="border-destructive bg-destructive/5">
                    <CardHeader className="flex-row gap-4 items-center !pb-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        <h3 className="text-lg font-semibold text-destructive">Flags Detected</h3>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 list-disc list-inside text-destructive text-sm">
                          {selectedEntry.flags.map((flag, index) => (
                              <li key={index}><strong className="capitalize">{flag}:</strong> {flagTooltips[flag]}</li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Details Grid */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Truck size={20} /> Vehicle &amp; Driver</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Vehicle:</strong> {selectedVehicle?.plate} ({selectedVehicle?.type})</p>
                    <p><strong>Fleet:</strong> {selectedVehicle?.fleet}</p>
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

    