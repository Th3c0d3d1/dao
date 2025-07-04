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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          </motion.button>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Treasury: </span>
              <span className="text-sm font-bold text-blue-600">{treasuryBalance} ETH</span>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Your Balance: </span>
              <span className="text-sm font-bold text-green-600">{parseFloat(balance).toFixed(2)} {symbol}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {theme === 'light' ? (
              <MoonIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <SunIcon className="w-5 h-5 text-gray-600" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <BellIcon className="w-5 h-5 text-gray-600" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </motion.button>

          {/* Account */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Connected</p>
              <p className="text-xs text-gray-500">
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