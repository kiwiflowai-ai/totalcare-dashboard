import { useState, FormEvent } from 'react'
import { Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface LoginProps {
  onLogin: (password: string) => Promise<boolean>
}

export const Login = ({ onLogin }: LoginProps) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!password) {
      setError('Please enter the password')
      return
    }

    setIsLoading(true)
    
    // Small delay to prevent brute force
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const isValid = await onLogin(password)
    
    if (isValid) {
      toast.success('Login successful!')
      setPassword('')
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
            <Lock className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            HVAC Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter password to access the dashboard
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 transition-colors"
              placeholder="Enter dashboard password"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Verifying...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

