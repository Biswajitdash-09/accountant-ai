
import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, Shield } from "lucide-react";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import { useForm } from "react-hook-form";
import { MobileForm, MobileFormSection } from "@/components/ui/mobile-form";

interface TaxSettingsFormData {
  tax_year_start: string;
  filing_status: string;
  business_type: string;
  tax_id_number?: string;
  state_tax_id?: string;
  quarterly_filing: boolean;
  auto_categorize_expenses: boolean;
  default_deduction_categories: string[];
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    deadline_reminders: boolean;
  };
}

export const TaxSettings = () => {
  const { taxSettings, createOrUpdateTaxSettings, isLoading } = useTaxSettings();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TaxSettingsFormData>({
    defaultValues: {
      tax_year_start: new Date().getFullYear() + '-01-01',
      filing_status: 'single',
      business_type: 'sole_proprietorship',
      quarterly_filing: false,
      auto_categorize_expenses: true,
      default_deduction_categories: ['office_supplies', 'travel', 'meals', 'utilities', 'professional_services'],
      notification_preferences: {
        email: true,
        push: true,
        sms: false,
        deadline_reminders: true,
      },
    },
  });

  // Load existing settings when available
  useEffect(() => {
    if (taxSettings) {
      setValue('tax_year_start', taxSettings.tax_year_start);
      setValue('filing_status', taxSettings.filing_status);
      setValue('business_type', taxSettings.business_type);
      setValue('tax_id_number', taxSettings.tax_id_number || '');
      setValue('state_tax_id', taxSettings.state_tax_id || '');
      setValue('quarterly_filing', taxSettings.quarterly_filing);
      setValue('auto_categorize_expenses', taxSettings.auto_categorize_expenses);
      setValue('default_deduction_categories', taxSettings.default_deduction_categories);
      setValue('notification_preferences', taxSettings.notification_preferences || {
        email: true,
        push: true,
        sms: false,
        deadline_reminders: true,
      });
    }
  }, [taxSettings, setValue]);

  const onSubmit = async (data: TaxSettingsFormData) => {
    try {
      await createOrUpdateTaxSettings.mutateAsync(data);
    } catch (error) {
      console.error('Error saving tax settings:', error);
    }
  };

  const deductionCategories = [
    'office_supplies',
    'travel',
    'meals',
    'utilities',
    'professional_services',
    'equipment',
    'software',
    'marketing',
    'insurance',
    'rent',
  ];

  const toggleDeductionCategory = (category: string) => {
    const current = watch('default_deduction_categories') || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    setValue('default_deduction_categories', updated);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tax Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your tax preferences and business information
          </p>
        </div>

        <MobileForm>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Basic information about your business and tax filing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MobileFormSection title="Tax Year & Filing">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tax_year_start">Tax Year Start</Label>
                      <Input 
                        type="date" 
                        {...register('tax_year_start', { required: 'Tax year start is required' })}
                      />
                      {errors.tax_year_start && (
                        <p className="text-sm text-red-500">{errors.tax_year_start.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="filing_status">Filing Status</Label>
                      <Select 
                        value={watch('filing_status')} 
                        onValueChange={(value) => setValue('filing_status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select filing status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married_filing_jointly">Married Filing Jointly</SelectItem>
                          <SelectItem value="married_filing_separately">Married Filing Separately</SelectItem>
                          <SelectItem value="head_of_household">Head of Household</SelectItem>
                          <SelectItem value="qualifying_widow">Qualifying Widow(er)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </MobileFormSection>

                <MobileFormSection title="Business Details">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business_type">Business Type</Label>
                      <Select 
                        value={watch('business_type')} 
                        onValueChange={(value) => setValue('business_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="llc">LLC</SelectItem>
                          <SelectItem value="s_corp">S Corporation</SelectItem>
                          <SelectItem value="c_corp">C Corporation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tax_id_number">Tax ID Number</Label>
                      <Input 
                        {...register('tax_id_number')}
                        placeholder="Federal Tax ID (EIN/SSN)"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="state_tax_id">State Tax ID</Label>
                    <Input 
                      {...register('state_tax_id')}
                      placeholder="State Tax ID (if applicable)"
                    />
                  </div>
                </MobileFormSection>
              </CardContent>
            </Card>

            {/* Filing Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Filing Preferences</CardTitle>
                <CardDescription>
                  Configure how you handle tax filing and expense tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="quarterly_filing">Quarterly Filing</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable quarterly estimated tax payments
                    </p>
                  </div>
                  <Switch
                    checked={watch('quarterly_filing')}
                    onCheckedChange={(checked) => setValue('quarterly_filing', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_categorize_expenses">Auto-Categorize Expenses</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically categorize expenses for tax deductions
                    </p>
                  </div>
                  <Switch
                    checked={watch('auto_categorize_expenses')}
                    onCheckedChange={(checked) => setValue('auto_categorize_expenses', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Default Deduction Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Default Deduction Categories</CardTitle>
                <CardDescription>
                  Select expense categories that are typically tax-deductible for your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {deductionCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={category}
                        checked={watch('default_deduction_categories')?.includes(category) || false}
                        onChange={() => toggleDeductionCategory(category)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={category} className="text-sm">
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive tax-related notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive tax updates via email
                    </p>
                  </div>
                  <Switch
                    checked={watch('notification_preferences.email')}
                    onCheckedChange={(checked) => 
                      setValue('notification_preferences.email', checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in the app
                    </p>
                  </div>
                  <Switch
                    checked={watch('notification_preferences.push')}
                    onCheckedChange={(checked) => 
                      setValue('notification_preferences.push', checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Deadline Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminders for tax deadlines
                    </p>
                  </div>
                  <Switch
                    checked={watch('notification_preferences.deadline_reminders')}
                    onCheckedChange={(checked) => 
                      setValue('notification_preferences.deadline_reminders', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createOrUpdateTaxSettings.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createOrUpdateTaxSettings.isPending ? 'Saving...' : 'Save Tax Settings'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </MobileForm>
      </div>
    </div>
  );
};
