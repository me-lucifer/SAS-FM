
'use client';

import { useParams, useRouter } from 'next/navigation';
import { getDriverById, getVehicleById, fuelEntries } from '@/lib/data';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronLeft, Home, User, Phone, Truck, PlusCircle, Eye, AlertTriangle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, isAfter, parseISO } from 'date-fns';
import { FuelEntry } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { FuelQueueTable } from '@/components/fuel-queue/fuel-queue-table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
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
import { Textarea } from '@/components/ui/textarea';
import { Gauge, Fuel, ShoppingCart, StickyNote, Paperclip, CheckCircle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


const driverStatusVariant = {
  Active: 'success',
  Inactive: 'secondary',
} as const;

const fuelStatusVariant = {
    Submitted: 'warning',
    Approved: 'success',
    Rejected: 'destructive',
} as const;

const flagIcons: { [key: string]: React.ElementType } = {
    'odo delta high': AlertTriangle,
    'fuel over max': AlertTriangle,
    'low ocr': AlertTriangle,
};

const ocrBadgeVariant = (confidence: number) => {
    if (confidence > 95) return 'success';
    if (confidence > 85) return 'warning';
    return 'destructive';
};

const flagTooltips: { [key: string]: string } = {
    'low ocr': 'OCR confidence under threshold on latest odometer photo.',
    'fuel over max': 'Dispensed liters exceed the configured tank capacity.',
    'odo delta high': 'Unusual distance since last fill (> configured threshold).',
};

export default function DriverDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [isClient, setIsClient] = useState(false);
  const [selectedFuelEntry, setSelectedFuelEntry] = useState<FuelEntry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const driver = getDriverById(id);
  const assignedVehicle = useMemo(() => driver ? getVehicleById(driver.id) : undefined, [driver]);
  const driverAvatar = useMemo(() => driver ? PlaceHolderImages.find(img => img.id === driver.avatar) : undefined, [driver]);
  
  const driverFuelEntries = useMemo(() => {
    if (!driver) return [];
    return fuelEntries
      .filter(entry => entry.driver_id === driver.id)
      .sort((a, b) => isAfter(parseISO(b.ts), parseISO(a.ts)) ? 1 : -1);
  }, [driver]);

  const recentFuelSubmissions = driverFuelEntries.slice(0, 5);
  const recentOdometerSubmissions = driverFuelEntries.slice(0, 5);

  const handleViewFuelClick = (entry: FuelEntry) => {
    setSelectedFuelEntry(entry);
    setIsSheetOpen(true);
  };
  
  const selectedVehicleForSheet = selectedFuelEntry ? getVehicleById(selectedFuelEntry.vehicle_id) : null;
  const pumpBeforeImg = PlaceHolderImages.find(p => p.id === 'pump-before');
  const pumpAfterImg = PlaceHolderImages.find(p => p.id === 'pump-after');
  const receiptImg = PlaceHolderImages.find(p => p.id === 'receipt');

  if (!isClient) {
      return null;
  }
  
  if (!driver) {
    return <div>Driver not found</div>;
  }

  return (
    <>
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/drivers">
            <ChevronLeft />
            <span className="sr-only">Back to Drivers</span>
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
                <Link href="/drivers">Drivers</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{driver.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <PageHeader
        title={
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {driverAvatar && <AvatarImage src={driverAvatar.imageUrl} alt={driver.name} />}
              <AvatarFallback className="text-2xl">{driver.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">{driver.name}</h2>
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5"><User size={14}/> ID: {driver.id}</span>
                    <span className="flex items-center gap-1.5"><Phone size={14}/> {driver.contact}</span>
                </div>
            </div>
          </div>
        }
        description=""
      >
        <div className="flex items-center gap-2">
            <div className="text-right">
                <p className="font-semibold text-sm">Fleet</p>
                <p className="text-muted-foreground">{assignedVehicle?.fleet || 'N/A'}</p>
            </div>
            <Badge variant={driverStatusVariant[driver.status]}>{driver.status}</Badge>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
            {assignedVehicle && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Truck size={20} /> Assigned Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/vehicles/${assignedVehicle.id}`} className="block p-4 rounded-lg bg-muted/50 hover:bg-muted">
                    <p className="text-lg font-bold">{assignedVehicle.plate}</p>
                    <p className="text-sm text-muted-foreground">{assignedVehicle.type}</p>
                    <p className="text-sm text-muted-foreground mt-2">Odometer: {assignedVehicle.odo_km.toLocaleString()} km</p>
                  </Link>
                </CardContent>
              </Card>
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Notes</CardTitle>
                    <CardDescription>Timeline of notes and events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Mock timeline coming soon.</p>
                    <Button variant="outline" size="sm" className="mt-4"><PlusCircle className="mr-2"/>Add Note</Button>
                </CardContent>
            </Card>
        </div>

        {/* Center/Right Column */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Fuel Submissions</CardTitle>
                    <CardDescription>Last 5 fuel entries submitted by {driver.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Station</TableHead>
                                <TableHead>Liters</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Flags</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentFuelSubmissions.length > 0 ? recentFuelSubmissions.map(entry => (
                                <TableRow key={entry.id}>
                                    <TableCell>{format(parseISO(entry.ts), 'PP')}</TableCell>
                                    <TableCell>{entry.station}</TableCell>
                                    <TableCell>{entry.fuel_l.toFixed(2)}</TableCell>
                                    <TableCell><Badge variant={fuelStatusVariant[entry.status]}>{entry.status}</Badge></TableCell>
                                    <TableCell className="flex gap-1">
                                        {entry.flags.map((flag, i) => {
                                            const Icon = flagIcons[flag] || AlertTriangle;
                                            return (
                                                <Tooltip key={i}>
                                                    <TooltipTrigger>
                                                        <Icon className="h-4 w-4 text-destructive" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{flagTooltips[flag as keyof typeof flagTooltips]}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            );
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleViewFuelClick(entry)}>
                                            <Eye className="mr-2 h-4 w-4" />View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">No recent fuel submissions.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Odometer Submissions</CardTitle>
                    <CardDescription>Last 5 odometer readings from {driver.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Reading (km)</TableHead>
                                <TableHead>OCR %</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOdometerSubmissions.length > 0 ? recentOdometerSubmissions.map(entry => (
                                <TableRow key={entry.id}>
                                    <TableCell>{format(parseISO(entry.ts), 'PP')}</TableCell>
                                    <TableCell>{entry.odo_km.toLocaleString()}</TableCell>
                                    <TableCell><Badge variant={ocrBadgeVariant(entry.ocr_confidence)}>{entry.ocr_confidence.toFixed(0)}%</Badge></TableCell>
                                    <TableCell><Badge variant={fuelStatusVariant[entry.status]}>{entry.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleViewFuelClick(entry)}>
                                            <Eye className="mr-2 h-4 w-4" />View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No recent odometer submissions.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col">
          <SheetHeader className="pr-12">
            <SheetTitle>Fuel Entry Details</SheetTitle>
            {selectedFuelEntry && (
              <SheetDescription>
                {selectedVehicleForSheet?.plate} on {format(new Date(selectedFuelEntry.ts), 'PPp')}
              </SheetDescription>
            )}
          </SheetHeader>
          {selectedFuelEntry && (
            <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Fuel</span>
                        <span className="text-2xl font-bold text-primary">{selectedFuelEntry.fuel_l.toFixed(2)} L</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm">{selectedFuelEntry.station}</p>
                    </div>
                </div>

                {selectedFuelEntry.flags.length > 0 && (
                  <Card className="border-destructive bg-destructive/5">
                    <CardHeader className="flex-row gap-4 items-center !pb-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        <h3 className="text-lg font-semibold text-destructive">Flags Detected</h3>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 list-disc list-inside text-destructive text-sm">
                          {selectedFuelEntry.flags.map((flag, index) => (
                              <li key={index}><strong className="capitalize">{flag}:</strong> {flagTooltips[flag as keyof typeof flagTooltips]}</li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Truck size={20} /> Vehicle &amp; Driver</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Vehicle:</strong> {selectedVehicleForSheet?.plate} ({selectedVehicleForSheet?.type})</p>
                    <p><strong>Fleet:</strong> {selectedVehicleForSheet?.fleet}</p>
                    <div className="flex items-center gap-2">
                        <p><strong>Driver:</strong></p>
                        <Avatar className="h-6 w-6">
                            {driverAvatar && <AvatarImage src={driverAvatar.imageUrl} alt={driver.name} />}
                            <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{driver.name}</span>
                    </div>
                  </div>
                  <Separator />

                  <h3 className="font-semibold text-lg flex items-center gap-2"><Gauge size={20} /> Odometer</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Odometer Reading:</strong> {selectedFuelEntry.odo_km.toLocaleString()} km</p>
                    <p><strong>Distance Since Last Fill:</strong> {selectedFuelEntry.odo_delta_km.toLocaleString()} km</p>
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
                            <AlertDialogAction>Approve</AlertDialogAction>
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
                            <AlertDialogAction>Reject</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
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

    