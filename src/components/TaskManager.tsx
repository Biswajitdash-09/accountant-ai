
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, CheckSquare, Calendar, Clock } from "lucide-react";
import { useTasks, Task } from "@/hooks/useTasks";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

export const TaskManager = () => {
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const isMobile = useIsMobile();
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    due_date: "",
    is_recurring: false,
    tags: [] as string[],
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    
    createTask.mutate({
      ...newTask,
      status: "pending" as const,
      recurring_pattern: newTask.is_recurring ? "weekly" : undefined,
    });
    
    setNewTask({
      title: "",
      description: "",
      priority: "medium" as "low" | "medium" | "high" | "critical",
      due_date: "",
      is_recurring: false,
      tags: [],
    });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateTask = (task: Task, updates: Partial<Task>) => {
    updateTask.mutate({ id: task.id, ...updates });
  };

  const handleDeleteTask = (id: string) => {
    deleteTask.mutate(id);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Task Management</span>
            </CardTitle>
            <CardDescription className="break-words">
              Organize your tasks and stay productive
            </CardDescription>
          </div>
          {isMobile ? (
            <Drawer open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DrawerTrigger asChild>
                <Button className="w-full sm:w-auto min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DrawerTrigger>
              <DrawerContent className="mobile-drawer-content">
                <DrawerHeader>
                  <DrawerTitle>Create New Task</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="title" className="mobile-form-label">Title</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                      className="mobile-form-field"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="mobile-form-label">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Enter task description"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority" className="mobile-form-label">Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value as "low" | "medium" | "high" | "critical" })}>
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
                    <div>
                      <Label htmlFor="due_date" className="mobile-form-label">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                        className="mobile-form-field"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 min-h-[44px]">
                    <Checkbox
                      id="recurring"
                      checked={newTask.is_recurring}
                      onCheckedChange={(checked) => setNewTask({ ...newTask, is_recurring: checked as boolean })}
                      className="h-5 w-5"
                    />
                    <Label htmlFor="recurring" className="text-base">Recurring task</Label>
                  </div>
                  <div className="mobile-action-group pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="min-h-[48px]">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask} className="min-h-[48px]">
                      Create Task
                    </Button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Enter task description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value as "low" | "medium" | "high" | "critical" })}>
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
                    <div>
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recurring"
                      checked={newTask.is_recurring}
                      onCheckedChange={(checked) => setNewTask({ ...newTask, is_recurring: checked as boolean })}
                    />
                    <Label htmlFor="recurring">Recurring task</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask}>
                      Create Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 border rounded-lg bg-card">
              <div className="space-y-3">
                {/* Header row with checkbox, title and actions */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={(checked) => 
                      handleUpdateTask(task, { 
                        status: checked ? 'completed' : 'pending',
                        completed_at: checked ? new Date().toISOString() : undefined
                      })
                    }
                    className="mt-1 min-w-[20px]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium break-words ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTask(task)}
                      className="min-h-[44px] min-w-[44px]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="min-h-[44px] min-w-[44px]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap pl-8">
                  <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                    {task.priority}
                  </Badge>
                  <Badge variant={getStatusColor(task.status)} className="text-xs">
                    {task.status}
                  </Badge>
                </div>

                {/* Description */}
                {task.description && (
                  <div className="pl-8">
                    <p className="text-sm text-muted-foreground break-words line-clamp-2">
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Date info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground pl-8">
                  {task.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="break-words">Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="break-words">Created: {format(new Date(task.created_at), 'MMM dd, yyyy')}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-muted-foreground text-center py-6">
              No tasks yet. Create your first task to get started!
            </p>
          )}
        </div>
      </CardContent>
      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_task_title">Title</Label>
                <Input
                  id="edit_task_title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="edit_task_description">Description</Label>
                <Textarea
                  id="edit_task_description"
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as any })}
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
                <div>
                  <Label htmlFor="edit_task_due_date">Due Date</Label>
                  <Input
                    id="edit_task_due_date"
                    type="date"
                    value={editingTask.due_date || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
                <Button onClick={() => {
                  handleUpdateTask(editingTask!, {
                    title: editingTask.title,
                    description: editingTask.description,
                    priority: editingTask.priority,
                    due_date: editingTask.due_date,
                  });
                  setEditingTask(null);
                }}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
