import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../features/authSlice'
import { Menu, X } from 'lucide-react' // Added X for close button

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showMenu, setShowMenu] = useState(false)

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Upload Resume", path: "/upload_resume" },
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    dispatch(logout())
    navigate("/home", { replace: true })
  }

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <h1 
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          InterviewBot
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium hover:text-yellow-400 ${
                  isActive ? "text-yellow-400" : "text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          {authStatus ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Login
            </button>
          )}
        </nav>

        {/* Mobile Menu Icon */}
        <button 
          className="md:hidden"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {showMenu && (
        <div className="md:hidden bg-gray-800 px-6 py-4 space-y-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setShowMenu(false)} // close after clicking
              className={({ isActive }) =>
                `block text-sm font-medium hover:text-yellow-400 ${
                  isActive ? "text-yellow-400" : "text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          {authStatus ? (
            <button
              onClick={() => {
                handleLogout()
                setShowMenu(false)
              }}
              className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                navigate("/login")
                setShowMenu(false)
              }}
              className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Login
            </button>
          )}
        </div>
      )}
    </header>
  )
}

export default Header
