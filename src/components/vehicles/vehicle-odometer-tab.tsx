
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
  type Vehicle,
  type FuelEntry,
} from '@/lib/types';
import { fuelEntries } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Eye,
  AlertTriangle,
  MapPin,
  CheckCircle,
  XCircle,
  Camera,
  StickyNote
} from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface VehicleOdometerTabProps {
  vehicle: Vehicle;
}

const statusVariant = {
  Submitted: 'warning',
  Approved: 'success',
  Rejected: 'destructive',
} as const;

const ocrBadgeVariant = (confidence: number) => {
    if (confidence > 95) return 'success';
    if (confidence > 85) return 'warning';
    return 'destructive';
};

export function VehicleOdometerTab({ vehicle }: VehicleOdometerTabProps) {
  const { toast } = useToast();
  const [isClient, setIsClient] = React.useState(false);
  const [vehicleOdometerEntries, setVehicleOdometerEntries] = React.useState<FuelEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = React.useState<FuelEntry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    const entries = fuelEntries
      .filter((e) => e.vehicle_id === vehicle.id)
      .sort((a, b) => (isAfter(parseISO(b.ts), parseISO(a.ts)) ? 1 : -1));
    setVehicleOdometerEntries(entries);
  }, [vehicle.id]);

  const handleViewClick = (entry: FuelEntry) => {
    setSelectedEntry(entry);
    setIsSheetOpen(true);
  };
  
  const handleStatusChange = (entryId: string, newStatus: 'Approved' | 'Rejected') => {
    setVehicleOdometerEntries(prevEntries => 
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

  const odoImage = PlaceHolderImages.find(p => p.id === 'pump-after');

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Odometer History</CardTitle>
        <CardDescription>
          All odometer submissions for vehicle {vehicle.plate}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reading (km)</TableHead>
              <TableHead>Δ km</TableHead>
              <TableHead>OCR %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isClient && vehicleOdometerEntries.length > 0 ? (
              vehicleOdometerEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(parseISO(entry.ts), 'PPpp')}</TableCell>
                  <TableCell>{entry.odo_km.toLocaleString()}</TableCell>
                  <TableCell>{entry.odo_delta_km.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={ocrBadgeVariant(entry.ocr_confidence)}>
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
                        <AlertTriangle key={i} className="h-4 w-4 text-destructive" title={flag} />
                      ))}
                    </div>
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
                <TableCell colSpan={7} className="h-24 text-center">
                  {isClient ? 'No odometer entries for this vehicle.' : 'Loading...'}
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
            <SheetTitle>Odometer Submission</SheetTitle>
            {isClient && selectedEntry && (
              <SheetDescription>
                For {vehicle.plate} on {format(new Date(selectedEntry.ts), 'PPp')}
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
                            <Badge variant={ocrBadgeVariant(selectedEntry.ocr_confidence)} className="text-lg py-1 px-3">
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
                      <ul className="space-y-1 list-disc list-inside text-destructive">
                          {selectedEntry.flags.map((flag, index) => (
                              <li key={index} className="capitalize">{flag}</li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><MapPin size={20} /> Location</h3>
                  <p className="text-sm text-muted-foreground">{selectedEntry.station}</p>
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
