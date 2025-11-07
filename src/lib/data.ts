
import {
  type Driver,
  type Vehicle,
  type MaintenanceTicket,
  type FuelEntry,
  type Fleet,
  type Station,
} from './types';
import { subDays, addDays, format, parseISO } from 'date-fns';

export const fleets: Fleet[] = [
  { id: 'F001', name: 'North Fleet' },
  { id: 'F002', name: 'South Fleet' },
];

export const stations: Station[] = [
  { id: 'S001', name: 'ENOC' },
  { id: 'S002', name: 'Adnoc' },
  { id: 'S003', name: 'Shell' },
];

export const drivers: Driver[] = [
  { id: 'D001', name: 'John Doe', contact: '555-0101', licenseNumber: 'B64S-987P-342L', avatar: 'driver1', status: 'Active' },
  { id: 'D002', name: 'Jane Smith', contact: '555-0102', licenseNumber: 'C75T-898Q-453M', avatar: 'driver2', status: 'Active' },
  { id: 'D003', name: 'Mike Johnson', contact: '555-0103', licenseNumber: 'D86U-765R-564N', avatar: 'driver3', status: 'Active' },
  { id: 'D004', name: 'Emily Davis', contact: '555-0104', licenseNumber: 'E97V-654S-675O', avatar: 'driver4', status: 'Active' },
  { id: 'D005', name: 'Chris Brown', contact: '555-0105', licenseNumber: 'F08W-543T-786P', avatar: 'driver5', status: 'Inactive' },
];

export const vehicles: Vehicle[] = [
    { id: 'V001', plate: 'A12345', type: 'Van', fleet: 'North Fleet', status: 'Active', driver_id: 'D001', fuel_level_percent: 85, odo_km: 25678 },
    { id: 'V010', plate: 'B67890', type: 'Truck', fleet: 'North Fleet', status: 'Active', driver_id: 'D002', fuel_level_percent: 45, odo_km: 15234 },
    { id: 'V090', plate: 'C24680', type: 'Crane', fleet: 'South Fleet', status: 'Maintenance', driver_id: 'D003', fuel_level_percent: 95, odo_km: 45890 },
    { id: 'V020', plate: 'D13579', type: 'Van', fleet: 'South Fleet', status: 'Active', driver_id: 'D004', fuel_level_percent: 15, odo_km: 31050 },
    { id: 'V030', plate: 'E98765', type: 'Truck', fleet: 'North Fleet', status: 'Down', driver_id: 'D005', fuel_level_percent: 100, odo_km: 8950 },
];

export let maintenanceTickets: MaintenanceTicket[] = [
    { id: 'M001', vehicle_id: 'V090', type: 'Repair', priority: 'High', due_date: '2025-10-28', status: 'In Progress', vendor: 'City Garage', est_cost: 1200, notes: 'Engine overheating issue.' },
    { id: 'M002', vehicle_id: 'V001', type: 'Service', priority: 'Medium', due_date: '2025-11-02', status: 'Scheduled', vendor: 'Fleet Maintenance Inc.', est_cost: 350, notes: 'Routine 30k km service.' },
    { id: 'M003', vehicle_id: 'V030', type: 'Repair', priority: 'High', due_date: '2025-10-29', status: 'Scheduled', vendor: 'Heavy Duty Repairs', est_cost: 2500, notes: 'Transmission failure reported.' },
    { id: 'M004', vehicle_id: 'V020', type: 'Inspection', priority: 'Low', due_date: '2025-10-31', status: 'Scheduled', vendor: 'Quick Check', est_cost: 150, notes: 'Annual safety inspection.' },
    { id: 'M005', vehicle_id: 'V010', type: 'Service', priority: 'Medium', due_date: '2025-11-07', status: 'Scheduled', vendor: 'Fleet Maintenance Inc.', est_cost: 250, notes: 'Oil change and filter replacement.' },
    { id: 'M006', vehicle_id: 'V090', type: 'Repair', priority: 'Low', due_date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), status: 'Completed', vendor: 'Body Shop Experts', est_cost: 500, notes: 'Minor body damage repair.'},
    { id: 'M007', vehicle_id: 'V001', type: 'Repair', priority: 'Low', due_date: format(subDays(new Date(), 8), 'yyyy-MM-dd'), status: 'Completed', vendor: 'Windshield Repair Pro', est_cost: 100, notes: 'Fixed chip in windshield.' },
    { id: 'M008', vehicle_id: 'V010', type: 'Inspection', priority: 'Low', due_date: format(addDays(new Date(), 20), 'yyyy-MM-dd'), status: 'Scheduled', vendor: 'Crane Specialists', est_cost: 1000, notes: 'Hydraulic system certification.'},
    { id: 'M009', vehicle_id: 'V020', type: 'Repair', priority: 'Medium', due_date: format(addDays(new Date(), 4), 'yyyy-MM-dd'), status: 'Scheduled', vendor: 'Tire World', est_cost: 600, notes: 'Four new tires mounted and balanced.'},
    { id: 'M010', vehicle_id: 'V090', type: 'Repair', priority: 'Medium', due_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), status: 'Deferred', vendor: 'City Garage', est_cost: 300, notes: 'A/C compressor replacement deferred to next service.' },

];


