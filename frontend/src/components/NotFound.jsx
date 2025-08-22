import React from 'react'
import { useNavigate } from 'react-router-dom'
function NotFound() {
    const navigate = useNavigate()
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">404 | Page Not Found</h2>
      <button onClick={()=>navigate('/')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Go to Home
      </button>
    </div>
  )
}
export default NotFound
