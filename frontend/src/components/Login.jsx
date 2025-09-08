import React, {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { login as authLogin  } from '../features/authSlice'
import {Button, Input} from "./index.js"
import {useDispatch, useSelector} from "react-redux"
import AuthServices from "../services/auth";
import {useForm} from "react-hook-form"
import TestServices from "../services/resume"
import {setResume} from "../features/resumeSlice"

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    

    const login = async(data) => {
        setError("")
        setIsLoading(true)
        try {
            const session = await AuthServices.login(data)
            if (session) {
                const userData = await AuthServices.getCurrentUser()
                if(userData) dispatch(authLogin(userData));
                navigate("/")
                
                    const resume = await TestServices.get_resume()
                    if (resume) {
                        dispatch(setResume(resume));
                    } 
                
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8'>
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative w-full max-w-md">
                {/* Main login card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500">
                    {/* Header section */}
                    <div className="text-center mb-8">
                        <div className="mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-gray mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Welcome Back
                        </h2>
                        <p className="text-gray-600 font-medium">
                            Sign in to your account
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg animate-pulse">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Login form */}
                    <form onSubmit={handleSubmit(login)} className="space-y-6">
                        <div className="space-y-5">
                            <div className="group">
                                <Input
                                    label="Username / Email"
                                    placeholder="Enter your username or email"
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm group-hover:bg-white/70"
                                    {...register("username", {
                                        required: true,                
                                    })}
                                />
                            </div>
                            
                            <div className="group">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm group-hover:bg-white/70"
                                    {...register("password", {
                                        required: true,
                                    })}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Sign up link */}
                    <div className="mt-8 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 font-medium">Don't have an account?</span>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <Link
                                to="/signup"
                                className="inline-flex items-center px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 group"
                            >
                                Create new account
                                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer text */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login