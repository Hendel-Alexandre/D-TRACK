import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, Plus, CheckSquare, Calendar, Users, Rocket, Heart, BookOpen, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  tasks: Array<{
    title: string
    description: string
    priority: 'Low' | 'Medium' | 'High' | 'Urgent'
    estimated_hours?: number
  }>
  tags: string[]
}

const templates: ProjectTemplate[] = [
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Complete marketing campaign from planning to execution',
    icon: Rocket,
    color: 'from-purple-500 to-pink-500',
    tags: ['Marketing', 'Campaign', 'Strategy'],
    tasks: [
      { title: 'Define campaign objectives', description: 'Set clear, measurable goals for the campaign', priority: 'High' },
      { title: 'Research target audience', description: 'Analyze demographics and preferences', priority: 'High' },
      { title: 'Create content calendar', description: 'Plan content schedule and themes', priority: 'Medium' },
      { title: 'Design marketing materials', description: 'Create visuals, ads, and promotional content', priority: 'Medium' },
      { title: 'Set up tracking analytics', description: 'Configure UTM parameters and conversion tracking', priority: 'Medium' },
      { title: 'Launch campaign', description: 'Execute campaign across all channels', priority: 'High' },
      { title: 'Monitor and optimize', description: 'Track performance and make adjustments', priority: 'Medium' },
      { title: 'Analyze results', description: 'Generate final performance report', priority: 'Low' }
    ]
  },
  {
    id: 'employee-onboarding',
    name: 'New Employee Onboarding',
    description: 'Comprehensive onboarding process for new team members',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    tags: ['HR', 'Onboarding', 'Team'],
    tasks: [
      { title: 'Prepare workspace and equipment', description: 'Set up desk, computer, and necessary tools', priority: 'High' },
      { title: 'Create system accounts', description: 'Set up email, software licenses, and access permissions', priority: 'High' },
      { title: 'Schedule welcome meeting', description: 'Arrange introduction with team and manager', priority: 'Medium' },
      { title: 'Prepare orientation materials', description: 'Compile handbook, policies, and training resources', priority: 'Medium' },
      { title: 'Assign onboarding buddy', description: 'Pair new employee with experienced team member', priority: 'Medium' },
      { title: 'First week check-in', description: 'Schedule feedback session and address questions', priority: 'Medium' },
      { title: '30-day review', description: 'Evaluate progress and provide feedback', priority: 'Low' },
      { title: '90-day evaluation', description: 'Comprehensive performance and culture fit assessment', priority: 'Low' }
    ]
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'End-to-end product launch from development to market release',
    icon: Rocket,
    color: 'from-green-500 to-emerald-500',
    tags: ['Product', 'Launch', 'Development'],
    tasks: [
      { title: 'Finalize product features', description: 'Complete feature development and testing', priority: 'High' },
      { title: 'Create launch strategy', description: 'Plan go-to-market approach and timeline', priority: 'High' },
      { title: 'Develop pricing strategy', description: 'Research market and set competitive pricing', priority: 'High' },
      { title: 'Create launch materials', description: 'Prepare press releases, marketing collateral', priority: 'Medium' },
      { title: 'Set up distribution channels', description: 'Configure sales platforms and partnerships', priority: 'Medium' },
      { title: 'Train sales team', description: 'Educate team on product features and benefits', priority: 'Medium' },
      { title: 'Execute soft launch', description: 'Limited release to test market response', priority: 'Medium' },
      { title: 'Full market launch', description: 'Complete product release with full marketing push', priority: 'High' },
      { title: 'Monitor launch metrics', description: 'Track sales, feedback, and market response', priority: 'Low' }
    ]
  },
  {
    id: 'content-creation',
    name: 'Content Creation Project',
    description: 'Structured approach to creating high-quality content',
    icon: BookOpen,
    color: 'from-orange-500 to-red-500',
    tags: ['Content', 'Writing', 'Creative'],
    tasks: [
      { title: 'Content strategy planning', description: 'Define topics, audience, and goals', priority: 'High' },
      { title: 'Keyword research', description: 'Identify target keywords and search intent', priority: 'Medium' },
      { title: 'Create content outline', description: 'Structure main points and flow', priority: 'Medium' },
      { title: 'Write first draft', description: 'Complete initial content creation', priority: 'High' },
      { title: 'Design visual elements', description: 'Create graphics, charts, or images', priority: 'Medium' },
      { title: 'Edit and proofread', description: 'Review for clarity, grammar, and accuracy', priority: 'Medium' },
      { title: 'SEO optimization', description: 'Optimize for search engines and readability', priority: 'Low' },
      { title: 'Publish and promote', description: 'Release content and share across channels', priority: 'Medium' }
    ]
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Complete event organization from concept to execution',
    icon: Calendar,
    color: 'from-pink-500 to-rose-500',
    tags: ['Events', 'Planning', 'Coordination'],
    tasks: [
      { title: 'Define event objectives', description: 'Set clear goals and success metrics', priority: 'High' },
      { title: 'Set budget and timeline', description: 'Establish financial limits and key dates', priority: 'High' },
      { title: 'Book venue and vendors', description: 'Secure location, catering, and services', priority: 'High' },
      { title: 'Create event marketing', description: 'Design invitations and promotional materials', priority: 'Medium' },
      { title: 'Manage registrations', description: 'Set up RSVP system and track attendees', priority: 'Medium' },
      { title: 'Coordinate logistics', description: 'Plan setup, schedule, and staff assignments', priority: 'Medium' },
      { title: 'Execute event', description: 'Manage event day operations', priority: 'High' },
      { title: 'Post-event follow-up', description: 'Send thank you notes and gather feedback', priority: 'Low' }
    ]
  },
  {
    id: 'website-redesign',
    name: 'Website Redesign',
    description: 'Complete website redesign and development project',
    icon: Folder,
    color: 'from-indigo-500 to-purple-500',
    tags: ['Web', 'Design', 'Development'],
    tasks: [
      { title: 'Audit current website', description: 'Analyze existing site performance and issues', priority: 'High' },
      { title: 'Define requirements', description: 'Gather stakeholder needs and technical specs', priority: 'High' },
      { title: 'Create wireframes', description: 'Design site structure and user flow', priority: 'High' },
      { title: 'Design mockups', description: 'Create visual designs and style guide', priority: 'Medium' },
      { title: 'Develop frontend', description: 'Code responsive user interface', priority: 'High' },
      { title: 'Implement backend', description: 'Set up server, database, and CMS', priority: 'Medium' },
      { title: 'Test and optimize', description: 'Perform usability and performance testing', priority: 'Medium' },
      { title: 'Launch and monitor', description: 'Deploy site and track performance metrics', priority: 'Medium' }
    ]
  }
]

