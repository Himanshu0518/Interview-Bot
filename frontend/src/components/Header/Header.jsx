import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../features/authSlice'
import { Menu, X } from 'lucide-react'
import {ModeToggle} from '../ToggleMode'

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showMenu, setShowMenu] = useState(false)

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Upload Resume", path: "/upload_resume" },
    { name: "Dashboard", path: "/dashboard" },
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    dispatch(logout())
    navigate("/home", { replace: true })
  }

  return (
    <header className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <h1 
            className="text-2xl font-bold cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            onClick={() => navigate("/")}
          >
            InterviewBot
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `relative text-sm font-medium transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                  isActive 
                    ? "text-blue-600 dark:text-blue-400 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:rounded-full" 
                    : "text-gray-700 dark:text-gray-300"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-300 dark:border-gray-600">
            <ModeToggle />
            {authStatus ? (
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Login
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center space-x-4">
          <ModeToggle />
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? (
              <X size={24} className="text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu size={24} className="text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {showMenu && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-6 py-4 space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  `block text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" 
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              {authStatus ? (
                <button
                  onClick={() => {
                    handleLogout()
                    setShowMenu(false)
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-md"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login")
                    setShowMenu(false)
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-md"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header