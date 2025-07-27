
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Plus, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useTaxRules } from '@/hooks/useTaxRules';

export const AdvancedTaxManager = () => {
  const { taxRules, complianceChecks, createTaxRule, runComplianceCheck } = useTaxRules();
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_name: '',
    rule_type: 'deduction',
    conditions: {},
    actions: {},
    priority: 1
  });

  const handleCreateRule = async () => {
    await createTaxRule.mutateAsync({
      rule_name: newRule.rule_name,
      rule_type: newRule.rule_type,
      conditions: {
        category: 'business_expense',
        min_amount: 0,
        max_amount: null
      },
      actions: {
        apply_deduction: true,
        deduction_rate: 1.0,
        documentation_required: true
      },
      priority: newRule.priority
    });
    setNewRule({
      rule_name: '',
      rule_type: 'deduction',
      conditions: {},
      actions: {},
      priority: 1
    });
    setShowRuleDialog(false);
  };

  const handleRunComplianceCheck = async (checkType: string) => {
    await runComplianceCheck.mutateAsync({
      check_type: checkType
    });
  };

  const ruleTypes = [
    { value: 'deduction', label: 'Tax Deduction Rule' },
    { value: 'categorization', label: 'Auto-Categorization' },
    { value: 'validation', label: 'Data Validation' },
    { value: 'reminder', label: 'Reminder Rule' },
    { value: 'calculation', label: 'Tax Calculation' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Advanced Tax Management</h3>
          <p className="text-sm text-muted-foreground">
            Automated tax rules and compliance monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleRunComplianceCheck('quarterly_review')}
          >
            Run Compliance Check
          </Button>
          <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Tax Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Tax Rule</DialogTitle>
                <DialogDescription>
                  Define automated tax processing rules
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Rule Name</Label>
                  <Input
                    value={newRule.rule_name}
                    onChange={(e) => setNewRule({...newRule, rule_name: e.target.value})}
                    placeholder="Office supplies deduction rule"
                  />
                </div>
                <div>
                  <Label>Rule Type</Label>
                  <Select
                    value={newRule.rule_type}
                    onValueChange={(value) => setNewRule({...newRule, rule_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ruleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({...newRule, priority: Number(e.target.value)})}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateRule}
                    disabled={!newRule.rule_name}
                  >
                    Create Rule
                  </Button>
                  <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Tax Rules
            </CardTitle>
            <CardDescription>
              Active automated tax processing rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {taxRules.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No tax rules configured yet
                </p>
              ) : (
                taxRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{rule.rule_name}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {rule.rule_type.replace('_', ' ')} • Priority {rule.priority}
                        </div>
                      </div>
                    </div>
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Compliance Checks
            </CardTitle>
            <CardDescription>
              Recent tax compliance monitoring results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceChecks.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No compliance checks run yet
                </p>
              ) : (
                complianceChecks.slice(0, 5).map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium text-sm capitalize">
                          {check.check_type.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {check.issues_found.length} issues found
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(check.checked_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {complianceChecks.length > 0 && complianceChecks.some(check => check.issues_found.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Recent Issues & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceChecks
                .filter(check => check.issues_found.length > 0)
                .slice(0, 3)
                .map((check) => (
                  <div key={check.id} className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                    <div className="font-medium text-sm mb-2">
                      {check.check_type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="space-y-2">
                      {check.issues_found.slice(0, 2).map((issue: any, index: number) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {typeof issue === 'string' ? issue : 'Tax compliance issue detected'}
                        </div>
                      ))}
                      {check.recommendations.slice(0, 1).map((rec: any, index: number) => (
                        <div key={index} className="text-sm text-blue-600 font-medium">
                          ✓ {typeof rec === 'string' ? rec : 'Review and update tax categorization'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
