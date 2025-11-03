import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AUTH_KEY = 'dashboard_authenticated'
const AUTH_EXPIRY_HOURS = 24 // Session expires after 24 hours

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true
  })

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem(AUTH_KEY)
        
        if (authData) {
          const { timestamp } = JSON.parse(authData)
          const now = Date.now()
          const expiryTime = AUTH_EXPIRY_HOURS * 60 * 60 * 1000
          
          // Check if session is still valid
          if (now - timestamp < expiryTime) {
            setAuthState({ isAuthenticated: true, isLoading: false })
            return
          } else {
            // Session expired, clear it
            localStorage.removeItem(AUTH_KEY)
          }
        }
        
        setAuthState({ isAuthenticated: false, isLoading: false })
      } catch (error) {
        console.error('Error checking auth:', error)
        localStorage.removeItem(AUTH_KEY)
        setAuthState({ isAuthenticated: false, isLoading: false })
      }
    }

    checkAuth()
  }, [])

  const login = async (password: string): Promise<boolean> => {
    try {
      // Fetch the password from Supabase
      const { data, error } = await supabase
        .from('dashboard_settings')
        .select('setting_value')
        .eq('setting_key', 'dashboard_password')
        .single()

      if (error) {
        console.error('Error fetching dashboard password:', error)
        return false
      }

      if (!data || !data.setting_value) {
        console.error('Dashboard password not found in database')
        return false
      }

      const expectedPassword = data.setting_value

      // Compare passwords
      if (password === expectedPassword) {
        const authData = {
          timestamp: Date.now()
        }
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData))
        setAuthState({ isAuthenticated: true, isLoading: false })
        return true
      }

      return false
    } catch (error) {
      console.error('Error during login:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem(AUTH_KEY)
    setAuthState({ isAuthenticated: false, isLoading: false })
  }

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout
  }
}

