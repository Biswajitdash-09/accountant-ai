
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface RevenueData {
  stream_name: string;
  stream_type: 'sales' | 'donations' | 'loans' | 'grants' | 'other';
  description: string;
  target_amount: number;
  actual_amount: number;
  is_active: boolean;
}

interface RevenueStreamFormProps {
  revenueData: RevenueData;
  setRevenueData: (data: RevenueData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RevenueStreamForm = ({ revenueData, setRevenueData, onSubmit }: RevenueStreamFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="stream_name">Stream Name</Label>
        <Input
          id="stream_name"
          value={revenueData.stream_name}
          onChange={(e) => setRevenueData({ ...revenueData, stream_name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="stream_type">Stream Type</Label>
        <Select value={revenueData.stream_type} onValueChange={(value: 'sales' | 'donations' | 'loans' | 'grants' | 'other') => setRevenueData({ ...revenueData, stream_type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="donations">Donations</SelectItem>
            <SelectItem value="loans">Loans</SelectItem>
            <SelectItem value="grants">Grants</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="target_amount">Target Amount</Label>
          <Input
            id="target_amount"
            type="number"
            value={revenueData.target_amount}
            onChange={(e) => setRevenueData({ ...revenueData, target_amount: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="actual_amount">Actual Amount</Label>
          <Input
            id="actual_amount"
            type="number"
            value={revenueData.actual_amount}
            onChange={(e) => setRevenueData({ ...revenueData, actual_amount: Number(e.target.value) })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={revenueData.description}
          onChange={(e) => setRevenueData({ ...revenueData, description: e.target.value })}
          rows={3}
        />
      </div>
      <Button type="submit" className="w-full">Add Revenue Stream</Button>
    </form>
  );
};
