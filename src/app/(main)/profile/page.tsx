
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Globe, LogOut } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Profile"
        description="Manage your account settings and preferences."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  {user?.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" />}
                  <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-bold">{user?.displayName || 'Fleet Manager'}</h3>
                  <p className="text-muted-foreground">{user?.email || 'fleet.manager@sas.com'}</p>
                </div>
                <Button variant="outline" size="sm" disabled>Change Avatar</Button>
              </div>

              <Separator />

              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue={user?.displayName || ''} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ''} readOnly />
                </div>
                <div className="space-y-1">
                    <Label>Fleet Scope</Label>
                    <p className="text-muted-foreground p-2 border rounded-md bg-muted">North Fleet, South Fleet</p>
                </div>
              </div>
              <Button className="w-full">Save Changes</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Manage your account and display settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <Select defaultValue="en">
                            <SelectTrigger id="language" className="w-[200px]">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="ar">العربية (Arabic)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label>Password</Label>
                    <CardDescription>For security, you may change your password at any time.</CardDescription>
                    <Button variant="outline" disabled>Change Password</Button>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Logout</CardTitle>
                <CardDescription>End your current session.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="destructive" className="w-full sm:w-auto" onClick={handleLogout}>
                    <LogOut className="mr-2"/>
                    Logout
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
