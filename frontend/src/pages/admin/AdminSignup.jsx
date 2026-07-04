import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import loginBg from './assets/login.png'
import logo from './assets/logo.png'

function AdminSignup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'RetailFlow | Admin Registration'
    const token = localStorage.getItem('adminToken')
    if (token) {
      const fetchUser = async () => {
        try {
          const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api';
          await axios.get(`${baseUrl}/auth/admin/currentuser`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          navigate('/admin')
        } catch (error) {
          localStorage.removeItem('adminToken')
        }
      }
      fetchUser()
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api';
      const response = await axios.post(`${baseUrl}/auth/admin/signup`, formData)
      localStorage.setItem('adminToken', response.data.token)
      alert('Seller registration successful!')
      navigate('/admin')
    } catch (error) {
      setError(error.response?.data?.message || 'Error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center sm:justify-start bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Left Section */}
      <div className="w-full max-w-[420px] sm:max-w-[460px] flex flex-col justify-center items-start px-6 sm:px-12 py-10 m-4 sm:ml-10 md:ml-16 lg:ml-24 border border-gray-200 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md">
        <img src={logo} className="float-start h-12 mb-4" alt="RetailFlow" />
        
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Register Seller Account</h1>
          <p className="text-gray-500 text-sm mb-8">Create an account to start listing products</p>

          <form onSubmit={handleSignup}>
            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="Create password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm mb-4 font-semibold">{error}</p>}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 mb-6 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Registering...' : 'Register Seller'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-gray-600 text-sm">
            Already have a seller account? <Link to="/admin/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminSignup
