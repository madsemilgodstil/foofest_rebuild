'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { updateUser } from '@/lib/supabaseUser'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn')
    const storedUser = localStorage.getItem('user')
    setIsLoggedIn(loggedInStatus === 'true')
    setUser(storedUser ? JSON.parse(storedUser) : null)
  }, [setIsLoggedIn, setUser])

  const login = userData => {
    setIsLoggedIn(true)
    setUser(userData)
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setIsLoggedIn(false)
    setUser(null)
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('user')
  }

  const updateProfile = async updates => {
    if (!user) {
      throw new Error('No user is currently logged in.')
    }

    try {
      const updatedUser = await updateUser(user.id, updates)
      const updatedUserData = { ...user, ...updatedUser[0] }
      setUser(updatedUserData)
      localStorage.setItem('user', JSON.stringify(updatedUserData))
    } catch (error) {
      console.error('Error updating profile in AuthContext:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
