import { useState, useEffect, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Download, Mail, Search, Users, TrendingUp, Clock, Rocket, BarChart3, PieChart, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

// Survey labels for display
const userTypeLabels: Record<string, string> = {
  individual: 'Individual',
  small_business: 'Small Business',
  accountant: 'Finance Professional',
  startup: 'Startup Founder',
  other: 'Other',
};

const stressLevelLabels: Record<string, string> = {
  very_stressful: 'Very Stressful',
  stressful: 'Stressful',
  mildly_stressful: 'Mildly Stressful',
  not_stressful: 'Not Stressful',
};

const pricingLabels: Record<string, string> = {
  yes_30_50: '$30-$50/month',
  yes_under_30: 'Under $30/month',
  maybe: 'Maybe',
  no: 'No',
};

const painPointLabels: Record<string, string> = {
  paid_fines: 'Paid Fines',
  overpaid_taxes: 'Overpaid Taxes',
  missed_deadlines: 'Missed Deadlines',
  unexpected_charges: 'Unexpected Charges',
  hired_expensive: 'Hired Expensive Professionals',
  none: 'None',
};

interface SurveyAnalytics {
  userTypes: Record<string, number>;
  stressLevels: Record<string, number>;
  pricingPreferences: Record<string, number>;
  painPoints: Record<string, number>;
  surveyCompletionRate: number;
  totalWithSurvey: number;
}

export default function WaitlistManagement() {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
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

  // Calculate survey analytics
  const surveyAnalytics = useMemo<SurveyAnalytics>(() => {
    const analytics: SurveyAnalytics = {
      userTypes: {},
      stressLevels: {},
      pricingPreferences: {},
      painPoints: {},
      surveyCompletionRate: 0,
      totalWithSurvey: 0,
    };

    let withSurvey = 0;

    waitlist.forEach((entry) => {
      const metadata = entry.metadata as Record<string, any> | null;
      const survey = metadata?.survey_responses;
      
      if (survey) {
        withSurvey++;

        // Count user types
        if (survey.user_type) {
          analytics.userTypes[survey.user_type] = (analytics.userTypes[survey.user_type] || 0) + 1;
        }

        // Count stress levels
        if (survey.stress_level) {
          analytics.stressLevels[survey.stress_level] = (analytics.stressLevels[survey.stress_level] || 0) + 1;
        }

        // Count pricing preferences
        if (survey.pricing_preference) {
          analytics.pricingPreferences[survey.pricing_preference] = (analytics.pricingPreferences[survey.pricing_preference] || 0) + 1;
        }

        // Count pain points (array)
        if (survey.pain_points && Array.isArray(survey.pain_points)) {
          survey.pain_points.forEach((point: string) => {
            analytics.painPoints[point] = (analytics.painPoints[point] || 0) + 1;
          });
        }
      }
    });

    analytics.totalWithSurvey = withSurvey;
    analytics.surveyCompletionRate = waitlist.length > 0 ? (withSurvey / waitlist.length) * 100 : 0;

    return analytics;
  }, [waitlist]);

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
    const headers = [
      'Position', 'Email', 'Full Name', 'Company', 'Status', 'Joined Date', 'Notified Date',
      'User Type', 'Stress Level', 'Pain Points', 'Pricing Preference', 'Survey Completed'
    ];
    
    const rows = waitlist.map(entry => {
      const metadata = entry.metadata as Record<string, any> | null;
      const survey = metadata?.survey_responses || {};
      
      return [
        entry.position,
        entry.email,
        entry.full_name || '',
        entry.company_name || '',
        entry.status,
        format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm'),
        entry.notified_at ? format(new Date(entry.notified_at), 'yyyy-MM-dd HH:mm') : '',
        survey.user_type || '',
        survey.stress_level || '',
        (survey.pain_points || []).join('; '),
        survey.pricing_preference || '',
        metadata?.survey_completed ? 'Yes' : 'No',
      ];
    });

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-with-survey-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredWaitlist = waitlist.filter(entry =>
    entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Analytics bar component
  const AnalyticsBar = ({ label, count, total, color = "bg-primary" }: { label: string; count: number; total: number; color?: string }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Waitlist Management</h1>
          <p className="text-muted-foreground">Manage and analyze your waitlist</p>
        </div>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Notified</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.notified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Converted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.converted}</div>
            <p className="text-xs text-muted-foreground">
              {stats.notified > 0 ? `${Math.round((stats.converted / stats.notified) * 100)}% conversion` : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entries" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Waitlist Entries</span>
            <span className="sm:hidden">Entries</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Survey Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
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
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden md:table-cell">Name</TableHead>
                      <TableHead className="hidden lg:table-cell">Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Joined</TableHead>
                      <TableHead className="w-12">Survey</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWaitlist.map((entry) => {
                      const metadata = entry.metadata as Record<string, any> | null;
                      const hasSurvey = metadata?.survey_completed;
                      const survey = metadata?.survey_responses || {};
                      const isExpanded = expandedRow === entry.id;

                      return (
                        <>
                          <TableRow 
                            key={entry.id} 
                            className={hasSurvey ? "cursor-pointer hover:bg-muted/50" : ""}
                            onClick={() => hasSurvey && setExpandedRow(isExpanded ? null : entry.id)}
                          >
                            <TableCell className="font-medium">#{entry.position}</TableCell>
                            <TableCell className="max-w-[150px] sm:max-w-none truncate">{entry.email}</TableCell>
                            <TableCell className="hidden md:table-cell">{entry.full_name || '-'}</TableCell>
                            <TableCell className="hidden lg:table-cell">{entry.company_name || '-'}</TableCell>
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
                            <TableCell className="hidden sm:table-cell text-xs">
                              {format(new Date(entry.created_at), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              {hasSurvey ? (
                                <div className="flex items-center gap-1">
                                  <Badge variant="default" className="text-xs">✓</Badge>
                                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-xs">-</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                          {isExpanded && hasSurvey && (
                            <TableRow key={`${entry.id}-expanded`}>
                              <TableCell colSpan={7} className="bg-muted/30 p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">User Type:</span>
                                    <p className="font-medium">{userTypeLabels[survey.user_type] || survey.user_type || '-'}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Stress Level:</span>
                                    <p className="font-medium">{stressLevelLabels[survey.stress_level] || survey.stress_level || '-'}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Pricing:</span>
                                    <p className="font-medium">{pricingLabels[survey.pricing_preference] || survey.pricing_preference || '-'}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Pain Points:</span>
                                    <p className="font-medium">
                                      {survey.pain_points?.length > 0 
                                        ? survey.pain_points.map((p: string) => painPointLabels[p] || p).join(', ')
                                        : '-'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Survey Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Survey Completion
              </CardTitle>
              <CardDescription>
                {surveyAnalytics.totalWithSurvey} of {waitlist.length} users completed the survey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-bold">{surveyAnalytics.surveyCompletionRate.toFixed(1)}%</span>
                </div>
                <Progress value={surveyAnalytics.surveyCompletionRate} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Types</CardTitle>
                <CardDescription>Who's interested in Accountant AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(userTypeLabels).map(([key, label]) => (
                  <AnalyticsBar
                    key={key}
                    label={label}
                    count={surveyAnalytics.userTypes[key] || 0}
                    total={surveyAnalytics.totalWithSurvey}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Stress Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stress Levels</CardTitle>
                <CardDescription>How stressed are users about accounting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stressLevelLabels).map(([key, label]) => (
                  <AnalyticsBar
                    key={key}
                    label={label}
                    count={surveyAnalytics.stressLevels[key] || 0}
                    total={surveyAnalytics.totalWithSurvey}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Pricing Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing Willingness</CardTitle>
                <CardDescription>What users are willing to pay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(pricingLabels).map(([key, label]) => (
                  <AnalyticsBar
                    key={key}
                    label={label}
                    count={surveyAnalytics.pricingPreferences[key] || 0}
                    total={surveyAnalytics.totalWithSurvey}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Pain Points */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pain Points</CardTitle>
                <CardDescription>Common issues users have experienced</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(painPointLabels).map(([key, label]) => (
                  <AnalyticsBar
                    key={key}
                    label={label}
                    count={surveyAnalytics.painPoints[key] || 0}
                    total={surveyAnalytics.totalWithSurvey}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
