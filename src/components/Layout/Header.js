import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline'
import { toggleSidebar, toggleTheme } from '../../store/slices/uiSlice'

const Header = () => {
  const dispatch = useDispatch()
  const { account, treasuryBalance } = useSelector((state) => state.dao)
  const { balance, symbol } = useSelector((state) => state.token)
  const { theme, notifications } = useSelector((state) => state.ui)

  const unreadNotifications = notifications.filter(n => !n.read).length

  const handleThemeToggle = () => {
    dispatch(toggleTheme())
    
    // Apply theme to document root
    if (theme === 'light') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }
  return (
    <header className="bg-gray-100 dark:bg-gray-600 shadow-sm border-b border-gray-200 dark:border-gray-500 px-6 py-3 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </motion.button>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-white">Treasury: </span>
              <span className="text-sm font-bold text-blue-600">{treasuryBalance} ETH</span>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-white">Your Balance: </span>
              <span className="text-sm font-bold text-green-600">{parseFloat(balance).toFixed(2)} {symbol}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleThemeToggle}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            {theme === 'light' ? (
              <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <SunIcon className="w-5 h-5 text-yellow-500" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </motion.button>

          {/* Account */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Connected</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
              </p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {account ? account.slice(2, 4).toUpperCase() : 'NC'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header