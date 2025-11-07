
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Vehicle } from '@/lib/types';
import { VehicleOverviewTab } from './vehicle-overview-tab';
import { VehicleFuelTab } from './vehicle-fuel-tab';
import { VehicleOdometerTab } from './vehicle-odometer-tab';
import { VehicleMaintenanceTab } from './vehicle-maintenance-tab';
import { VehicleDocumentsTab } from './vehicle-documents-tab';

interface VehicleDetailTabsProps {
    vehicle: Vehicle;
    onScheduleMaintenance: () => void;
}

export function VehicleDetailTabs({ vehicle, onScheduleMaintenance }: VehicleDetailTabsProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="fuel">Fuel</TabsTrigger>
        <TabsTrigger value="odometer">Odometer</TabsTrigger>
        <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <VehicleOverviewTab vehicle={vehicle} />
      </TabsContent>
      <TabsContent value="fuel">
        <VehicleFuelTab vehicle={vehicle} />
      </TabsContent>
      <TabsContent value="odometer">
        <VehicleOdometerTab vehicle={vehicle} />
      </TabsContent>
      <TabsContent value="maintenance">
        <VehicleMaintenanceTab vehicle={vehicle} onScheduleMaintenance={onScheduleMaintenance} />
      </TabsContent>
      <TabsContent value="documents">
        <VehicleDocumentsTab vehicle={vehicle} />
      </TabsContent>
    </Tabs>
  );
}
