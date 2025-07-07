import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ethers } from 'ethers'

// Mock data for demonstration
const MOCK_EXCHANGE_RATES = [
  {
    symbol: 'NXG',
    pair: 'NXG/ETH',
    price: '0.001234',
    change24h: 5.67,
    volume24h: 125000
  },
  {
    symbol: 'NXG',
    pair: 'NXG/USDC',
    price: '2.45',
    change24h: -2.34,
    volume24h: 89000
  },
  {
    symbol: 'ETH',
    pair: 'ETH/USDC',
    price: '2456.78',
    change24h: 1.23,
    volume24h: 2500000
  }
]

const MOCK_TREASURY_ANALYTICS = {
  proposalImpact: -15.5,
  approvedImpact: -12.3,
  holderImpact: 8.7,
  totalProposalAmount: '125.5',
  approvedAmount: '98.2',
  holderVolume: '45.8',
  balanceHistory: [
    { date: '2024-01-01', balance: 100 },
    { date: '2024-02-01', balance: 125 },
    { date: '2024-03-01', balance: 110 },
    { date: '2024-04-01', balance: 95 },
    { date: '2024-05-01', balance: 120 },
    { date: '2024-06-01', balance: 105 },
  ]
}

const MOCK_TOKEN_METRICS = {
  avgPurchasePrice: 2.45,
  avgPurchaseQuantity: 1250,
  totalVolume: 450000,
  priceHistory: [
    { date: '2024-01-01', price: 2.10 },
    { date: '2024-02-01', price: 2.25 },
    { date: '2024-03-01', price: 2.40 },
    { date: '2024-04-01', price: 2.35 },
    { date: '2024-05-01', price: 2.50 },
    { date: '2024-06-01', price: 2.45 },
  ]
}

const MOCK_PROPOSAL_METRICS = {
  avgCost: '25.5',
  avgReturns: 12.5,
  successRate: 75.0,
  totalFunded: '325.8',
  performanceData: [
    { month: 'Jan', approved: 3, rejected: 1 },
    { month: 'Feb', approved: 2, rejected: 2 },
    { month: 'Mar', approved: 4, rejected: 1 },
    { month: 'Apr', approved: 1, rejected: 3 },
    { month: 'May', approved: 3, rejected: 0 },
    { month: 'Jun', approved: 2, rejected: 1 },
  ]
}

const MOCK_HOLDER_DISTRIBUTION = [
  { name: 'Whale Holders', percentage: 35, holders: 5, tokens: 350000, color: '#8b5cf6' },
  { name: 'Large Holders', percentage: 25, holders: 12, tokens: 250000, color: '#3b82f6' },
  { name: 'Medium Holders', percentage: 20, holders: 25, tokens: 200000, color: '#10b981' },
  { name: 'Small Holders', percentage: 15, holders: 45, tokens: 150000, color: '#f59e0b' },
  { name: 'Micro Holders', percentage: 5, holders: 113, tokens: 50000, color: '#6b7280' }
]

const MOCK_QUARTERLY_DATA = {
  'Q1 2024': {
    treasuryGrowth: 15.5,
    proposalCount: 8,
    tokenVolume: 125.5,
    avgTokenPrice: 2.25,
    holderGrowth: 12.3,
    successRate: 75.0
  },
  'Q2 2024': {
    treasuryGrowth: -5.2,
    proposalCount: 6,
    tokenVolume: 98.7,
    avgTokenPrice: 2.40,
    holderGrowth: 8.9,
    successRate: 66.7
  },
  'Q3 2024': {
    treasuryGrowth: 8.9,
    proposalCount: 10,
    tokenVolume: 156.3,
    avgTokenPrice: 2.35,
    holderGrowth: 15.6,
    successRate: 80.0
  },
  'Q4 2024': {
    treasuryGrowth: 12.1,
    proposalCount: 7,
    tokenVolume: 134.2,
    avgTokenPrice: 2.45,
    holderGrowth: 10.4,
    successRate: 71.4
  }
}

