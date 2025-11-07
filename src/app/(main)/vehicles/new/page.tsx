import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewVehiclePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add New Vehicle"
        description="Fill in the details to add a new vehicle to your fleet."
      />
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The form to add a new vehicle will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
