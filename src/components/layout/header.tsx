'use client';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getVehicleById } from '@/lib/data';
import { getTicketById } from '@/lib/data';
import { getDriverById } from '@/lib/data';

const getTitle = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean);

  if (parts.length === 0) return 'Dashboard';

  const [main, id, sub] = parts;

  switch (main) {
    case 'dashboard':
      return 'Dashboard';
    case 'vehicles':
      if (id && !sub) {
        const vehicle = getVehicleById(id);
        return vehicle ? vehicle.plate : 'Vehicle Details';
      }
      return 'Vehicles';
    case 'drivers':
        if (id && !sub) {
            const driver = getDriverById(id);
            return driver ? driver.name : 'Driver Details';
        }
        return 'Drivers';
    case 'fuel-queue':
      return 'Fuel Queue';
    case 'odometer':
      return 'Odometer';
    case 'maintenance':
      if (id && !sub) {
        const ticket = getTicketById(id);
        return ticket ? `Work Order #${ticket.id}` : 'Maintenance Details';
      }
      return 'Maintenance';
    case 'reports':
      return 'Reports';
    case 'profile':
      return 'Profile';
    default:
      return 'Dashboard';
  }
};


export function AppHeader() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex w-full items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold font-headline">{title}</h1>
      </div>
    </header>
  );
}
