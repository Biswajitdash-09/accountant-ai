
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useDeadlines, Deadline } from "@/hooks/useDeadlines";
import { format, differenceInDays } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

export const DeadlineTracker = () => {
  const { deadlines, createDeadline, updateDeadline, deleteDeadline } = useDeadlines();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const isMobile = useIsMobile();
  const [newDeadline, setNewDeadline] = useState({
    title: "",
    description: "",
    deadline_date: "",
    deadline_type: "personal" as "tax" | "financial" | "business" | "personal",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    notification_days: [7, 3, 1],
  });

  const handleCreateDeadline = () => {
    if (!newDeadline.title.trim() || !newDeadline.deadline_date) return;
    
    createDeadline.mutate({
      ...newDeadline,
      status: "pending" as const,
    });
    
    setNewDeadline({
      title: "",
      description: "",
      deadline_date: "",
      deadline_type: "personal" as "tax" | "financial" | "business" | "personal",
      priority: "medium" as "low" | "medium" | "high" | "critical",
      notification_days: [7, 3, 1],
    });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateDeadline = (deadline: Deadline, updates: Partial<Deadline>) => {
    updateDeadline.mutate({ id: deadline.id, ...updates });
  };

  const handleDeleteDeadline = (id: string) => {
    deleteDeadline.mutate(id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tax': return 'destructive';
      case 'financial': return 'secondary';
      case 'business': return 'default';
      case 'personal': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'missed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getDaysUntilDeadline = (deadlineDate: string) => {
    return differenceInDays(new Date(deadlineDate), new Date());
  };

  const getUrgencyIndicator = (daysUntil: number) => {
    if (daysUntil < 0) return { color: 'text-red-600', text: 'Overdue' };
    if (daysUntil === 0) return { color: 'text-red-600', text: 'Due today' };
    if (daysUntil <= 3) return { color: 'text-orange-600', text: `${daysUntil} days left` };
    if (daysUntil <= 7) return { color: 'text-yellow-600', text: `${daysUntil} days left` };
    return { color: 'text-green-600', text: `${daysUntil} days left` };
  };

  const CreateDeadlineForm = () => (
    <div className="space-y-4 p-4 md:p-0">
      <div>
        <Label htmlFor="title" className="mobile-form-label">Title</Label>
        <Input
          id="title"
          value={newDeadline.title}
          onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
          placeholder="Enter deadline title"
          className="mobile-form-field"
        />
      </div>
      <div>
        <Label htmlFor="description" className="mobile-form-label">Description</Label>
        <Textarea
          id="description"
          value={newDeadline.description}
          onChange={(e) => setNewDeadline({ ...newDeadline, description: e.target.value })}
          placeholder="Enter deadline description"
          className="min-h-[100px]"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deadline_type" className="mobile-form-label">Type</Label>
          <Select value={newDeadline.deadline_type} onValueChange={(value) => setNewDeadline({ ...newDeadline, deadline_type: value as "tax" | "financial" | "business" | "personal" })}>
            <SelectTrigger className="mobile-form-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="mobile-select-content">
              <SelectItem value="tax" className="min-h-[44px]">Tax</SelectItem>
              <SelectItem value="financial" className="min-h-[44px]">Financial</SelectItem>
              <SelectItem value="business" className="min-h-[44px]">Business</SelectItem>
              <SelectItem value="personal" className="min-h-[44px]">Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority" className="mobile-form-label">Priority</Label>
          <Select value={newDeadline.priority} onValueChange={(value) => setNewDeadline({ ...newDeadline, priority: value as "low" | "medium" | "high" | "critical" })}>
            <SelectTrigger className="mobile-form-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="mobile-select-content">
              <SelectItem value="low" className="min-h-[44px]">Low</SelectItem>
              <SelectItem value="medium" className="min-h-[44px]">Medium</SelectItem>
              <SelectItem value="high" className="min-h-[44px]">High</SelectItem>
              <SelectItem value="critical" className="min-h-[44px]">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="deadline_date" className="mobile-form-label">Deadline Date</Label>
        <Input
          id="deadline_date"
          type="date"
          value={newDeadline.deadline_date}
          onChange={(e) => setNewDeadline({ ...newDeadline, deadline_date: e.target.value })}
          className="mobile-form-field"
        />
      </div>
      <div className="mobile-action-group pt-4">
        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="min-h-[48px]">
          Cancel
        </Button>
        <Button onClick={handleCreateDeadline} className="min-h-[48px]">
          Create Deadline
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Deadline Tracker
            </CardTitle>
            <CardDescription>
              Keep track of important deadlines and never miss them
            </CardDescription>
          </div>
          {isMobile ? (
            <Drawer open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DrawerTrigger asChild>
                <Button className="w-full sm:w-auto min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deadline
                </Button>
              </DrawerTrigger>
              <DrawerContent className="mobile-drawer-content">
                <DrawerHeader>
                  <DrawerTitle>Create New Deadline</DrawerTitle>
                </DrawerHeader>
                <CreateDeadlineForm />
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deadline
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Deadline</DialogTitle>
                </DialogHeader>
                <CreateDeadlineForm />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deadlines.map((deadline) => {
            const daysUntil = getDaysUntilDeadline(deadline.deadline_date);
            const urgency = getUrgencyIndicator(daysUntil);
            
            return (
              <div key={deadline.id} className="p-3 border rounded-lg relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-medium">{deadline.title}</h4>
                      <Badge variant={getTypeColor(deadline.deadline_type)} className="text-xs">
                        {deadline.deadline_type}
                      </Badge>
                      <Badge variant={getPriorityColor(deadline.priority)} className="text-xs">
                        {deadline.priority}
                      </Badge>
                      <Badge variant={getStatusColor(deadline.status)} className="text-xs">
                        {deadline.status}
                      </Badge>
                    </div>
                    {deadline.description && (
                      <p className="text-sm text-muted-foreground mb-2">{deadline.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(deadline.deadline_date), 'MMM dd, yyyy')}
                      </span>
                      <span className={`flex items-center gap-1 ${urgency.color}`}>
                        <AlertTriangle className="h-3 w-3" />
                        {urgency.text}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDeadline(deadline)}
                      className="min-h-[44px] min-w-[44px]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDeadline(deadline.id)}
                      className="min-h-[44px] min-w-[44px]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {deadlines.length === 0 && (
            <p className="text-muted-foreground text-center py-6">
              No deadlines yet. Create your first deadline to stay organized!
            </p>
          )}
        </div>
      </CardContent>
      {/* Edit Deadline Dialog */}
      {editingDeadline && (
        <Dialog open={!!editingDeadline} onOpenChange={(open) => !open && setEditingDeadline(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Deadline</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_title">Title</Label>
                <Input
                  id="edit_title"
                  value={editingDeadline.title}
                  onChange={(e) => setEditingDeadline({ ...editingDeadline, title: e.target.value })}
                  placeholder="Enter deadline title"
                />
              </div>
              <div>
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={editingDeadline.description || ''}
                  onChange={(e) => setEditingDeadline({ ...editingDeadline, description: e.target.value })}
                  placeholder="Enter deadline description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={editingDeadline.deadline_type}
                    onValueChange={(value) => setEditingDeadline({ ...editingDeadline, deadline_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tax">Tax</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={editingDeadline.priority}
                    onValueChange={(value) => setEditingDeadline({ ...editingDeadline, priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit_deadline_date">Deadline Date</Label>
                <Input
                  id="edit_deadline_date"
                  type="date"
                  value={editingDeadline.deadline_date}
                  onChange={(e) => setEditingDeadline({ ...editingDeadline, deadline_date: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingDeadline(null)}>Cancel</Button>
                <Button onClick={() => {
                  handleUpdateDeadline(editingDeadline!, {
                    title: editingDeadline.title,
                    description: editingDeadline.description,
                    deadline_type: editingDeadline.deadline_type,
                    priority: editingDeadline.priority,
                    deadline_date: editingDeadline.deadline_date,
                  });
                  setEditingDeadline(null);
                }}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
