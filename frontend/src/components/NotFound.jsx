import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function NotFound() {
    const navigate = useNavigate()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 relative">
      {/* Top Left Button */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-1 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <ArrowLeft className="w-6 h-6" />
        <span>Home</span>
      </button>

      {/* Main Content */}
      <div className="max-w-2xl w-full text-center">
        {/* 404 Image */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/NotFound.svg" 
            alt="404 Not Found" 
            className="w-full max-w-md h-auto drop-shadow-2xl"
          />
        </div>
        
        {/* Error Message */}
        <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-100 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
      </div>
    </div>
  )
}

export default NotFound