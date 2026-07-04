import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import signupBg from '../assets/signup.png'
import logo from  '../assets/logo.png'

const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api';

function Signup() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })
    const [error, setError] = useState('')

    useEffect(() => {
        document.title = 'RetailFlow | Create Account'
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prevData) => ({ ...prevData, [name]: value }))
        if (error) setError('')
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(`${baseUrl}/auth/signup`, formData)
            localStorage.setItem('token', response.data.token)
            navigate('/')
        } catch (error) {
            setError('Error creating account. Please try again.')
        }
    }


  return (
    <div
      className="flex min-h-screen items-center justify-center sm:justify-end bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${signupBg})` }}
    >
      {/* Right Section */}
      <div className="w-full max-w-[420px] sm:max-w-[460px] flex flex-col justify-center items-start px-6 sm:px-12 py-10 m-4 sm:mr-10 md:mr-16 lg:mr-24 border border-gray-300 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md">
                    <img src={logo} className='float-start' alt='RetailFlow'/>

                <div className="w-full max-w-sm">
                    
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
                    <p className="text-gray-500 text-sm mb-8">Sign up to get started</p>

                    {/* Form */}
                    <form onSubmit={handleSignup}>
                        {/* Name Input */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Email Input */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Email address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                placeholder="Create a password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Error Message */}
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        {/* Signup Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mb-6"
                        >
                            Sign Up
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-gray-600 text-sm">
                        Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
                    </p>
                </div>
            </div>

            {/* Right Section */}
            
        </div>
    )
}

export default Signup;