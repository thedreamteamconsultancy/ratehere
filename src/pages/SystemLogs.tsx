import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Search, Shield, Users, Star, MessageSquare, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { fetchSystemLogs, SystemLog } from '@/lib/systemLogs';

export default function SystemLogs() {
  const navigate = useNavigate();
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin');
      return;
    }

    if (currentUser && isAdmin) {
      loadLogs();
    }
  }, [currentUser, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = logs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(logs);
    }
  }, [searchTerm, logs]);

  const loadLogs = async () => {
    try {
      const logsData = await fetchSystemLogs(200); // Fetch last 200 logs
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error('Failed to load system logs');
    } finally {
      setLoading(false);
    }
  };

  const getTargetIcon = (targetType: SystemLog['targetType']) => {
    switch (targetType) {
      case 'profile':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'user':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'rating':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'review':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'system':
        return <Activity className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('Verified')) return <Badge className="bg-green-500">Verified</Badge>;
    if (action.includes('Unverified')) return <Badge variant="secondary">Unverified</Badge>;
    if (action.includes('Deleted')) return <Badge variant="destructive">Deleted</Badge>;
    if (action.includes('Banned')) return <Badge variant="destructive">Banned</Badge>;
    if (action.includes('Unbanned')) return <Badge className="bg-green-500">Unbanned</Badge>;
    if (action.includes('Deactivated')) return <Badge variant="secondary">Deactivated</Badge>;
    if (action.includes('Activated')) return <Badge className="bg-green-500">Activated</Badge>;
    if (action.includes('Flagged')) return <Badge variant="destructive">Flagged</Badge>;
    return <Badge variant="outline">{action}</Badge>;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading system logs...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">System Logs</h1>
          <p className="text-muted-foreground mt-2">
            Track all admin actions and system events
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Profile Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {logs.filter(l => l.targetType === 'profile').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">User Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {logs.filter(l => l.targetType === 'user').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rating Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {logs.filter(l => l.targetType === 'rating').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Complete record of all admin actions</CardDescription>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {logs.length === 0 
                          ? 'No logs found. Admin actions will be recorded here.'
                          : 'No logs match your search.'
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTargetIcon(log.targetType)}
                            <span className="capitalize text-sm">{log.targetType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getActionBadge(log.action)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={log.targetName || 'N/A'}>
                            {log.targetName || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate" title={log.adminEmail}>
                            {log.adminEmail}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-sm text-muted-foreground" title={log.details || 'N/A'}>
                            {log.details || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredLogs.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredLogs.length} of {logs.length} total logs
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
