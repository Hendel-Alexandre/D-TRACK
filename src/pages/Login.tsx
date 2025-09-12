import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import datatrackLogo from '@/assets/datatrack-logo.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

// Declare global grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      render: (element: string | Element, options: any) => number;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
    };
  }
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [captchaWidgetId, setCaptchaWidgetId] = useState<number | null>(null)
  const captchaRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Initialize reCAPTCHA when the component mounts
    const initRecaptcha = () => {
      if (window.grecaptcha && captchaRef.current) {
        const widgetId = window.grecaptcha.render(captchaRef.current, {
          sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Test site key
          theme: 'light'
        })
        setCaptchaWidgetId(widgetId)
      }
    }

    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha) {
      initRecaptcha()
    } else {
      // Wait for reCAPTCHA to load
      const checkRecaptcha = setInterval(() => {
        if (window.grecaptcha) {
          initRecaptcha()
          clearInterval(checkRecaptcha)
        }
      }, 100)

      return () => clearInterval(checkRecaptcha)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get captcha token
      const captchaToken = window.grecaptcha?.getResponse(captchaWidgetId || undefined)
      
      if (!captchaToken) {
        toast({
          title: "Error",
          description: "Please complete the captcha verification",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const { error } = await signIn(email, password, captchaToken)
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to sign in",
          variant: "destructive",
        })
        // Reset captcha on error
        if (captchaWidgetId !== null) {
          window.grecaptcha?.reset(captchaWidgetId)
        }
      } else {
        toast({
          title: "Success",
          description: "Successfully signed in!",
        })
        navigate('/dashboard')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      // Reset captcha on error
      if (captchaWidgetId !== null) {
        window.grecaptcha?.reset(captchaWidgetId)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-border bg-card">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-6">
              <img 
                src={datatrackLogo} 
                alt="DataTrack" 
                className="h-48 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  {t('email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  {t('password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input border-border text-foreground pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* reCAPTCHA */}
              <div className="flex justify-center">
                <div ref={captchaRef} className="captcha-container"></div>
              </div>

              <div className="flex items-center justify-between">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {t('forgotPassword')}?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : t('login')}
              </Button>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    {t('signup')}
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}