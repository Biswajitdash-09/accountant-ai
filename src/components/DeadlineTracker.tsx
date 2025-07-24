
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useDeadlines, Deadline } from "@/hooks/useDeadlines";
import { format, differenceInDays, isPast } from "date-fns";

export const DeadlineTracker = () => {
  const { deadlines, isLoading, createDeadline, updateDeadline, deleteDeadline } = useDeadlines();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline_date: "",
    deadline_type: "personal" as const,
    priority: "medium" as const,
    notification_days: [7, 3, 1],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const deadlineData = {
      ...formData,
      status: "pending" as const,
    };

    if (editingDeadline) {
      updateDeadline.mutate({ id: editingDeadline.id, ...deadlineData });
    } else {
      createDeadline.mutate(deadlineData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      deadline_date: "",
      deadline_type: "personal",
      priority: "medium",
      notification_days: [7, 3, 1],
    });
    setEditingDeadline(null);
  };

  const handleEdit = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setFormData({
      title: deadline.title,
      description: deadline.description || "",
      deadline_date: deadline.deadline_date,
      deadline_type: deadline.deadline_type,
      priority: deadline.priority,
      notification_days: deadline.notification_days,
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = (deadline: Deadline, status: 'completed' | 'pending') => {
    updateDeadline.mutate({
      id: deadline.id,
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : undefined,
    });
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

  const getUrgencyInfo = (deadline: Deadline) => {
    const daysUntil = differenceInDays(new Date(deadline.deadline_date), new Date());
    const isOverdue = isPast(new Date(deadline.deadline_date));
    
    if (isOverdue) {
      return { status: 'overdue', text: 'Overdue', color: 'destructive' };
    } else if (daysUntil <= 1) {
      return { status: 'urgent', text: 'Due Today', color: 'destructive' };
    } else if (daysUntil <= 3) {
      return { status: 'soon', text: `${daysUntil} days left`, color: 'secondary' };
    } else if (daysUntil <= 7) {
      return { status: 'upcoming', text: `${daysUntil} days left`, color: 'outline' };
    } else {
      return { status: 'normal', text: `${daysUntil} days left`, color: 'outline' };
    }
  };

  const sortedDeadlines = [...deadlines].sort((a, b) => {
    // Sort by deadline date, with overdue items first
    const aDate = new Date(a.deadline_date);
    const bDate = new Date(b.deadline_date);
    
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    return aDate.getTime() - bDate.getTime();
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading deadlines...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Deadline Tracker</CardTitle>
            <CardDescription>
              Track important deadlines and never miss them
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Deadline
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDeadline ? "Edit Deadline" : "Create New Deadline"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="deadline_date">Deadline Date</Label>
                  <Input
                    id="deadline_date"
                    type="date"
                    value={formData.deadline_date}
                    onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deadline_type">Type</Label>
                  <Select value={formData.deadline_type} onValueChange={(value: any) => setFormData({ ...formData, deadline_type: value })}>
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
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
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
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingDeadline ? "Update" : "Create"} Deadline
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedDeadlines.map((deadline) => {
            const urgencyInfo = getUrgencyInfo(deadline);
            const isCompleted = deadline.status === 'completed';
            
            return (
              <div
                key={deadline.id}
                className={`p-4 border rounded-lg ${
                  isCompleted ? 'bg-muted/50' : urgencyInfo.status === 'overdue' ? 'border-red-200 bg-red-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {deadline.title}
                      </h4>
                      <Badge variant={getTypeColor(deadline.deadline_type)} className="text-xs">
                        {deadline.deadline_type}
                      </Badge>
                      <Badge variant={getPriorityColor(deadline.priority)} className="text-xs">
                        {deadline.priority}
                      </Badge>
                      {!isCompleted && (
                        <Badge variant={urgencyInfo.color as any} className="text-xs">
                          {urgencyInfo.status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {urgencyInfo.text}
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      )}
                    </div>
                    {deadline.description && (
                      <p className="text-sm text-muted-foreground mb-2">{deadline.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(new Date(deadline.deadline_date), 'MMM dd, yyyy')}
                      </div>
                      {deadline.completed_at && (
                        <div>
                          Completed: {format(new Date(deadline.completed_at), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(deadline, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {isCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(deadline, 'pending')}
                      >
                        Reopen
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(deadline)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDeadline.mutate(deadline.id)}
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
              No deadlines yet. Add one to get started!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
