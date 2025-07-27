
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { useTaxCalendar, TaxCalendarEvent } from "@/hooks/useTaxCalendar";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { format } from "date-fns";
import { useForm } from "react-hook-form";

type EventFormData = Omit<TaxCalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const TaxCalendar = () => {
  const { calendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, initializeDefaultCalendar, isLoading } = useTaxCalendar();
  const { formatCurrency } = useCurrencyFormatter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TaxCalendarEvent | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EventFormData>();

  const selectedDateEvents = calendarEvents.filter(event => {
    if (!selectedDate) return false;
    const eventDate = new Date(event.event_date);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  const upcomingEvents = calendarEvents
    .filter(event => new Date(event.due_date) >= new Date() && event.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  const onSubmit = async (data: EventFormData) => {
    try {
      if (editingEvent) {
        await updateCalendarEvent.mutateAsync({ id: editingEvent.id, ...data });
      } else {
        await createCalendarEvent.mutateAsync(data);
      }
      setShowEventDialog(false);
      setEditingEvent(null);
      reset();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEditEvent = (event: TaxCalendarEvent) => {
    setEditingEvent(event);
    setValue('event_title', event.event_title);
    setValue('event_type', event.event_type);
    setValue('event_date', event.event_date);
    setValue('due_date', event.due_date);
    setValue('description', event.description || '');
    setValue('amount', event.amount);
    setValue('status', event.status);
    setShowEventDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading tax calendar...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Tax Calendar</h1>
            <p className="text-muted-foreground mt-2">
              Track important tax deadlines and payments
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => initializeDefaultCalendar.mutate()} variant="outline">
              Setup Default Calendar
            </Button>
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingEvent(null); reset(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Tax Event'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="event_title">Title</Label>
                    <Input {...register('event_title', { required: 'Title is required' })} />
                    {errors.event_title && <p className="text-sm text-red-500">{errors.event_title.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="event_type">Type</Label>
                    <Select value={watch('event_type')} onValueChange={(value) => setValue('event_type', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quarterly_payment">Quarterly Payment</SelectItem>
                        <SelectItem value="annual_filing">Annual Filing</SelectItem>
                        <SelectItem value="estimated_payment">Estimated Payment</SelectItem>
                        <SelectItem value="document_deadline">Document Deadline</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_date">Event Date</Label>
                      <Input type="date" {...register('event_date', { required: 'Event date is required' })} />
                    </div>
                    <div>
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input type="date" {...register('due_date', { required: 'Due date is required' })} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea {...register('description')} />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={watch('status')} onValueChange={(value) => setValue('status', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowEventDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingEvent ? 'Update' : 'Create'} Event
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                
                {/* Events for Selected Date */}
                <div className="flex-1 space-y-4">
                  <h3 className="font-semibold">
                    Events for {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
                  </h3>
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No events for this date</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDateEvents.map(event => (
                        <div key={event.id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{event.event_title}</h4>
                            {getStatusBadge(event.status)}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                          {event.amount > 0 && (
                            <p className="text-sm font-medium">{formatCurrency(event.amount)}</p>
                          )}
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditEvent(event)}>
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => deleteCalendarEvent.mutate(event.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>Next 5 pending events</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{event.event_title}</h4>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(event.due_date), 'MMM dd, yyyy')}
                      </p>
                      {event.amount > 0 && (
                        <p className="text-xs font-medium">{formatCurrency(event.amount)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
