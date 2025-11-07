import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import type { Vehicle, Driver, Fleet } from '@/lib/types';
import type { ReactNode } from 'react';

interface VehicleDetailHeaderProps {
  vehicle: Vehicle;
  driver?: Driver;
  fleet?: Fleet;
  children?: ReactNode;
}

const statusVariant = {
  Active: 'success',
  Maintenance: 'warning',
  Down: 'destructive',
} as const;

export function VehicleDetailHeader({ vehicle, driver, fleet, children }: VehicleDetailHeaderProps) {
  return (
    <PageHeader
      title={
        <div className="flex items-center gap-4">
          <span>{vehicle.plate}</span>
          <Badge variant={statusVariant[vehicle.status]}>{vehicle.status}</Badge>
        </div>
      }
      description={`VIN: ${vehicle.id} • ${vehicle.type}`}
    >
        {children}
    </PageHeader>
  );
}
