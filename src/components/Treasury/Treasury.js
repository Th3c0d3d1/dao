import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import { loadTreasuryData, loadTransactions } from '../../store/slices/treasurySlice'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const TRANSACTION_TYPES = {
  DEPOSIT: { label: 'Deposit', color: 'green', icon: ArrowUpIcon },
  PROPOSAL: { label: 'Proposal Payout', color: 'red', icon: ArrowDownIcon },
  TOKEN_PURCHASE: { label: 'Token Purchase', color: 'blue', icon: ShoppingCartIcon },
  OTHER: { label: 'Other', color: 'gray', icon: CurrencyDollarIcon }
}

const Treasury = () => {
  const dispatch = useDispatch()
  const { contract: dao, provider } = useSelector((state) => state.dao)
  const { 
    balance, 
    transactions, 
    totalInflow, 
    totalOutflow, 
    loading,
    chartData,
    transactionSummary 
  } = useSelector((state) => state.treasury)
  
  const [timeFilter, setTimeFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsPerPage = 10

  useEffect(() => {
    if (dao && provider) {
      dispatch(loadTreasuryData({ dao, provider }))
      dispatch(loadTransactions({ dao, provider }))
    }
  }, [dao, provider, dispatch])

  const filteredTransactions = transactions.filter(tx => {
    const typeMatch = typeFilter === 'all' || tx.type === typeFilter
    const timeMatch = timeFilter === 'all' || isWithinTimeFilter(tx.timestamp, timeFilter)
    return typeMatch && timeMatch
  })

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  )

  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage)

  const isWithinTimeFilter = (timestamp, filter) => {
    const now = Date.now()
    const txTime = timestamp * 1000
    
    switch (filter) {
      case '24h':
        return now - txTime <= 24 * 60 * 60 * 1000
      case '7d':
        return now - txTime <= 7 * 24 * 60 * 60 * 1000
      case '30d':
        return now - txTime <= 30 * 24 * 60 * 60 * 1000
      default:
        return true
    }
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatAmount = (amount) => {
    return parseFloat(amount).toFixed(4)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type) => {
    const config = TRANSACTION_TYPES[type] || TRANSACTION_TYPES.OTHER
    const Icon = config.icon
    return <Icon className={`w-5 h-5 text-${config.color}-600`} />
  }

  const getTransactionColor = (type) => {
    return TRANSACTION_TYPES[type]?.color || 'gray'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Treasury Management</h1>
          <p className="text-gray-600 dark:text-gray-200 mt-1">Monitor treasury balance and transaction flows</p>
        </div>
        
        {/* Filters */}
        <div className="flex space-x-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="PROPOSAL">Proposals</option>
            <option value="TOKEN_PURCHASE">Token Purchases</option>
          </select>
        </div>
      </div>

      {/* Treasury Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-600 truncate">Current Balance</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-500 truncate">{balance} ETH</p>
              <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-500 mt-1 truncate">Treasury Holdings</p>
            </div>
            <div className="p-2 lg:p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex-shrink-0">
              <CurrencyDollarIcon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-600 truncate">Total Inflow</p>
              <p className="text-lg lg:text-2xl font-bold text-green-500 truncate">{totalInflow} ETH</p>
              <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-500 mt-1 truncate">All time deposits</p>
            </div>
            <div className="p-2 lg:p-3 bg-green-50 rounded-lg flex-shrink-0">
              <ArrowUpIcon className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-600 truncate">Total Outflow</p>
              <p className="text-lg lg:text-2xl font-bold text-red-500 truncate">{totalOutflow} ETH</p>
              <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-500 mt-1 truncate">All time payouts</p>
            </div>
            <div className="p-2 lg:p-3 bg-red-50 rounded-lg flex-shrink-0">
              <ArrowDownIcon className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-600 truncate">Net Flow</p>
              <p className={`text-lg lg:text-2xl font-bold truncate ${
                (parseFloat(totalInflow) - parseFloat(totalOutflow)) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(parseFloat(totalInflow) - parseFloat(totalOutflow)).toFixed(4)} ETH
              </p>
              <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-500 mt-1 truncate">Inflow - Outflow</p>
            </div>
            <div className="p-2 lg:p-3 bg-yellow-50 rounded-lg flex-shrink-0">
              <ChartBarIcon className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Treasury Balance Over Time */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-600 mb-4">Treasury Balance Over Time</h3>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
              />
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
                dataKey="balance" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Transaction Types Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-600 mb-4">Transaction Types</h3>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={transactionSummary}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {transactionSummary.map((entry, index) => (
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
            {transactionSummary.map((item) => (
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

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 min-w-0"
      >
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-600">Transaction History</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-500">
              <FunnelIcon className="w-4 h-4" />
              <span>{filteredTransactions.length} transactions</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-w-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Hash
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Loading transactions...</p>
                  </td>
                </tr>
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-${getTransactionColor(transaction.type)}-50 mr-3`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-500 truncate">
                            {TRANSACTION_TYPES[transaction.type]?.label || 'Unknown'}
                          </p>
                          {transaction.proposalId && (
                            <p className="text-xs text-gray-500 truncate">Proposal #{transaction.proposalId}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-500 truncate">
                        {formatAddress(transaction.address)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        transaction.type === 'DEPOSIT' || transaction.type === 'TOKEN_PURCHASE' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'DEPOSIT' || transaction.type === 'TOKEN_PURCHASE' ? '+' : '-'}
                        {formatAmount(transaction.amount)} ETH
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-500">
                      {formatDate(transaction.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`https://etherscan.io/tx/${transaction.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors truncate"
                      >
                        {formatAddress(transaction.hash)}
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-500">
                    No transactions found for the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 lg:px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                Showing {((currentPage - 1) * transactionsPerPage) + 1} to {Math.min(currentPage * transactionsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 lg:px-3 py-1 text-xs lg:text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-gray-500"
                >
                  Previous
                </button>
                <span className="px-2 lg:px-3 py-1 text-xs lg:text-sm text-gray-600 dark:text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 lg:px-3 py-1 text-xs lg:text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-gray-500"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Treasury