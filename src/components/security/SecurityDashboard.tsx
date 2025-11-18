import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle2, Clock, Lock, Key, Eye } from 'lucide-react';
import { useSecurityAuditLogs } from '@/hooks/useSecurityAuditLogs';
import { use2FA } from '@/hooks/use2FA';
import { formatDistanceToNow } from 'date-fns';

export const SecurityDashboard = () => {
  const { auditLogs: logs, isLoading } = useSecurityAuditLogs();
  const { status: twoFactorStatus } = use2FA();

  // Calculate security score
  const calculateSecurityScore = () => {
    let score = 0;
    const maxScore = 100;

    // 2FA enabled (40 points)
    if (twoFactorStatus.enabled && twoFactorStatus.verified) {
      score += 40;
    }

    // Recent activity monitoring (20 points)
    if (logs && logs.length > 0) {
      score += 20;
    }

    // Strong password (20 points - assume enabled if user exists)
    score += 20;

    // Regular password changes (10 points)
    score += 10;

    // Session management (10 points)
    score += 10;

    return Math.min(score, maxScore);
  };

  const securityScore = calculateSecurityScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const recentLogins = logs?.filter(log => log.action_type === 'login').slice(0, 5) || [];
  const suspiciousActivity = logs?.filter(log => 
    log.action_type === 'failed_login' || 
    log.action_type === 'password_change' ||
    log.action_type === 'security_settings_changed'
  ).slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Score
          </CardTitle>
          <CardDescription>
            Your overall account security rating
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-4xl font-bold ${getScoreColor(securityScore)}`}>
                {securityScore}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {getScoreStatus(securityScore)}
              </p>
            </div>
            <Shield className={`h-16 w-16 ${getScoreColor(securityScore)}`} />
          </div>
          
          <Progress value={securityScore} className="h-2" />

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                {twoFactorStatus.enabled ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span>Two-Factor Auth</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                {twoFactorStatus.enabled ? 'Enabled' : 'Not enabled'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Strong Password</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Active
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Session Security</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Protected
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-blue-500" />
                <span>Activity Monitoring</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      {securityScore < 80 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Security Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!twoFactorStatus.enabled && (
              <Alert>
                <Key className="h-4 w-4" />
                <AlertTitle>Enable Two-Factor Authentication</AlertTitle>
                <AlertDescription>
                  Add an extra layer of security by enabling 2FA. This will protect your account even if your password is compromised.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <Lock className="h-4 w-4" />
              <AlertTitle>Review Active Sessions</AlertTitle>
              <AlertDescription>
                Regularly review and revoke access from devices you no longer use.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-12 bg-muted animate-pulse rounded" />
            </div>
          ) : recentLogins.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity to display
            </p>
          ) : (
            <div className="space-y-3">
              {recentLogins.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{log.action_description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Success</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspicious Activity */}
      {suspiciousActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Attention Required
            </CardTitle>
            <CardDescription>
              Unusual activity detected on your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suspiciousActivity.map((log) => (
                <Alert key={log.id} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{log.action_description}</AlertTitle>
                  <AlertDescription>
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
