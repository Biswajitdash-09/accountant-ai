
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, FileText, Check, X } from "lucide-react";
import { useTaxDeductions } from "@/hooks/useTaxDeductions";
import { useTaxPeriods } from "@/hooks/useTaxPeriods";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/components/ui/use-toast";

export const TaxDeductionManager = () => {
  const { taxPeriods } = useTaxPeriods();
  const currentPeriod = taxPeriods.find(p => p.status === 'active') || taxPeriods[0];
  const { taxDeductions, createTaxDeduction, updateTaxDeduction, deleteTaxDeduction, isLoading } = useTaxDeductions(currentPeriod?.id);
  const { formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    amount: '',
    deduction_type: 'business_expense' as const,
    notes: ''
  });

  const deductionTypes = [
    { value: 'business_expense', label: 'Business Expense' },
    { value: 'home_office', label: 'Home Office' },
    { value: 'travel', label: 'Travel' },
    { value: 'meals', label: 'Meals & Entertainment' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'professional_services', label: 'Professional Services' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPeriod) {
      toast({
        title: "Error",
        description: "No active tax period found",
        variant: "destructive",
      });
      return;
    }

    const deductionData = {
      ...formData,
      tax_period_id: currentPeriod.id,
      amount: parseFloat(formData.amount),
      is_approved: false,
      supporting_documents: []
    };

    if (editingDeduction) {
      await updateTaxDeduction.mutateAsync({
        id: editingDeduction,
        ...deductionData
      });
      setEditingDeduction(null);
    } else {
      await createTaxDeduction.mutateAsync(deductionData);
    }

    setFormData({
      category: '',
      subcategory: '',
      description: '',
      amount: '',
      deduction_type: 'business_expense',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (deduction: any) => {
    setFormData({
      category: deduction.category,
      subcategory: deduction.subcategory || '',
      description: deduction.description,
      amount: deduction.amount.toString(),
      deduction_type: deduction.deduction_type,
      notes: deduction.notes || ''
    });
    setEditingDeduction(deduction.id);
    setShowAddForm(true);
  };

  const handleApprove = async (deductionId: string, isApproved: boolean) => {
    await updateTaxDeduction.mutateAsync({
      id: deductionId,
      is_approved: isApproved
    });
  };

  const totalDeductions = taxDeductions.reduce((sum, d) => sum + d.amount, 0);
  const approvedDeductions = taxDeductions.filter(d => d.is_approved).reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDeductions)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(approvedDeductions)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalDeductions - approvedDeductions)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Deduction Form */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Tax Deductions</CardTitle>
              <CardDescription>Manage your tax-deductible expenses</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Deduction
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="deduction_type">Deduction Type</Label>
                  <Select value={formData.deduction_type} onValueChange={(value: any) => setFormData({...formData, deduction_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {deductionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {editingDeduction ? 'Update' : 'Add'} Deduction
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowAddForm(false);
                  setEditingDeduction(null);
                  setFormData({
                    category: '',
                    subcategory: '',
                    description: '',
                    amount: '',
                    deduction_type: 'business_expense',
                    notes: ''
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Deductions List */}
          <div className="space-y-4">
            {taxDeductions.map((deduction) => (
              <Card key={deduction.id} className={`${deduction.is_approved ? 'border-green-200' : 'border-orange-200'}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{deduction.category}</h4>
                        {deduction.subcategory && (
                          <Badge variant="secondary">{deduction.subcategory}</Badge>
                        )}
                        <Badge variant={deduction.is_approved ? "default" : "outline"}>
                          {deduction.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{deduction.description}</p>
                      <div className="text-lg font-semibold">{formatCurrency(deduction.amount)}</div>
                      {deduction.notes && (
                        <p className="text-sm text-muted-foreground mt-2">Notes: {deduction.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={deduction.is_approved ? "outline" : "default"}
                        onClick={() => handleApprove(deduction.id, !deduction.is_approved)}
                      >
                        {deduction.is_approved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(deduction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTaxDeduction.mutateAsync(deduction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
