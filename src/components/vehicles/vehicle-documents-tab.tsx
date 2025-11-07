
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
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UploadCloud, Eye, Replace, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Vehicle } from '@/lib/types';
import { format, addYears, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface VehicleDocumentsTabProps {
  vehicle: Vehicle;
}

const mockDocuments = [
    { id: 'doc1', filename: 'Registration.pdf', type: 'Registration', uploadDate: '2025-01-10', expiryDate: '2026-01-15' },
    { id: 'doc2', filename: 'Insurance.pdf', type: 'Insurance', uploadDate: '2025-01-10', expiryDate: '2026-01-15' },
    { id: 'doc3', filename: 'InspectionReport_2025-09.pdf', type: 'Inspection', uploadDate: '2025-09-20', expiryDate: null },
];

const getExpiryBadgeVariant = (expiryDate: string | null) => {
    if (!expiryDate) return 'secondary';
    const today = new Date();
    const date = new Date(expiryDate);
    const daysUntil = differenceInDays(date, today);

    if (daysUntil < 0) return 'destructive';
    if (daysUntil <= 30) return 'warning';
    return 'secondary';
};

export function VehicleDocumentsTab({ vehicle }: VehicleDocumentsTabProps) {
  const { toast } = useToast();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handlePlaceholderClick = (action: string) => {
    toast({
        title: 'Action Not Implemented',
        description: `The "${action}" functionality is a placeholder.`,
    });
  };

  return (
    <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <CardTitle>Vehicle Documents</CardTitle>
                <CardDescription>
                    Registration, insurance, and other documents for {vehicle.plate}.
                </CardDescription>
            </div>
            <Button onClick={() => handlePlaceholderClick('Upload Document')}>
                <UploadCloud className="mr-2" />
                Upload Document
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Uploaded On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isClient && mockDocuments.length > 0 ? (
                        mockDocuments.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium">{doc.filename}</TableCell>
                                <TableCell>{doc.type}</TableCell>
                                <TableCell>
                                    {doc.expiryDate ? (
                                        <Badge variant={getExpiryBadgeVariant(doc.expiryDate)}>
                                            Expires {format(new Date(doc.expiryDate), 'PP')}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">N/A</span>
                                    )}
                                </TableCell>
                                <TableCell>{format(new Date(doc.uploadDate), 'PP')}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => handlePlaceholderClick('Preview')}>
                                                <Eye className="mr-2 h-4 w-4" /> Preview
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handlePlaceholderClick('Replace')}>
                                                <Replace className="mr-2 h-4 w-4" /> Replace
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => handlePlaceholderClick('Remove')}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                {isClient ? 'No documents uploaded for this vehicle.' : 'Loading...'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
