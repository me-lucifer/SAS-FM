
export type Fleet = {
  id: string;
  name: string;
};

export type Station = {
  id: string;
  name: string;
};

export type VehicleStatus = 'Active' | 'Maintenance' | 'Down';
export type DriverStatus = 'Active' | 'Inactive';

export type Vehicle = {
  id: string;
  plate: string;
  type: string; // Van, Truck, Crane, etc.
  fleet: string; // North Fleet, South Fleet
  status: VehicleStatus;
  driver_id?: string;
  fuel_level_percent: number;
  odo_km: number;
};

export type Driver = {
  id: string;
  name: string;
  contact: string;
  licenseNumber: string;
  avatar?: string;
  status: DriverStatus;
};

export type FuelEntry = {
  id: string;
  ts: string; // ISO timestamp
  fleet: string;
  vehicle_id: string;
  driver_id: string;
  station: string;
  fuel_l: number;
  odo_km: number;
  odo_delta_km: number;
  flags: ('odo delta high' | 'fuel over max' | 'low ocr')[];
  status: 'Submitted' | 'Approved' | 'Rejected';
  ocr_confidence: number;
  price_per_l?: number;
  total_cost?: number;
};

export type MaintenanceTicket = {
  id: string;
  vehicle_id: string;
  type: 'Service' | 'Repair' | 'Inspection';
  priority: 'Low' | 'Medium' | 'High';
  due_date: string; // YYYY-MM-DD
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Deferred';
  vendor: string;
  est_cost: number;
  notes: string;
  actual_cost?: number;
};

// Deprecated types - will be removed later
export type Maintenance = {
  id: string;
  vehicleId: string;
  serviceType: string;
  date: string;
  cost: number;
  notes: string;
};

    