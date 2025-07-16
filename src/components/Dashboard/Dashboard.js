import React from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const mockTreasuryData = [
  { month: 'Jan', value: 85 },
  { month: 'Feb', value: 92 },
  { month: 'Mar', value: 88 },
  { month: 'Apr', value: 95 },
  { month: 'May', value: 100 },
  { month: 'Jun', value: 105 },
]

const mockVotingData = [
  { name: 'Approved', value: 65, color: '#10B981' },
  { name: 'Rejected', value: 25, color: '#EF4444' },
  { name: 'Pending', value: 10, color: '#F59E0B' },
]

const Dashboard = () => {
  const { treasuryBalance, proposals } = useSelector((state) => state.dao)
  const { balance, totalSupply } = useSelector((state) => state.token)

  const stats = [
    {
      name: 'Treasury Balance',
      value: `${treasuryBalance} ETH`,
      icon: CurrencyDollarIcon,
      change: '+12.5%',
      changeType: 'positive',
    },
    {
      name: 'Active Proposals',
      value: proposals.filter(p => !p.finalized).length,
      icon: DocumentTextIcon,
      change: '+3',
      changeType: 'positive',
    },
    {
      name: 'Total Members',
      value: '247',
      icon: UserGroupIcon,
      change: '+18',
      changeType: 'positive',
    },
    {
      name: 'Your Voting Power',
      value: `${((parseFloat(balance) / parseFloat(totalSupply)) * 100).toFixed(2)}%`,
      icon: ChartBarIcon,
      change: '+2.1%',
      changeType: 'positive',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2 text-white">Welcome to Next Gen DAO</h1>
        <p className="text-blue-100 text-lg">
          Shape the future of decentralized governance with your community
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 dark:bg-gray-700">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-1 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow min-w-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-200 truncate">{stat.name}</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-300 mt-1 truncate">{stat.value}</p>
                <p className={`text-xs sm:text-sm mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                } truncate`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex-shrink-0">
                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Treasury Growth */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-600 mb-4">Treasury Growth</h3>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockTreasuryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="url(#gradient)" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Proposal Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-600 mb-4">Proposal Status</h3>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockVotingData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {mockVotingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {mockVotingData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-600 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'New proposal created', user: '0x1234...5678', time: '2 hours ago' },
            { action: 'Proposal #3 finalized', user: '0x8765...4321', time: '4 hours ago' },
            { action: 'Member joined DAO', user: '0x9876...1234', time: '6 hours ago' },
            { action: 'Treasury deposit', user: '0x5432...8765', time: '8 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-500 truncate">{activity.action}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">by {activity.user}</p>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard