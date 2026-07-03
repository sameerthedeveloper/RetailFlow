import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import axios from 'axios'

function ProtectedRoute({ children, tokenKey = 'token', redirectTo = '/login' }) {
  const location = useLocation()
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
        await axios.get(`${baseUrl}/auth/currentuser`, {
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

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute