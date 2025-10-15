import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Zap, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SchoolAutocomplete } from '@/components/Onboarding/SchoolAutocomplete';

type ModeType = 'student' | 'professional' | 'both' | null;

export default function OnboardingNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState<ModeType>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Student form data
  const [schoolName, setSchoolName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  
  // Professional form data
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');

  const totalSteps = selectedMode === 'both' ? 3 : 2;
  const progressPercentage = (step / totalSteps) * 100;

  const handleModeSelect = (mode: ModeType) => {
    setSelectedMode(mode);
    setStep(2);
  };

  const handleComplete = async () => {
    if (!user || !selectedMode) return;

    // Validate required fields
    if (selectedMode === 'student' || selectedMode === 'both') {
      if (!schoolName || !major || !year) {
        toast.error('Please fill in all student information fields');
        return;
      }
    }

    if (selectedMode === 'professional' || selectedMode === 'both') {
      if (!companyName || !jobTitle || !department) {
        toast.error('Please fill in all professional information fields');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Create or update profiles based on selection
      if (selectedMode === 'student' || selectedMode === 'both') {
        const { error: studentError } = await supabase
          .from('student_profiles' as any)
          .upsert({
            user_id: user.id,
            school_name: schoolName,
            major,
            year,
          }, {
            onConflict: 'user_id'
          });
        
        if (studentError) throw studentError;
      }

      if (selectedMode === 'professional' || selectedMode === 'both') {
        const { error: workError } = await supabase
          .from('work_profiles' as any)
          .upsert({
            user_id: user.id,
            company_name: companyName,
            job_title: jobTitle,
            department,
          }, {
            onConflict: 'user_id'
          });
        
        if (workError) throw workError;
      }

      // Check if user_mode_settings already exists
      const { data: existingSettings, error: fetchSettingsError } = await supabase
        .from('user_mode_settings' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchSettingsError && fetchSettingsError.code !== 'PGRST116') {
        throw fetchSettingsError;
      }

      // Update user_mode_settings
      const activeMode = selectedMode === 'both' ? 'work' : selectedMode === 'student' ? 'student' : 'work';
      
      if (existingSettings) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_mode_settings' as any)
          .update({
            active_mode: activeMode,
            student_mode_enabled: selectedMode === 'student' || selectedMode === 'both',
            work_mode_enabled: selectedMode === 'professional' || selectedMode === 'both',
            onboarding_completed: true,
            plan_type: 'trial',
          })
          .eq('user_id', user.id);
        
        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('user_mode_settings' as any)
          .insert({
            user_id: user.id,
            active_mode: activeMode,
            student_mode_enabled: selectedMode === 'student' || selectedMode === 'both',
            work_mode_enabled: selectedMode === 'professional' || selectedMode === 'both',
            onboarding_completed: true,
            plan_type: 'trial',
            trial_start_date: new Date().toISOString(),
            trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        
        if (insertError) throw insertError;
      }

      // Save onboarding profile only if not already present
      const { data: existingOnboarding, error: fetchOnboardingError } = await supabase
        .from('onboarding_profiles' as any)
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchOnboardingError && fetchOnboardingError.code !== 'PGRST116') {
        throw fetchOnboardingError;
      }

      if (!existingOnboarding) {
        const { error: profileError } = await supabase
          .from('onboarding_profiles' as any)
          .insert({
            user_id: user.id,
            selected_mode: selectedMode,
            selected_plan: selectedMode === 'student' ? 'student' : selectedMode === 'professional' ? 'professional' : 'combined',
          });
        if (profileError) throw profileError;
      }

      toast.success('Welcome aboard! Your 30-day trial has started 🎉');
      
      // Small delay to ensure database sync before redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Setup Progress</span>
            </div>
            <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-24">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Welcome to D-TRACK!</h1>
              <p className="text-lg text-muted-foreground">Choose your primary focus</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
                onClick={() => handleModeSelect('student')}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <GraduationCap className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>Student</CardTitle>
                  <CardDescription>Manage classes, assignments, and academic life</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Class scheduling</li>
                    <li>• Assignment tracking</li>
                    <li>• Study analytics</li>
                  </ul>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
                onClick={() => handleModeSelect('professional')}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle>Professional</CardTitle>
                  <CardDescription>Track projects, tasks, and work productivity</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Project management</li>
                    <li>• Time tracking</li>
                    <li>• Team collaboration</li>
                  </ul>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
                onClick={() => handleModeSelect('both')}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-gradient-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Both</CardTitle>
                  <CardDescription>Full access to student and professional tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• All student features</li>
                    <li>• All professional features</li>
                    <li>• Seamless switching</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {step === 2 && (selectedMode === 'student' || selectedMode === 'both') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>Student Information</CardTitle>
                    <CardDescription>Tell us about your academic journey</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <SchoolAutocomplete 
                  onSchoolChange={setSchoolName}
                  defaultSchool={schoolName}
                />

                <div className="space-y-2">
                  <Label htmlFor="major">Program / Field of Study</Label>
                  <Input
                    id="major"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year / Semester</Label>
                  <Input
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g., 3rd Year, Fall 2025"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => selectedMode === 'both' ? setStep(3) : handleComplete()} 
                    className="flex-1"
                    disabled={isLoading || !schoolName || !major || !year}
                  >
                    {selectedMode === 'both' ? 'Next: Professional Info' : isLoading ? 'Setting up...' : 'Complete Setup'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && selectedMode === 'professional' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle>Professional Information</CardTitle>
                    <CardDescription>Tell us about your work</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Position / Role</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Industry / Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., Technology"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleComplete} 
                    className="flex-1"
                    disabled={isLoading || !companyName || !jobTitle || !department}
                  >
                    {isLoading ? 'Setting up...' : 'Complete Setup'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && selectedMode === 'both' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle>Professional Information</CardTitle>
                    <CardDescription>Tell us about your work</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Position / Role</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Industry / Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., Technology"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleComplete} 
                    className="flex-1"
                    disabled={isLoading || !companyName || !jobTitle || !department}
                  >
                    {isLoading ? 'Setting up...' : 'Complete Setup'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
