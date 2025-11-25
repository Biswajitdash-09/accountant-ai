import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Download, Mail, Search, Users, TrendingUp, Clock, Rocket } from "lucide-react";
import { format } from "date-fns";

export default function WaitlistManagement() {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    notified: 0,
    converted: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchWaitlist();
    fetchStats();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role_type')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const isAdmin = roles?.some(r => r.role_type === 'admin');
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  };

  const fetchWaitlist = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      setWaitlist(data || []);
    } catch (error: any) {
      console.error('Error fetching waitlist:', error);
      toast({
        title: "Error",
        description: "Failed to load waitlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: total } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      const { count: pending } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: notified } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'notified');

      const { count: converted } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'converted');

      setStats({
        total: total || 0,
        pending: pending || 0,
        notified: notified || 0,
        converted: converted || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleNotifyAll = async () => {
    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('notify-waitlist', {
        body: { batchSize: 100 },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Sent ${data.successCount} launch notification emails`,
      });

      fetchWaitlist();
      fetchStats();
    } catch (error: any) {
      console.error('Error sending notifications:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notifications",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Position', 'Email', 'Full Name', 'Company', 'Status', 'Joined Date', 'Notified Date'];
    const rows = waitlist.map(entry => [
      entry.position,
      entry.email,
      entry.full_name || '',
      entry.company_name || '',
      entry.status,
      format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm'),
      entry.notified_at ? format(new Date(entry.notified_at), 'yyyy-MM-dd HH:mm') : '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredWaitlist = waitlist.filter(entry =>
    entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Waitlist Management</h1>
          <p className="text-muted-foreground">Manage and notify your waitlist members</p>
        </div>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notified</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.converted}</div>
            <p className="text-xs text-muted-foreground">
              {stats.notified > 0 ? `${Math.round((stats.converted / stats.notified) * 100)}% conversion` : '0% conversion'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage your waitlist</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={isSending || stats.pending === 0} className="gap-2">
                <Rocket className="h-4 w-4" />
                {isSending ? 'Sending...' : `Notify All (${stats.pending})`}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Send Launch Notifications?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will send launch notification emails to all {stats.pending} pending waitlist members.
                  They will receive their unique early access code and benefits.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleNotifyAll}>
                  Send Notifications
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </CardContent>
      </Card>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Waitlist Entries</CardTitle>
              <CardDescription>{filteredWaitlist.length} entries</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">#</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Notified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWaitlist.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">#{entry.position}</TableCell>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>{entry.full_name || '-'}</TableCell>
                    <TableCell>{entry.company_name || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.status === 'converted' ? 'default' :
                          entry.status === 'notified' ? 'secondary' :
                          'outline'
                        }
                      >
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(entry.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-xs">
                      {entry.notified_at ? format(new Date(entry.notified_at), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}