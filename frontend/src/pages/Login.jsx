import React from 'react'
import { Login as LoginComponent } from '../components/index.js'


function Login() {
  return (
    <div className='py-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800'>
        <LoginComponent />
    </div>
  )
}

export default Login