
'use client';

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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type Vehicle, type Driver, type FuelEntry } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { format, isAfter, parseISO } from 'date-fns';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

interface DriverTableProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  fuelEntries: FuelEntry[];
}

const statusVariant = {
  Active: 'success',
  Inactive: 'secondary',
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
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  )
}

export function DriverTable({ drivers, vehicles, fuelEntries }: DriverTableProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const driverData = useMemo(() => {
    if (!isClient) return [];
    return drivers.map(driver => {
      const assignedVehicle = vehicles.find(v => v.driver_id === driver.id);
      const driverFuelEntries = fuelEntries.filter(fe => fe.driver_id === driver.id);

      const lastSubmission = driverFuelEntries.sort((a, b) =>
        isAfter(parseISO(b.ts), parseISO(a.ts)) ? 1 : -1
      )[0];

      const flags = driverFuelEntries.flatMap(entry => entry.flags);
      const uniqueFlags = [...new Set(flags)];

      return {
        ...driver,
        assignedVehicle,
        lastSubmissionDate: lastSubmission ? parseISO(lastSubmission.ts) : null,
        flagCount: flags.length,
        uniqueFlags,
      };
    });
  }, [drivers, vehicles, fuelEntries, isClient]);

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Fleet</TableHead>
              <TableHead>Assigned Vehicle</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Last Submission</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isClient ? <TableSkeleton /> : (
              driverData.length > 0 ? driverData.map((driver) => {
                const driverAvatar = PlaceHolderImages.find(img => img.id === driver.avatar);
                return (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {driverAvatar && <AvatarImage src={driverAvatar.imageUrl} alt={driver.name} />}
                          <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {driver.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{driver.assignedVehicle?.fleet || 'N/A'}</TableCell>
                    <TableCell>{driver.assignedVehicle?.plate || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                    <TableCell>{driver.contact}</TableCell>
                    <TableCell>{driver.lastSubmissionDate ? format(driver.lastSubmissionDate, 'PP') : 'N/A'}</TableCell>
                    <TableCell>
                      {driver.flagCount > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="destructive" className="gap-1.5 pl-1.5">
                            <AlertTriangle className="h-3 w-3" />
                            {driver.flagCount}
                          </Badge>
                          <div className="flex gap-1">
                            {driver.uniqueFlags.map(flag => (
                              <Tooltip key={flag}>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{flagTooltips[flag]}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                      ) : (
                        '0'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[driver.status]}>{driver.status}</Badge>
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
                          <DropdownMenuItem asChild>
                            <Link href={`/drivers/${driver.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />View Details
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                  <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                          No drivers found.
                      </TableCell>
                  </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
