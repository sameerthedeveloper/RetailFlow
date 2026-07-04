import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'

function PublicRoute({ children, tokenKey = 'token', redirectTo = '/home' }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem(tokenKey)

      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api';
        const endpoint = tokenKey === 'adminToken' ? '/auth/admin/currentuser' : '/auth/currentuser';
        await axios.get(`${baseUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem(tokenKey)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifySession()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-600">
        Loading...
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}

export default PublicRoute