let fuelEntries: FuelEntry[] = [];
const today = new Date();
let lastOdo: { [key: string]: number } = {};

vehicles.forEach(v => {
    lastOdo[v.id] = v.odo_km - Math.floor(Math.random() * 2000);
});

// Generate random entries for the last 10 days
for (let i = 9; i >= 0; i--) {
    const date = subDays(today, i);
    const entriesForDay = Math.floor(Math.random() * 3) + 2; 

    for (let j = 0; j < entriesForDay; j++) {
        const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
        const driver = vehicle.driver_id ? drivers.find(d => d.id === vehicle.driver_id) : drivers[Math.floor(Math.random() * drivers.length)];
        const station = stations[Math.floor(Math.random() * stations.length)];
        
        const fuel_l = Math.floor(Math.random() * 45) + 10; // 10 to 55 liters
        const odo_delta_km = Math.floor(Math.random() * 200) + 50; // 50 to 250 km
        const odo_km = lastOdo[vehicle.id] + odo_delta_km;
        lastOdo[vehicle.id] = odo_km;
        const price_per_l = 0.23 + Math.random() * 0.02;

        const flags: ('odo delta high' | 'fuel over max' | 'low ocr')[] = [];
        let ocr_confidence = Math.floor(Math.random() * 10) + 90; // 90 to 100
        
        if (Math.random() < 0.1) {
            flags.push('odo delta high');
        }
        if (Math.random() < 0.1) {
            flags.push('low ocr');
            ocr_confidence = Math.floor(Math.random() * 30) + 50; // 50 to 80
        }
        if (Math.random() < 0.05) {
            flags.push('fuel over max');
        }


        fuelEntries.push({
            id: `FE${date.getTime()}${j}`,
            ts: date.toISOString(),
            fleet: vehicle.fleet,
            vehicle_id: vehicle.id,
            driver_id: driver!.id,
            station: station.name,
            fuel_l,
            odo_km,
            odo_delta_km,
            flags,
            status: flags.length > 0 ? 'Submitted' : ['Approved', 'Submitted', 'Rejected'][Math.floor(Math.random() * 3)] as 'Submitted' | 'Approved' | 'Rejected',
            ocr_confidence,
            price_per_l: price_per_l,
            total_cost: fuel_l * price_per_l,
        });
    }
}

// Sort all entries by date descending
fuelEntries.sort((a, b) => parseISO(b.ts).getTime() - parseISO(a.ts).getTime());

export { fuelEntries };

export function getVehicleById(id: string) {
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) return vehicle;

    // A fallback for when a driver is assigned to a vehicle not in the main list
    const driver = drivers.find(d => d.id === id);
    if (driver) {
        return vehicles.find(v => v.driver_id === driver.id);
    }
    return undefined;
}

export function getDriverById(id: string) {
    return drivers.find(d => d.id === id);
}

export function getTicketById(id: string) {
    return maintenanceTickets.find(t => t.id === id);
}

// This is just a small sample for the anomaly detection feature
export const anomalyDetectionData = {
    "V001": { "fuel_consumption_l_100km": [8.5, 8.6, 8.4, 8.7, 14.2], "mileage_km": [120, 130, 125, 128, 110] },
    "V010": { "fuel_consumption_l_100km": [9.1, 9.0, 9.2, 9.3, 9.1], "mileage_km": [150, 145, 155, 160, 152] },
};

    

    

    