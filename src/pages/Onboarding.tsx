import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Briefcase, Zap, Check, Moon, Sun, X, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { SchoolAutocomplete } from '@/components/Onboarding/SchoolAutocomplete';
import { Progress } from '@/components/ui/progress';

type ModeType = 'student' | 'professional' | 'both' | null;
type PlanType = 'student' | 'professional' | 'combined' | null;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState<ModeType>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
  const [subStep, setSubStep] = useState(1); // For "Both" mode
  const [isLoading, setIsLoading] = useState(false);
  
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

      // Update user_mode_settings
      const activeMode = selectedMode === 'both' ? 'work' : selectedMode;
      const { error: settingsError } = await supabase
        .from('user_mode_settings' as any)
        .upsert({
          user_id: user.id,
          active_mode: activeMode,
          student_mode_enabled: selectedMode === 'student' || selectedMode === 'both',
          work_mode_enabled: selectedMode === 'professional' || selectedMode === 'both',
          onboarding_completed: true,
          plan_type: 'trial',
        }, {
          onConflict: 'user_id'
        });

      if (settingsError) throw settingsError;

      // Save onboarding profile only if not already present (avoid UPDATE on table without updated_at)
      const { data: existingOnboarding, error: fetchOnboardingError } = await supabase
        .from('onboarding_profiles' as any)
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchOnboardingError) throw fetchOnboardingError;

      if (!existingOnboarding) {
        const { error: profileError } = await supabase
          .from('onboarding_profiles' as any)
          .insert({
            user_id: user.id,
            selected_mode: selectedMode,
            selected_plan: selectedPlan,
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

  const totalSteps = selectedMode === 'both' ? 2 : 1;
  const progressPercentage = selectedMode === 'both' ? (subStep / totalSteps) * 100 : 100;

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4 relative">
      {/* Top right controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg hover:bg-accent/50"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="h-9 w-9 rounded-lg hover:bg-accent/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

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
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-block"
                >
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-2" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold text-gradient">Welcome!</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Let's get to know you a bit. This helps us tailor your dashboard to your goals.
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
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-gradient">Choose Your Plan</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
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
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-gradient">Welcome! Let's get to know you a bit.</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  This helps us tailor your dashboard to your goals.
                </p>
              </div>

              {/* Progress indicator for "Both" mode */}
              {selectedMode === 'both' && (
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Step {subStep} of {totalSteps}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}

              {/* Student Information Card */}
              {(selectedMode === 'student' || (selectedMode === 'both' && subStep === 1)) && (
                <Card className="p-6 md:p-8 space-y-6 bg-gradient-card border-2 hover:shadow-premium transition-all duration-300">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Student Information</h3>
                        <p className="text-sm text-muted-foreground">For students and learners building their schedule</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
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
                        className="input-sleek"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year / Semester</Label>
                      <Input
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="e.g., 3rd Year, Fall 2025"
                        className="input-sleek"
                      />
                    </div>
                  </div>

                  {selectedMode === 'both' ? (
                    <Button 
                      onClick={() => setSubStep(2)} 
                      className="w-full button-premium" 
                      size="lg"
                      disabled={!schoolName || !major || !year}
                    >
                      Next: Professional Info
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleComplete} 
                      className="w-full button-premium" 
                      size="lg"
                      disabled={isLoading || !schoolName || !major || !year}
                    >
                      {isLoading ? 'Setting up your dashboard...' : 'Complete Setup'}
                    </Button>
                  )}
                </Card>
              )}

              {/* Professional Information Card */}
              {(selectedMode === 'professional' || (selectedMode === 'both' && subStep === 2)) && (
                <Card className="p-6 md:p-8 space-y-6 bg-gradient-card border-2 hover:shadow-premium transition-all duration-300">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Professional Information</h3>
                        <p className="text-sm text-muted-foreground">For professionals and teams tracking their work</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Enter your company name"
                        className="input-sleek"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Position / Role</Label>
                      <Input
                        id="jobTitle"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g., Software Engineer"
                        className="input-sleek"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Industry / Department</Label>
                      <Input
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g., Technology"
                        className="input-sleek"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {selectedMode === 'both' && (
                      <Button 
                        onClick={() => setSubStep(1)} 
                        variant="outline"
                        className="flex-1" 
                        size="lg"
                      >
                        Back
                      </Button>
                    )}
                    <Button 
                      onClick={handleComplete} 
                      className="flex-1 button-premium" 
                      size="lg"
                      disabled={isLoading || !companyName || !jobTitle || !department}
                    >
                      {isLoading ? 'Setting up your dashboard...' : 'Complete Setup'}
                    </Button>
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ModeCard({ icon, title, description, onClick }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="p-8 cursor-pointer transition-all hover:shadow-premium group bg-gradient-card border-2 hover:border-primary/50"
        onClick={onClick}
      >
        <div className="space-y-4 text-center">
          <motion.div 
            className="mx-auto w-fit p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-gradient-primary group-hover:text-white transition-all duration-300"
            whileHover={{ rotate: 5 }}
          >
            {icon}
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function PlanCard({ title, price, features, highlighted }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-8 ${highlighted ? 'border-2 border-primary shadow-premium bg-gradient-card' : 'bg-card'} hover:shadow-lg transition-all duration-300`}>
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold">{title}</h3>
            <div className="text-4xl font-bold text-gradient">
              {price}
              <span className="text-sm text-muted-foreground font-normal">/month</span>
            </div>
            <p className="text-sm text-muted-foreground">After 30-day trial</p>
          </div>
          <ul className="space-y-3">
            {features.map((feature: string, index: number) => (
              <li key={index} className="flex items-center gap-3">
                <div className="p-1 rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </motion.div>
  );
}