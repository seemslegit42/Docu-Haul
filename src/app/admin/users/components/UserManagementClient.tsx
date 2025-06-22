"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ServerCog } from 'lucide-react';

// Mock user data. In a real app, this would be fetched from the backend.
const mockUsers = [
  { uid: '1', email: 'alice@example.com', lastSignIn: '2024-07-21T10:00:00Z', created: '2024-01-15T12:00:00Z', isPremium: true, isAdmin: true },
  { uid: '2', email: 'bob@example.com', lastSignIn: '2024-07-20T15:30:00Z', created: '2024-02-20T09:00:00Z', isPremium: false, isAdmin: false },
  { uid: '3', email: 'charlie@example.com', lastSignIn: '2024-07-21T08:45:00Z', created: '2024-03-10T18:00:00Z', isPremium: true, isAdmin: false },
  { uid: '4', email: 'diana@example.com', lastSignIn: '2024-06-30T11:00:00Z', created: '2024-04-05T21:00:00Z', isPremium: false, isAdmin: false },
];

export default function UserManagementClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, you would call a secure server action/API route here.
    // e.g., listAllUsers().then(...).catch(...)
    // For this demonstration, we'll use mock data and simulate a delay.
    const fetchUsers = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This is a placeholder. A real implementation would require a backend function.
        setUsers(mockUsers);

      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
     return (
        <Alert variant="destructive">
            <ServerCog className="h-4 w-4" />
            <AlertTitle>Backend Action Required</AlertTitle>
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
                <TableCell>{new Date(user.created).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(user.lastSignIn).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <button><MoreHorizontal className="h-4 w-4" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
