import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Chrome } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { PasswordStrength, validatePassword } from '@/components/ui/password-strength'

const signupSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z.string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
  department: z.enum(['Marketing', 'IT', 'Support', 'Finance', 'HR'], {
    errorMap: () => ({ message: 'Please select a valid department' })
  })
})

const departments = [
  { value: 'Marketing', label: 'marketing' },
  { value: 'IT', label: 'it' },
  { value: 'Support', label: 'support' },
  { value: 'Finance', label: 'finance' },
  { value: 'HR', label: 'hr' },
]

export default function Signup() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const validationResult = signupSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      department
    })

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      toast({
        title: "Invalid Input",
        description: firstError.message,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      toast({
        title: "Weak Password",
        description: passwordValidation.message,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const validated = validationResult.data
      const { error } = await signUp(
        validated.email, 
        validated.password, 
        validated.firstName, 
        validated.lastName, 
        validated.department
      )
      
      if (error) {
        // Provide specific error messages based on error type
        let errorMessage = "Unable to create account. Please try again."
        
        if (error.message?.includes("already registered") || error.message?.includes("User already registered")) {
          errorMessage = "This email is already registered. Please log in instead or use a different email."
        } else if (error.message?.includes("email")) {
          errorMessage = "Invalid email address. Please check and try again."
        } else if (error.message?.includes("password")) {
          errorMessage = "Password does not meet requirements. Please try a stronger password."
        } else if (error.message) {
          errorMessage = error.message
        }
        
        toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to verify your account.",
        })
        navigate('/login')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Purple Gradient */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 relative overflow-hidden items-center justify-center p-12"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-purple-500/90 to-pink-500/90" />
        <div className="relative z-10 text-white max-w-md space-y-8">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Chrome className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Get Started with Us</h1>
            <p className="text-white/90 text-lg">Complete these easy steps to register your account</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-purple-600 font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">Sign up your account</p>
                <p className="text-sm text-white/80">Fill in your details</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold">
                2
              </div>
              <div>
                <p className="font-semibold text-white/70">Set up your workspace</p>
                <p className="text-sm text-white/60">Customize your preferences</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold">
                3
              </div>
              <div>
                <p className="font-semibold text-white/70">Set up your profile</p>
                <p className="text-sm text-white/60">Add your information</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Signup Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-8 bg-gradient-dark overflow-y-auto"
      >
        <div className="w-full max-w-md space-y-6 my-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Sign Up Account</h2>
            <p className="text-muted-foreground">Enter your personal data to create your account</p>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 border-border/50 hover:bg-secondary/50">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-11 border-border/50 hover:bg-secondary/50">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Github
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm text-muted-foreground">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="eg. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-11 bg-secondary/50 border-border/50 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm text-muted-foreground">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="eg. Francisco"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-11 bg-secondary/50 border-border/50 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="eg. johnfrans@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-secondary/50 border-border/50 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm text-muted-foreground">Department</Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger className="h-11 bg-secondary/50 border-border/50 rounded-xl">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {t(dept.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 bg-secondary/50 border-border/50 rounded-xl pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <PasswordStrength password={password} />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            <Button
              type="submit" 
              className="w-full h-11 bg-gradient-primary hover:opacity-90 rounded-xl font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Log in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}