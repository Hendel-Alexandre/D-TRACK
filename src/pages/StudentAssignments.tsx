import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, differenceInHours, isPast } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  type: 'assignment' | 'exam' | 'project' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string;
  reminder_enabled: boolean;
  reminder_hours_before: number;
  created_at: string;
}

export default function StudentAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'assignment' | 'exam' | 'project' | 'other'>('assignment');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');

  useEffect(() => {
    if (user) {
      loadAssignments();
    }
  }, [user]);

  const loadAssignments = async () => {
    const { data, error } = await supabase
      .from('student_assignments')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error loading assignments:', error);
      toast.error('Failed to load assignments');
    } else {
      setAssignments(data || []);
    }
    setLoading(false);
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const dueDateTime = `${dueDate}T${dueTime}:00`;

    const { error } = await supabase
      .from('student_assignments')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        type,
        status: 'pending',
        due_date: dueDateTime,
        reminder_enabled: true,
        reminder_hours_before: 24,
      });

    if (error) {
      console.error('Error adding assignment:', error);
      toast.error('Failed to add assignment');
    } else {
      toast.success('Assignment added successfully!');
      setDialogOpen(false);
      resetForm();
      loadAssignments();
    }
  };

  const updateStatus = async (id: string, status: Assignment['status']) => {
    const { error } = await supabase
      .from('student_assignments')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      loadAssignments();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('assignment');
    setDueDate('');
    setDueTime('23:59');
  };

  const getUrgencyColor = (dueDate: string, status: Assignment['status']) => {
    if (status === 'completed' || status === 'cancelled') return 'default';
    
    const hoursUntilDue = differenceInHours(new Date(dueDate), new Date());
    
    if (isPast(new Date(dueDate))) return 'destructive';
    if (hoursUntilDue <= 24) return 'destructive';
    if (hoursUntilDue <= 48) return 'secondary';
    return 'default';
  };

  const activeAssignments = assignments.filter(a => a.status === 'pending' || a.status === 'in_progress');
  const completedAssignments = assignments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  if (loading) {
    return <div className="p-6">Loading assignments...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignments & Exams</h1>
          <p className="text-muted-foreground">Track deadlines and manage your coursework</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Assignment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Midterm Exam"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Due Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Due Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Add Assignment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Active ({activeAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No active assignments
              </p>
            ) : (
              activeAssignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{assignment.title}</h4>
                      <Badge variant={getUrgencyColor(assignment.due_date, assignment.status)} className="mt-1">
                        {assignment.type}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateStatus(assignment.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4 text-success" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateStatus(assignment.id, 'cancelled')}
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {assignment.description && (
                    <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Due: {format(new Date(assignment.due_date), 'PPp')}
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Completed ({completedAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No completed assignments yet
              </p>
            ) : (
              completedAssignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold line-through text-muted-foreground">
                        {assignment.title}
                      </h4>
                      <Badge variant="outline" className="mt-1">
                        {assignment.type}
                      </Badge>
                    </div>
                    <Badge variant={assignment.status === 'completed' ? 'default' : 'destructive'}>
                      {assignment.status}
                    </Badge>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
