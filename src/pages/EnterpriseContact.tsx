import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Plasma from '@/components/3D/Plasma';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const enterpriseInquirySchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(200),
  contactName: z.string().trim().min(1, 'Your name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().max(50).optional(),
  companySize: z.string().min(1, 'Company size is required'),
  industry: z.string().trim().min(1, 'Industry is required').max(100),
  timeline: z.string().min(1, 'Timeline is required'),
  requirements: z.string().trim().min(10, 'Please provide at least 10 characters').max(5000),
  budget: z.string().optional()
});

export default function EnterpriseContact() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    companySize: '',
    industry: '',
    timeline: '',
    requirements: '',
    budget: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      const validatedData = enterpriseInquirySchema.parse(formData);

      // Save to database
      const { error } = await supabase
        .from('enterprise_inquiries')
        .insert({
          name: validatedData.contactName,
          email: validatedData.email,
          company: validatedData.companyName,
          message: JSON.stringify({
            phone: validatedData.phone,
            companySize: validatedData.companySize,
            industry: validatedData.industry,
            timeline: validatedData.timeline,
            requirements: validatedData.requirements,
            budget: validatedData.budget
          })
        });

      if (error) throw error;

      toast.success('Thank you! Our team will contact you shortly.');
      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Submission error:', error);
        toast.error('Failed to submit inquiry. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Plasma Background */}
      <div style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0 }}>
        <Plasma 
          color="#2563eb"
          speed={0.6}
          direction="forward"
          scale={1.1}
          opacity={0.3}
          mouseInteractive={true}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="max-w-3xl mx-auto bg-background/90 backdrop-blur-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-3xl">Enterprise Consultation</CardTitle>
            <CardDescription>
              Tell us about your needs and our team will create a custom solution for your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">Your Name *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size *</Label>
                  <Select value={formData.companySize} onValueChange={(value) => handleChange('companySize', value)} required>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501+">501+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Implementation Timeline *</Label>
                  <Select value={formData.timeline} onValueChange={(value) => handleChange('timeline', value)} required>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (within 1 month)</SelectItem>
                      <SelectItem value="1-3months">1-3 months</SelectItem>
                      <SelectItem value="3-6months">3-6 months</SelectItem>
                      <SelectItem value="6+months">6+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Estimated Budget Range</Label>
                  <Select value={formData.budget} onValueChange={(value) => handleChange('budget', value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-10k">Under $10,000</SelectItem>
                      <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                      <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                      <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                      <SelectItem value="100k+">$100,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Project Requirements & Goals *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleChange('requirements', e.target.value)}
                  required
                  rows={6}
                  placeholder="Tell us about your specific needs, goals, and any technical requirements..."
                  className="bg-background"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Enterprise Inquiry'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
