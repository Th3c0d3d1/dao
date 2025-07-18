import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline'
import { loadAnalyticsData } from '../../store/slices/analyticsSlice'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

const QUARTERS = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024']

const Analytics = () => {
  const dispatch = useDispatch()
  const { contract: dao, provider } = useSelector((state) => state.dao)
  const { contract: token } = useSelector((state) => state.token)
  const {
    treasuryAnalytics,
    exchangeRates,
    tokenMetrics,
    proposalMetrics,
    holderDistribution,
    quarterlyData,
    loading
  } = useSelector((state) => state.analytics)

  const [selectedQuarter, setSelectedQuarter] = useState('Q4 2024')
  const [activeMetric, setActiveMetric] = useState('treasury')

  useEffect(() => {
    if (dao && token && provider) {
      dispatch(loadAnalyticsData({ dao, token, provider }))
    }
  }, [dao, token, provider, dispatch])

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`
  }

  const formatTokens = (value) => {
    return value.toLocaleString()
  }

  const getPercentageColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getPercentageIcon = (value) => {
    return value >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
  }

  const renderTreasuryAnalytics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Treasury Change Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="light:bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Treasury Impact Analysis</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-100 rounded-lg">
            <div className="flex items-center">
              <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-700">Proposal Allocations</p>
                <p className="text-xs text-gray-600 dark:text-gray-600">Impact on treasury balance</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${getPercentageColor(treasuryAnalytics.proposalImpact)}`}>
                {formatPercentage(treasuryAnalytics.proposalImpact)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-600">{treasuryAnalytics.totalProposalAmount} ETH</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <ArrowUpIcon className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-700">Approved Proposals</p>
                <p className="text-xs text-gray-600 dark:text-gray-600">Successful funding outcomes</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${getPercentageColor(treasuryAnalytics.approvedImpact)}`}>
                {formatPercentage(treasuryAnalytics.approvedImpact)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-600">{treasuryAnalytics.approvedAmount} ETH</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <UserGroupIcon className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-700">Token Holder Activity</p>
                <p className="text-xs text-gray-600 dark:text-gray-600">Private transactions impact</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${getPercentageColor(treasuryAnalytics.holderImpact)}`}>
                {formatPercentage(treasuryAnalytics.holderImpact)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-600">{treasuryAnalytics.holderVolume} ETH</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Treasury Balance Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="light:bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Treasury Balance Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={treasuryAnalytics.balanceHistory} className="dark:text-gray-700">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#3b82f6"
              fill="url(#treasuryGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="treasuryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )

  const renderExchangeRates = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Live Exchange Rates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="light:bg-white dark:bg-gray-700 dark:text-gray-200 rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 dark:bg-gray-700 mb-4">Live Exchange Rates</h3>
        <div className="space-y-4">
          {exchangeRates.map((rate, index) => {
            const Icon = getPercentageIcon(rate.change24h)
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">{rate.symbol}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-500">{rate.pair}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-600">24h Volume: {formatCurrency(rate.volume24h)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-500">{rate.price}</p>
                  <div className="flex items-center">
                    <Icon className={`w-4 h-4 mr-1 ${getPercentageColor(rate.change24h)}`} />
                    <span className={`text-sm font-medium ${getPercentageColor(rate.change24h)}`}>
                      {formatPercentage(rate.change24h)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Token Purchase Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="light:bg-white dark:bg-gray-700 dark:text-gray-700 rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Token Purchase Analytics</h3>
        <div className="space-y-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-500">Average Purchase Price</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(tokenMetrics.avgPurchasePrice)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Per token</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-500">Average Purchase Quantity</p>
            <p className="text-2xl font-bold text-blue-600">{formatTokens(tokenMetrics.avgPurchaseQuantity)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Tokens per transaction</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-500">Total Volume</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(tokenMetrics.totalVolume)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">All time</p>
          </div>
        </div>
      </motion.div>

      {/* Price History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="light:bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Price History</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart className="dark:text-gray-700" data={tokenMetrics.priceHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
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
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )

  const renderProposalMetrics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Proposal Cost & Returns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="light:bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Proposal Analytics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-700">Average Cost</p>
            <p className="text-xl font-bold text-red-600">{proposalMetrics.avgCost} ETH</p>
            <p className="text-xs text-gray-500 dark:text-gray-700">Per proposal</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-700">Average Returns</p>
            <p className="text-xl font-bold text-green-600">{formatPercentage(proposalMetrics.avgReturns)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-700">ROI estimate</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-700">Success Rate</p>
            <p className="text-xl font-bold text-blue-600">{formatPercentage(proposalMetrics.successRate)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-700">Approval rate</p>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-700">Total Funded</p>
            <p className="text-xl font-bold text-yellow-600">{proposalMetrics.totalFunded} ETH</p>
            <p className="text-xs text-gray-500 dark:text-gray-700">All time</p>
          </div>
        </div>
      </motion.div>

      {/* Proposal Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="light:bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Proposal Performance</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={proposalMetrics.performanceData} className="dark:text-gray-700">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="approved" fill="#10b981" name="Approved" />
            <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )

  const renderHolderDistribution = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Token Holder Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="light:bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Token Holder Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={holderDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="percentage"
            >
              {holderDistribution.map((entry, index) => (
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
        <div className="grid grid-cols-2 gap-2 mt-4">
          {holderDistribution.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-300">{item.name}: {item.percentage}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Distribution Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="light:bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Distribution Breakdown</h3>
        <div className="space-y-4">
          {holderDistribution.map((tier, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-500 rounded-lg">
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: tier.color }}
                />
                <div>
                  <p className="text-sm font-medium light:text-gray-900 dark:text-gray-200">{tier.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{tier.holders} holders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-300">{tier.percentage}%</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{formatTokens(tier.tokens)} tokens</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )

  const renderQuarterlyData = () => (
    <div className="space-y-6">
      {/* Quarter Selection */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Quarterly Analysis</h3>
        <select
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {QUARTERS.map(quarter => (
            <option key={quarter} value={quarter}>{quarter}</option>
          ))}
        </select>
      </div>

      {/* Quarterly Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {quarterlyData[selectedQuarter] && Object.entries(quarterlyData[selectedQuarter]).map(([key, value], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="light:bg-white dark:bg-gray-700 rounded-lg p-3 lg:p-4 shadow-sm border border-gray-200 min-w-0"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-500 capitalize truncate">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-500 truncate">
                  {typeof value === 'number' ?
                    (key.includes('percentage') || key.includes('rate') ? formatPercentage(value) :
                      key.includes('cost') || key.includes('volume') ? `${value} ETH` :
                        formatTokens(value)) :
                    value
                  }
                </p>
              </div>
              <div className="p-1.5 lg:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quarterly Comparison Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="light:bg-white dark:bg-gray-700 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Quarterly Comparison</h3>
        <div className="w-full overflow-hidden">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(quarterlyData).map(([quarter, data]) => ({
              quarter,
              treasuryGrowth: data.treasuryGrowth || 0,
              proposalCount: data.proposalCount || 0,
              tokenVolume: data.tokenVolume || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="treasuryGrowth" fill="#3b82f6" name="Treasury Growth %" />
              <Bar dataKey="proposalCount" fill="#10b981" name="Proposals" />
              <Bar dataKey="tokenVolume" fill="#f59e0b" name="Token Volume" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Comprehensive insights and performance metrics</p>
        </div>

        {/* Metric Navigation */}
        <div className="overflow-x-auto">
          <div className="flex space-x-2 bg-gray-100 rounded-lg p-1 min-w-max">
          {[
            { id: 'treasury', label: 'Treasury', icon: CurrencyDollarIcon },
            { id: 'exchange', label: 'Exchange', icon: ArrowTrendingUpIcon },
            { id: 'proposals', label: 'Proposals', icon: DocumentTextIcon },
            { id: 'holders', label: 'Holders', icon: UserGroupIcon },
            { id: 'quarterly', label: 'Quarterly', icon: CalendarIcon }
          ].map(metric => (
            <button
              key={metric.id}
              onClick={() => setActiveMetric(metric.id)}
              className={`flex items-center px-3 py-2 light:bg-white dark:bg-gray-700 rounded-lg text-sm font-medium transition-colors ${activeMetric === metric.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 whitespace-nowrap'
                }`}
            >
              <metric.icon className="w-4 h-4 mr-2" />
              {metric.label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-4">Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Content based on active metric */}
          {activeMetric === 'treasury' && renderTreasuryAnalytics()}
          {activeMetric === 'exchange' && renderExchangeRates()}
          {activeMetric === 'proposals' && renderProposalMetrics()}
          {activeMetric === 'holders' && renderHolderDistribution()}
          {activeMetric === 'quarterly' && renderQuarterlyData()}
        </>
      )}
    </div>
  )
}

export default Analytics