interface ProjectTemplatesProps {
  onTemplateSelected?: (projectId: string) => void
}

export function ProjectTemplates({ onTemplateSelected }: ProjectTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)
  const [projectName, setProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setProjectName(template.name)
  }

  const createProjectFromTemplate = async () => {
    if (!selectedTemplate || !user || !projectName.trim()) return

    setIsCreating(true)
    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectName.trim(),
          description: selectedTemplate.description,
          status: 'Active'
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Create tasks
      const tasksToInsert = selectedTemplate.tasks.map(task => ({
        user_id: user.id,
        project_id: project.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: 'Todo'
      }))

      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToInsert)

      if (tasksError) throw tasksError

      toast({
        title: 'Project Created!',
        description: `"${projectName}" has been created with ${selectedTemplate.tasks.length} tasks.`
      })

      setSelectedTemplate(null)
      setProjectName('')
      onTemplateSelected?.(project.id)

    } catch (error: any) {
      console.error('Error creating project from template:', error)
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group bg-gradient-card"
              onClick={() => handleSelectTemplate(template)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${template.color} shadow-lg group-hover:scale-110 transition-transform`}>
                    <template.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.tasks.length} tasks
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedTemplate.color}`}>
                    <selectedTemplate.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle>{selectedTemplate.name}</DialogTitle>
                    <DialogDescription>{selectedTemplate.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Included Tasks ({selectedTemplate.tasks.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedTemplate.tasks.map((task, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{task.title}</h5>
                            <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              task.priority === 'Urgent' ? 'border-red-500 text-red-600' :
                              task.priority === 'High' ? 'border-orange-500 text-orange-600' :
                              task.priority === 'Medium' ? 'border-blue-500 text-blue-600' :
                              'border-gray-500 text-gray-600'
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={createProjectFromTemplate}
                    disabled={!projectName.trim() || isCreating}
                    className="flex-1"
                  >
                    {isCreating ? 'Creating...' : 'Create Project'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}