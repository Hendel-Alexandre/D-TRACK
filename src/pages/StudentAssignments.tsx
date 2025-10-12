import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Calendar, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  due_date: string;
  reminder_enabled: boolean;
  reminder_hours_before: number;
}

const ASSIGNMENT_TYPES = ['assignment', 'exam', 'project', 'event'];
const ASSIGNMENT_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];

export default function StudentAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'assignment',
    status: 'pending',
    due_date: '',
    reminder_enabled: true,
    reminder_hours_before: 24,
  });

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('student_assignments')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } else {
      setAssignments(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('student_assignments').insert({
      user_id: user.id,
      ...formData,
    });

    if (error) {
      toast.error('Failed to add assignment');
      console.error(error);
    } else {
      toast.success('Assignment added successfully!');
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        type: 'assignment',
        status: 'pending',
        due_date: '',
        reminder_enabled: true,
        reminder_hours_before: 24,
      });
      fetchAssignments();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('student_assignments')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      fetchAssignments();
    }
  };

  const getUrgencyColor = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDue < 0) return 'destructive';
    if (hoursUntilDue <= 48) return 'destructive';
    if (hoursUntilDue <= 168) return 'default';
    return 'secondary';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignments & Exams</h1>
          <p className="text-muted-foreground mt-1">
            Track your deadlines and important dates
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Assignment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Math Homework Ch. 5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  required
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_hours">Reminder (hours before)</Label>
                <Input
                  id="reminder_hours"
                  type="number"
                  min="1"
                  value={formData.reminder_hours_before}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reminder_hours_before: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Assignment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your assignments and exams to track deadlines
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Assignment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {assignment.title}
                          </h3>
                          {assignment.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {assignment.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getStatusVariant(assignment.status)}>
                            {assignment.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {assignment.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(assignment.due_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(assignment.due_date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <Badge variant={getUrgencyColor(assignment.due_date)}>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Due{' '}
                          {formatDistanceToNow(new Date(assignment.due_date), {
                            addSuffix: true,
                          })}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Select
                        value={assignment.status}
                        onValueChange={(value) =>
                          updateStatus(assignment.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNMENT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
