import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Briefcase, Zap, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type ModeType = 'student' | 'professional' | 'both' | null;
type PlanType = 'student' | 'professional' | 'combined' | null;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState<ModeType>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
  
  // Student form data
  const [schoolName, setSchoolName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  
  // Professional form data
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');

  const handleModeSelect = (mode: ModeType) => {
    setSelectedMode(mode);
    // Auto-select matching plan
    if (mode === 'student') setSelectedPlan('student');
    else if (mode === 'professional') setSelectedPlan('professional');
    else if (mode === 'both') setSelectedPlan('combined');
    
    setTimeout(() => setStep(2), 300);
  };

  const handlePlanConfirm = () => {
    setStep(3);
  };

  const handleComplete = async () => {
    if (!user || !selectedMode || !selectedPlan) return;

    try {
      // Create or update profiles based on selection
      if (selectedMode === 'student' || selectedMode === 'both') {
        await supabase
          .from('student_profiles' as any)
          .insert({
            user_id: user.id,
            school_name: schoolName,
            major,
            year,
          });
      }

      if (selectedMode === 'professional' || selectedMode === 'both') {
        await supabase
          .from('work_profiles' as any)
          .insert({
            user_id: user.id,
            company_name: companyName,
            job_title: jobTitle,
            department,
          });
      }

      // Update user_mode_settings
      const activeMode = selectedMode === 'both' ? 'work' : selectedMode;
      await supabase
        .from('user_mode_settings' as any)
        .upsert({
          user_id: user.id,
          active_mode: activeMode,
          student_mode_enabled: selectedMode === 'student' || selectedMode === 'both',
          work_mode_enabled: selectedMode === 'professional' || selectedMode === 'both',
          onboarding_completed: true,
          plan_type: 'trial',
        });

      // Save onboarding profile
      await supabase
        .from('onboarding_profiles' as any)
        .insert({
          user_id: user.id,
          selected_mode: selectedMode,
          selected_plan: selectedPlan,
        });

      toast.success('Welcome aboard! Your 30-day trial has started 🎉');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Welcome!</h1>
                <p className="text-lg text-muted-foreground">
                  Let's set up your account to match how you'll use the platform.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <ModeCard
                  icon={<GraduationCap className="h-12 w-12" />}
                  title="Student"
                  description="Manage classes, assignments, and academic life"
                  onClick={() => handleModeSelect('student')}
                />
                <ModeCard
                  icon={<Briefcase className="h-12 w-12" />}
                  title="Professional"
                  description="Track projects, tasks, and work productivity"
                  onClick={() => handleModeSelect('professional')}
                />
                <ModeCard
                  icon={<Zap className="h-12 w-12" />}
                  title="Both"
                  description="Full access to student and professional tools"
                  onClick={() => handleModeSelect('both')}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Choose Your Plan</h2>
                <p className="text-muted-foreground">
                  All plans include a 30-day free trial with full access. You can upgrade or switch anytime.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {selectedPlan === 'student' && (
                  <PlanCard
                    title="Student Plan"
                    price="$9.99"
                    features={[
                      'Class scheduling',
                      'Assignment tracking',
                      'File storage',
                      'Study analytics',
                    ]}
                    highlighted
                  />
                )}
                {selectedPlan === 'professional' && (
                  <PlanCard
                    title="Professional Plan"
                    price="$14.99"
                    features={[
                      'Project management',
                      'Task tracking',
                      'Time tracking',
                      'Analytics & reports',
                    ]}
                    highlighted
                  />
                )}
                {selectedPlan === 'combined' && (
                  <PlanCard
                    title="Combined Plan"
                    price="$19.99"
                    features={[
                      'All student features',
                      'All professional features',
                      'Seamless mode switching',
                      'Priority support',
                    ]}
                    highlighted
                  />
                )}
              </div>

              <div className="flex justify-center">
                <Button onClick={handlePlanConfirm} size="lg">
                  Start 30-Day Trial
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Tell Us About Yourself</h2>
                <p className="text-muted-foreground">
                  Help us personalize your experience
                </p>
              </div>

              <Card className="p-6 space-y-6">
                {(selectedMode === 'student' || selectedMode === 'both') && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Student Information
                    </h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="schoolName">School Name</Label>
                        <Input
                          id="schoolName"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          placeholder="Enter your school name"
                        />
                      </div>
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
                    </div>
                  </div>
                )}

                {(selectedMode === 'professional' || selectedMode === 'both') && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Professional Information
                    </h3>
                    <div className="grid gap-4">
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
                    </div>
                  </div>
                )}

                <Button onClick={handleComplete} className="w-full" size="lg">
                  Complete Setup
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ModeCard({ icon, title, description, onClick }: any) {
  return (
    <Card
      className="p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-lg group"
      onClick={onClick}
    >
      <div className="space-y-4 text-center">
        <div className="mx-auto w-fit p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}

function PlanCard({ title, price, features, highlighted }: any) {
  return (
    <Card className={`p-6 ${highlighted ? 'border-primary shadow-lg' : ''}`}>
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">{title}</h3>
          <div className="text-3xl font-bold text-primary">
            {price}
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-muted-foreground">After 30-day trial</p>
        </div>
        <ul className="space-y-2">
          {features.map((feature: string, index: number) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}