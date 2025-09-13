import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password: string
  className?: string
}

interface ValidationResult {
  isValid: boolean
  message: string
  strength: 'weak' | 'medium' | 'strong'
}

export function validatePassword(password: string): ValidationResult {
  const validations = [
    { test: password.length >= 8, message: "At least 8 characters" },
    { test: /[A-Z]/.test(password), message: "One uppercase letter" },
    { test: /[a-z]/.test(password), message: "One lowercase letter" },
    { test: /[0-9]/.test(password), message: "One number" },
    { test: /[!@#$%^&*()_+\-=\[\]{};:,.<>?]/.test(password), message: "One special character" },
  ]

  const passedTests = validations.filter(v => v.test).length
  const failedValidations = validations.filter(v => !v.test)

  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (passedTests >= 4) strength = 'medium'
  if (passedTests === 5) strength = 'strong'

  return {
    isValid: passedTests === 5,
    message: failedValidations.length > 0 
      ? `Missing: ${failedValidations.map(v => v.message.toLowerCase()).join(', ')}`
      : "Password meets all requirements",
    strength
  }
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const validation = validatePassword(password)
  
  if (!password) return null

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'weak': return 'Weak'
      case 'medium': return 'Medium'
      case 'strong': return 'Strong'
      default: return ''
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              getStrengthColor(validation.strength)
            )}
            style={{ 
              width: validation.strength === 'weak' ? '33%' : 
                     validation.strength === 'medium' ? '66%' : '100%' 
            }}
          />
        </div>
        <span className={cn(
          "text-sm font-medium",
          validation.strength === 'weak' && "text-red-600",
          validation.strength === 'medium' && "text-yellow-600", 
          validation.strength === 'strong' && "text-green-600"
        )}>
          {getStrengthText(validation.strength)}
        </span>
      </div>
      <p className={cn(
        "text-xs",
        validation.isValid ? "text-green-600" : "text-red-600"
      )}>
        {validation.message}
      </p>
    </div>
  )
}