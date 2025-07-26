
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useRevenueStreams, RevenueStream } from "@/hooks/useRevenueStreams";
import { useBusinessEntities } from "@/hooks/useBusinessEntities";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Loader2, DollarSign, Calendar, FileText, Building } from "lucide-react";

interface RevenueStreamFormProps {
  revenueStream?: RevenueStream;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RevenueStreamForm = ({ revenueStream, onSuccess, onCancel }: RevenueStreamFormProps) => {
  const { createRevenueStream, updateRevenueStream } = useRevenueStreams();
  const { businessEntities } = useBusinessEntities();
  const { currencies, baseCurrency } = useCurrencies();
  const { preferences } = useUserPreferences();
  
  const [formData, setFormData] = useState({
    stream_name: revenueStream?.stream_name || "",
    stream_type: revenueStream?.stream_type || "sales" as const,
    description: revenueStream?.description || "",
    target_amount: revenueStream?.target_amount || 0,
    actual_amount: revenueStream?.actual_amount || 0,
    period_start: revenueStream?.period_start || new Date().toISOString().split('T')[0],
    period_end: revenueStream?.period_end || "",
    is_active: revenueStream?.is_active ?? true,
    business_entity_id: revenueStream?.business_entity_id || "",
    currency_id: revenueStream?.currency_id || preferences?.default_currency_id || baseCurrency?.id || ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const streamTypes = [
    "sales",
    "donations", 
    "loans",
    "grants",
    "other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stream_name.trim()) {
      alert("Stream name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const streamData = {
        ...formData,
        target_amount: formData.target_amount || null,
        currency_id: formData.currency_id || preferences?.default_currency_id || baseCurrency?.id || ""
      };

      if (revenueStream) {
        await updateRevenueStream.mutateAsync({ id: revenueStream.id, ...streamData });
      } else {
        await createRevenueStream.mutateAsync(streamData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving revenue stream:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setFormData({
        stream_name: "",
        stream_type: "sales",
        description: "",
        target_amount: 0,
        actual_amount: 0,
        period_start: new Date().toISOString().split('T')[0],
        period_end: "",
        is_active: true,
        business_entity_id: "",
        currency_id: preferences?.default_currency_id || baseCurrency?.id || ""
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stream_name">Revenue Stream Name</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="stream_name"
              value={formData.stream_name}
              onChange={(e) => setFormData({ ...formData, stream_name: e.target.value })}
              className="pl-10"
              placeholder="e.g., E-commerce Sales"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stream_type">Stream Type</Label>
          <Select value={formData.stream_type} onValueChange={(value: any) => setFormData({ ...formData, stream_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select stream type" />
            </SelectTrigger>
            <SelectContent>
              {streamTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_amount">Target Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="target_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.target_amount || ""}
              onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })}
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="actual_amount">Actual Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="actual_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.actual_amount || ""}
              onChange={(e) => setFormData({ ...formData, actual_amount: parseFloat(e.target.value) || 0 })}
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency_id} onValueChange={(value) => setFormData({ ...formData, currency_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.id} value={currency.id}>
                  <div className="flex items-center gap-2">
                    <span>{currency.symbol}</span>
                    <span>{currency.name}</span>
                    <span className="text-sm text-muted-foreground">({currency.code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_entity">Business Entity (Optional)</Label>
          <Select value={formData.business_entity_id} onValueChange={(value) => setFormData({ ...formData, business_entity_id: value })}>
            <SelectTrigger>
              <Building className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select business entity" />
            </SelectTrigger>
            <SelectContent>
              {businessEntities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period_start">Period Start Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="period_start"
              type="date"
              value={formData.period_start}
              onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period_end">Period End Date (Optional)</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="period_end"
              type="date"
              value={formData.period_end}
              onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this revenue stream"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active revenue stream</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {revenueStream ? "Updating..." : "Creating..."}
            </>
          ) : (
            revenueStream ? "Update Revenue Stream" : "Create Revenue Stream"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default RevenueStreamForm;
