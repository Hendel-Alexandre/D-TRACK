import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProfileSetupDialogProps {
  mode: 'student' | 'work';
  open: boolean;
  onComplete: () => void;
}

export function ProfileSetupDialog({ mode, open, onComplete }: ProfileSetupDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Student fields
  const [schoolName, setSchoolName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');

  // Work fields
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const table = mode === 'student' ? 'student_profiles' : 'work_profiles';
    const data = mode === 'student'
      ? { user_id: user.id, school_name: schoolName, major, year }
      : { user_id: user.id, company_name: companyName, job_title: jobTitle, department };

    const { error } = await supabase
      .from(table)
      .insert(data);

    if (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    } else {
      toast.success(`${mode === 'student' ? 'Student' : 'Work'} profile created!`);
      onComplete();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Setup {mode === 'student' ? 'Student' : 'Work'} Profile
          </DialogTitle>
          <DialogDescription>
            Complete your profile to start using {mode} mode.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'student' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="school">School Name</Label>
                <Input
                  id="school"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="University of..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Freshman, Sophomore..."
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept">Department</Label>
                <Input
                  id="dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Engineering"
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Complete Setup'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
