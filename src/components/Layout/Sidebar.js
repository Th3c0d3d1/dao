import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline'
import { setActiveTab } from '../../store/slices/uiSlice'

const navigation = [
  { name: 'Dashboard', icon: HomeIcon, id: 'dashboard' },
  { name: 'Proposals', icon: DocumentTextIcon, id: 'proposals' },
  { name: 'Treasury', icon: CurrencyDollarIcon, id: 'treasury' },
  { name: 'Members', icon: UserGroupIcon, id: 'members' },
  { name: 'Analytics', icon: ChartBarIcon, id: 'analytics' },
  { name: 'Exchange', icon: ArrowsRightLeftIcon, id: 'exchange' },
  { name: 'Settings', icon: CogIcon, id: 'settings' },
]

const Sidebar = () => {
  const dispatch = useDispatch()
  const { activeTab, sidebarOpen } = useSelector((state) => state.ui)

  const handleTabClick = (tabId) => {
    dispatch(setActiveTab(tabId))
  }

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: sidebarOpen ? 0 : -256 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-full w-64 bg-gray-50 dark:bg-gray-500 shadow-xl border-r border-gray-200 dark:border-gray-600 z-40 transition-colors duration-200"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-400">
          <div className="flex items-center">
            <div className="w-9 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NGW</span>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900 dark:text-gray-100">Next Gen Web</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </motion.button>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-500 rounded-full flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">U</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Connected</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">Wallet Active</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Sidebar