export const loadAnalyticsData = createAsyncThunk(
  'analytics/loadAnalyticsData',
  async ({ dao, token, provider }, { rejectWithValue }) => {
    try {
      // Get real data from blockchain
      const treasuryBalance = await provider.getBalance(dao.address)
      const proposalCount = await dao.proposalCount()
      const tokenTotalSupply = await token.totalSupply()

      // Calculate treasury analytics
      let totalProposalAmount = 0
      let approvedAmount = 0
      let approvedCount = 0

      for (let i = 1; i <= proposalCount; i++) {
        try {
          const proposal = await dao.proposals(i)
          const amount = parseFloat(ethers.utils.formatEther(proposal.amount))
          totalProposalAmount += amount
          
          if (proposal.finalized) {
            approvedAmount += amount
            approvedCount++
          }
        } catch (error) {
          console.warn(`Error fetching proposal ${i}:`, error)
        }
      }

      // Calculate impacts (simplified calculation)
      const currentBalance = parseFloat(ethers.utils.formatEther(treasuryBalance))
      const proposalImpact = currentBalance > 0 ? -(totalProposalAmount / currentBalance) * 100 : 0
      const approvedImpact = currentBalance > 0 ? -(approvedAmount / currentBalance) * 100 : 0

      // Get token holder data
      const holderDistribution = []
      try {
        const filter = token.filters.Transfer(null, null)
        const events = await token.queryFilter(filter, 0, 'latest')
        
        const uniqueHolders = new Set()
        events.forEach(event => {
          if (event.args.to !== ethers.constants.AddressZero) {
            uniqueHolders.add(event.args.to)
          }
        })

        // For demo, use mock distribution but with real holder count
        const realHolderCount = uniqueHolders.size
        holderDistribution.push(...MOCK_HOLDER_DISTRIBUTION.map(tier => ({
          ...tier,
          holders: Math.floor((tier.percentage / 100) * realHolderCount)
        })))
      } catch (error) {
        console.warn('Could not fetch holder data:', error)
        holderDistribution.push(...MOCK_HOLDER_DISTRIBUTION)
      }

      // Calculate token metrics
      const tokenMetrics = {
        ...MOCK_TOKEN_METRICS,
        totalSupply: parseFloat(ethers.utils.formatEther(tokenTotalSupply))
      }

      // Calculate proposal metrics
      const successRate = proposalCount > 0 ? (approvedCount / proposalCount) * 100 : 0
      const avgCost = proposalCount > 0 ? (totalProposalAmount / proposalCount).toFixed(2) : '0'

      const proposalMetrics = {
        ...MOCK_PROPOSAL_METRICS,
        avgCost,
        successRate: successRate.toFixed(1),
        totalFunded: approvedAmount.toFixed(2)
      }

      // Treasury analytics with real data
      const treasuryAnalytics = {
        ...MOCK_TREASURY_ANALYTICS,
        proposalImpact: proposalImpact.toFixed(2),
        approvedImpact: approvedImpact.toFixed(2),
        totalProposalAmount: totalProposalAmount.toFixed(2),
        approvedAmount: approvedAmount.toFixed(2)
      }

      return {
        treasuryAnalytics,
        exchangeRates: MOCK_EXCHANGE_RATES,
        tokenMetrics,
        proposalMetrics,
        holderDistribution,
        quarterlyData: MOCK_QUARTERLY_DATA
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateExchangeRates = createAsyncThunk(
  'analytics/updateExchangeRates',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would fetch from an API like CoinGecko
      // For now, simulate rate updates
      const updatedRates = MOCK_EXCHANGE_RATES.map(rate => ({
        ...rate,
        price: (parseFloat(rate.price) * (1 + (Math.random() - 0.5) * 0.1)).toFixed(6),
        change24h: (Math.random() - 0.5) * 20
      }))
      
      return updatedRates
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    treasuryAnalytics: MOCK_TREASURY_ANALYTICS,
    exchangeRates: MOCK_EXCHANGE_RATES,
    tokenMetrics: MOCK_TOKEN_METRICS,
    proposalMetrics: MOCK_PROPOSAL_METRICS,
    holderDistribution: MOCK_HOLDER_DISTRIBUTION,
    quarterlyData: MOCK_QUARTERLY_DATA,
    loading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedQuarter: (state, action) => {
      state.selectedQuarter = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Load analytics data
      .addCase(loadAnalyticsData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadAnalyticsData.fulfilled, (state, action) => {
        state.loading = false
        state.treasuryAnalytics = action.payload.treasuryAnalytics
        state.exchangeRates = action.payload.exchangeRates
        state.tokenMetrics = action.payload.tokenMetrics
        state.proposalMetrics = action.payload.proposalMetrics
        state.holderDistribution = action.payload.holderDistribution
        state.quarterlyData = action.payload.quarterlyData
        state.lastUpdated = Date.now()
      })
      .addCase(loadAnalyticsData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update exchange rates
      .addCase(updateExchangeRates.pending, (state) => {
        state.error = null
      })
      .addCase(updateExchangeRates.fulfilled, (state, action) => {
        state.exchangeRates = action.payload
        state.lastUpdated = Date.now()
      })
      .addCase(updateExchangeRates.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearError, setSelectedQuarter } = analyticsSlice.actions

export default analyticsSlice.reducer