import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/external-client'
import { useAuth } from '@/contexts/AuthContext'

interface SmartTaskInputProps {
  onTaskCreated?: (task: any) => void
  className?: string
}

export function SmartTaskInput({ onTaskCreated, className = '' }: SmartTaskInputProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user) return

    setIsProcessing(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action: 'parse_natural_language',
          data: {
            text: input.trim(),
            userId: user.id
          }
        }
      })

      if (error) throw error

      if (data.success) {
        toast({
          title: 'Task Created!',
          description: data.message,
        })
        
        setInput('')
        onTaskCreated?.(data.task)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-effect rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-gradient-primary">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Smart Task Creation</h3>
          <p className="text-sm text-muted-foreground">
            Just describe what you need to do - I'll handle the details!
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 'Call client tomorrow at 3pm' or 'Finish report by Friday urgent'"
            className="pr-12 h-12 text-base input-sleek"
            disabled={isProcessing}
          />
          <AnimatePresence>
            {isProcessing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "Meeting with team tomorrow",
            "Review documents by Friday", 
            "Call client next week urgent",
            "Submit report end of day"
          ].map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7 hover:bg-primary hover:text-white transition-colors"
              onClick={() => setInput(suggestion)}
              disabled={isProcessing}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </form>
    </motion.div>
  )
}