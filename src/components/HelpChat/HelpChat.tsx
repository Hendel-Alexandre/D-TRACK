import { useState } from 'react'
import { MessageCircle, X, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const faqData = [
  {
    question: "howToLogTime",
    answer: "To log your time, go to the Timesheets page, click 'Add Entry', fill in the date, category, task description, and hours worked. Click Save to record your entry.",
    relatedPage: "/timesheets"
  },
  {
    question: "howToCreateTask",
    answer: "Navigate to the Tasks page and click the '+' button to create a new task. You can drag tasks between To Do, In Progress, and Done columns.",
    relatedPage: "/tasks"
  },
  {
    question: "howToViewReports",
    answer: "Go to the Reports page to view your time tracking analytics, including weekly hours, category breakdowns, and monthly trends. You can export data to CSV.",
    relatedPage: "/reports"
  }
]

export function HelpChat() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-corporate"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-40 w-80 sm:w-96"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className="shadow-corporate border-border bg-card/95 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  {t('help')} & {t('faq')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {faqData.map((item, index) => (
                      <motion.div
                        key={index}
                        className="p-4 bg-muted hover:bg-muted/80 transition-colors cursor-pointer group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                            {t(item.question)}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.answer}
                          </p>
                          {item.relatedPage && (
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <ExternalLink className="h-3 w-3" />
                              <span>Go to page</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}