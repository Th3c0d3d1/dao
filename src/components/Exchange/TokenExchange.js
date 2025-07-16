import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  ArrowsUpDownIcon,
  CogIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import {
  setFromToken,
  setToToken,
  setInputAmount,
  setSlippage,
  swapTokens,
  calculateSwapAmount,
  executeSwap,
} from '../../store/slices/exchangeSlice'

const AVAILABLE_TOKENS = [
  { symbol: 'NXG', name: 'Next Gen Token', icon: '🚀' },
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
  { symbol: 'USDC', name: 'USD Coin', icon: '💵' },
]

const TokenExchange = () => {
  const dispatch = useDispatch()
  const {
    fromToken,
    toToken,
    inputAmount,
    outputAmount,
    rate,
    slippage,
    loading,
    calculating,
    error,
    recentTrades
  } = useSelector((state) => state.exchange)
  
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (inputAmount && parseFloat(inputAmount) > 0) {
      const timer = setTimeout(() => {
        dispatch(calculateSwapAmount({ fromToken, toToken, amount: inputAmount }))
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [inputAmount, fromToken, toToken, dispatch])

  const handleSwap = () => {
    if (inputAmount && outputAmount) {
      dispatch(executeSwap({
        fromToken,
        toToken,
        amount: inputAmount,
        minOutput: outputAmount
      }))
    }
  }

  const handleTokenSwap = () => {
    dispatch(swapTokens())
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Token Exchange</h1>
        <p className="text-gray-600 dark:text-gray-200">Swap tokens instantly with low fees</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exchange Interface */}
        <div className="lg:col-span-2 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="light:bg-white dark:bg-gray-700 rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
          >
            {/* Settings Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Swap Tokens</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <CogIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Slippage Tolerance</span>
                  <div className="flex space-x-2">
                    {['0.10', '0.50', '1.00'].map((value) => (
                      <button
                        key={value}
                        onClick={() => dispatch(setSlippage(value))}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                          slippage === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* From Token */}
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-500 rounded-xl p-3 lg:p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">From</span>
                  <span className="text-xs lg:text-sm text-gray-300">Balance: 1,000.00</span>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => dispatch(setInputAmount(e.target.value))}
                    placeholder="0.0"
                    className="flex-1 text-lg lg:text-2xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-gray-200 placeholder-gray-400 min-w-0"
                  />
                  <select
                    value={fromToken}
                    onChange={(e) => dispatch(setFromToken(e.target.value))}
                    className="flex items-center space-x-2 px-2 lg:px-3 py-2 bg-white rounded-lg border border-gray-200 text-xs lg:text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors flex-shrink-0"
                  >
                    {AVAILABLE_TOKENS.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.icon} {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTokenSwap}
                  className="p-2 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                >
                  <ArrowsUpDownIcon className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* To Token */}
              <div className="bg-gray-50 dark:bg-gray-500 rounded-xl p-3 lg:p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">To</span>
                  <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-300">Balance: 0.00</span>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <input
                    type="text"
                    value={calculating ? 'Calculating...' : outputAmount}
                    readOnly
                    placeholder="0.0"
                    className="flex-1 text-lg lg:text-2xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-gray-500 placeholder-gray-400 min-w-0"
                  />
                  <select
                    value={toToken}
                    onChange={(e) => dispatch(setToToken(e.target.value))}
                    className="flex items-center space-x-2 px-2 lg:px-3 py-2 bg-white rounded-lg border border-gray-200 text-xs lg:text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors flex-shrink-0"
                  >
                    {AVAILABLE_TOKENS.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.icon} {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exchange Rate */}
              {rate && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs lg:text-sm text-gray-500 px-4 space-y-1 sm:space-y-0">
                  <div className="flex items-center">
                    <InformationCircleIcon className="w-4 h-4 mr-1" />
                    <span className="truncate">Rate: 1 {fromToken} = {rate} {toToken}</span>
                  </div>
                  <span className="truncate">Slippage: {slippage}%</span>
                </div>
              )}

              {/* Swap Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSwap}
                disabled={!inputAmount || !outputAmount || loading}
                className="w-full py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm lg:text-base"
              >
                {loading ? 'Swapping...' : 'Swap Tokens'}
              </motion.button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Trades */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="light:bg-white dark:bg-gray-700 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Recent Trades</h3>
            <div className="space-y-3">
              {recentTrades.length > 0 ? (
                recentTrades.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {trade.amount} {trade.fromToken} → {trade.toToken}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs text-green-600">Success</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-300 text-center py-4">No recent trades</p>
              )}
            </div>
          </motion.div>

          {/* Market Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="light:bg-white dark:bg-gray-700 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 min-w-0"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Market Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-200 truncate">24h Volume</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-300 flex-shrink-0 ml-2">$1.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-200 truncate">Total Liquidity</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-300 flex-shrink-0 ml-2">$5.8M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-200 truncate">Active Pairs</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-300 flex-shrink-0 ml-2">3</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default TokenExchange