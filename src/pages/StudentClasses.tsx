import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, BookOpen, Clock, MapPin, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentClass {
  id: string;
  name: string;
  instructor: string | null;
  location: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

export default function StudentClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    instructor: '',
    location: '',
    day_of_week: '1',
    start_time: '',
    end_time: '',
    color: COLORS[0],
  });

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  const fetchClasses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('student_classes' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } else {
      setClasses((data as any) || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('student_classes' as any).insert({
      user_id: user.id,
      name: formData.name,
      instructor: formData.instructor || null,
      location: formData.location || null,
      day_of_week: parseInt(formData.day_of_week),
      start_time: formData.start_time,
      end_time: formData.end_time,
      color: formData.color,
    } as any);

    if (error) {
      toast.error('Failed to add class');
      console.error(error);
    } else {
      toast.success('Class added successfully!');
      setDialogOpen(false);
      setFormData({
        name: '',
        instructor: '',
        location: '',
        day_of_week: '1',
        start_time: '',
        end_time: '',
        color: COLORS[0],
      });
      fetchClasses();
    }
  };

  const deleteClass = async (id: string) => {
    const { error } = await supabase
      .from('student_classes' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete class');
    } else {
      toast.success('Class deleted');
      fetchClasses();
    }
  };

  const groupedClasses = classes.reduce((acc, cls) => {
    const day = DAYS[cls.day_of_week];
    if (!acc[day]) acc[day] = [];
    acc[day].push(cls);
    return acc;
  }, {} as Record<string, StudentClass[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Class Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Manage your weekly class schedule
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Mathematics 101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor: e.target.value })
                  }
                  placeholder="e.g., Dr. Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Room 201"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="day_of_week">Day of Week *</Label>
                <Select
                  value={formData.day_of_week}
                  onValueChange={(value) =>
                    setFormData({ ...formData, day_of_week: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, index) => (
                      <SelectItem key={day} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-8 w-8 rounded-full border-2 ${
                        formData.color === color
                          ? 'border-foreground'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Class</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your class schedule by adding your first class
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {DAYS.map((day) => {
            const dayClasses = groupedClasses[day] || [];
            if (dayClasses.length === 0) return null;

            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle>{day}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dayClasses.map((cls, index) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                      style={{ borderLeftColor: cls.color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold text-lg">{cls.name}</h4>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {cls.start_time} - {cls.end_time}
                          </div>
                          {cls.instructor && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {cls.instructor}
                            </div>
                          )}
                          {cls.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {cls.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteClass(cls.id)}
                      >
                        Delete
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
