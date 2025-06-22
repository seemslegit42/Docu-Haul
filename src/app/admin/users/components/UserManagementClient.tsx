"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { listAllUsers, type AdminUser } from '@/ai/flows/admin-flows';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ServerCog } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function UserRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-5 w-5" /></TableCell>
    </TableRow>
  )
}

export default function UserManagementClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: adminUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!adminUser) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const authToken = await adminUser.getIdToken();
        const result = await listAllUsers({}, authToken);
        setUsers(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        toast({
          title: "Error Fetching Users",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [adminUser, toast]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Sign-in</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => <UserRowSkeleton key={i} />)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  if (error) {
     return (
        <Alert variant="destructive">
            <ServerCog className="h-4 w-4" />
            <AlertTitle>Could Not Load Users</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
     );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Sign-in</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {user.isPremium && <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">Premium</Badge>}
                    {user.isAdmin && <Badge variant="destructive">Admin</Badge>}
                    {!user.isPremium && !user.isAdmin && <Badge variant="secondary">Standard</Badge>}
                  </div>
                </TableCell>
                <TableCell>{new Date(user.creationTime).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(user.lastSignInTime).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  {/* Actions (e.g., edit roles, disable) would go in a dropdown here */}
                  <button title="More actions"><MoreHorizontal className="h-4 w-4" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
