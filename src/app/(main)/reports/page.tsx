import { redirect } from 'next/navigation';

export default function ReportsPage() {
  // Redirect to the first report by default
  redirect('/reports/daily-fuel-log');
}
