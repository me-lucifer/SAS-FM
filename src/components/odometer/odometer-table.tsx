
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import {
  MoreHorizontal,
  Eye,
  AlertTriangle,
  MapPin,
  CheckCircle,
  XCircle,
  StickyNote,
} from 'lucide-react';
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
} from '@/components/ui/sheet';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '../ui/skeleton';

interface OdometerTableProps {
  fuelEntries: FuelEntry[];
  vehicles: Vehicle[];
  drivers: Driver[];
}

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
        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  )
}

export function OdometerTable({
  fuelEntries: initialFuelEntries,
  vehicles,
  drivers,
}: OdometerTableProps) {
  const [isClient, setIsClient] = React.useState(false);
  const [fuelEntries, setFuelEntries] = React.useState(initialFuelEntries);
  const [selectedEntry, setSelectedEntry] = React.useState<FuelEntry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setIsClient(true);
    setFuelEntries(initialFuelEntries);
  }, [initialFuelEntries]);

  const getVehicle = (vehicleId: string) =>
    vehicles.find((v) => v.id === vehicleId);
  const getDriver = (driverId: string) =>
    drivers.find((d) => d.id === driverId);
    
  const handleViewClick = (entry: FuelEntry) => {
    setSelectedEntry(entry);
    setIsSheetOpen(true);
  };

  const handleStatusChange = (entryId: string, newStatus: 'Approved' | 'Rejected') => {
    setFuelEntries(prevEntries => 
        prevEntries.map(entry => 
            entry.id === entryId ? { ...entry, status: newStatus } : entry
        )
    );
    toast({
        title: `Submission ${newStatus}`,
        description: `The odometer submission has been marked as ${newStatus.toLowerCase()}.`,
    });
    setIsSheetOpen(false);
  };

  const getOcrBadgeVariant = (confidence: number) => {
    if (confidence > 95) return 'success';
    if (confidence > 85) return 'warning';
    return 'destructive';
  };

  const selectedVehicle = selectedEntry ? getVehicle(selectedEntry.vehicle_id) : null;
  const odoImage = PlaceHolderImages.find(p => p.id === 'pump-after');

  return (
    <>
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date/Time</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Odometer (km)</TableHead>
              <TableHead>Δ km</TableHead>
              <TableHead>OCR %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isClient ? <TableSkeleton /> : (
              fuelEntries.length > 0 ? fuelEntries.map((entry) => {
                const vehicle = getVehicle(entry.vehicle_id);
                const driver = getDriver(entry.driver_id);
                return (
                  <TableRow key={entry.id}>
                    <TableCell>{format(new Date(entry.ts), 'PPpp')}</TableCell>
                    <TableCell>{vehicle?.plate || entry.vehicle_id}</TableCell>
                    <TableCell>{driver?.name || entry.driver_id}</TableCell>
                    <TableCell>{entry.odo_km.toLocaleString()}</TableCell>
                    <TableCell>{entry.odo_delta_km.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getOcrBadgeVariant(entry.ocr_confidence)}>
                          {entry.ocr_confidence.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[entry.status]}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {entry.flags.map((flag, i) => (
                          <Tooltip key={i}>
                              <TooltipTrigger>
                                  <AlertTriangle className="h-4 w-4 text-destructive" />
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>{flagTooltips[flag]}</p>
                              </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No odometer entries found for the selected filters.
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
     <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col">
          <SheetHeader className="pr-12">
            <SheetTitle>Odometer Submission</SheetTitle>
            {isClient && selectedEntry && selectedVehicle && (
              <SheetDescription>
                For {selectedVehicle.plate} on {format(new Date(selectedEntry.ts), 'PPp')}
              </SheetDescription>
            )}
          </SheetHeader>
          {isClient && selectedEntry && (
            <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-6">
                
                {odoImage && 
                    <div className="relative">
                        <Image data-ai-hint="odometer dashboard" src={odoImage.imageUrl} alt="Odometer Reading" width={800} height={600} className="rounded-md" />
                        <div className="absolute top-4 right-4 flex items-center gap-4">
                            <Badge variant={getOcrBadgeVariant(selectedEntry.ocr_confidence)} className="text-lg py-1 px-3">
                                OCR: {selectedEntry.ocr_confidence.toFixed(0)}%
                            </Badge>
                            <div className="bg-background/80 backdrop-blur-sm p-2 px-4 rounded-md text-2xl font-bold font-mono tracking-widest border">
                                {selectedEntry.odo_km.toLocaleString()} km
                            </div>
                        </div>
                    </div>
                }

                {selectedEntry.flags.length > 0 && (
                  <Card className="border-destructive bg-destructive/5">
                    <CardHeader className="flex-row gap-4 items-center !pb-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        <h3 className="text-lg font-semibold text-destructive">Flags Detected</h3>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 list-disc list-inside text-destructive text-sm">
                          {selectedEntry.flags.map((flag, index) => (
                              <li key={index}><strong className="capitalize">{flag}:</strong> {flagTooltips[flag as keyof typeof flagTooltips]}</li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><MapPin size={20} /> Location</h3>
                  <p className="text-sm text-muted-foreground">{selectedEntry.station} (GPS: 23.5859° N, 58.3816° E)</p>
                  <Separator />

                  <h3 className="font-semibold text-lg flex items-center gap-2"><StickyNote size={20} /> Notes</h3>
                  <p className="text-sm text-muted-foreground italic">No notes for this submission.</p>
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
                                <AlertDialogTitle>Approve Submission?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will mark the odometer submission as approved. You can add an optional note.
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
                                <AlertDialogTitle>Reject Submission?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will mark the odometer submission as rejected. Please provide a reason.
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
