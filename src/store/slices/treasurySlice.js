import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ethers } from 'ethers'

// Mock data for demonstration
const MOCK_CHART_DATA = [
  { date: '2024-01-01', balance: 50 },
  { date: '2024-01-15', balance: 75 },
  { date: '2024-02-01', balance: 100 },
  { date: '2024-02-15', balance: 85 },
  { date: '2024-03-01', balance: 120 },
  { date: '2024-03-15', balance: 95 },
]

const MOCK_TRANSACTIONS = [
  {
    type: 'DEPOSIT',
    address: '0x1234567890123456789012345678901234567890',
    amount: '50.0',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 7,
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
  },
  {
    type: 'PROPOSAL',
    address: '0x2345678901234567890123456789012345678901',
    amount: '25.0',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 5,
    hash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
    proposalId: '1'
  },
  {
    type: 'TOKEN_PURCHASE',
    address: '0x3456789012345678901234567890123456789012',
    amount: '10.0',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 3,
    hash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd'
  },
  {
    type: 'DEPOSIT',
    address: '0x4567890123456789012345678901234567890123',
    amount: '75.0',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
    hash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde'
  },
  {
    type: 'PROPOSAL',
    address: '0x5678901234567890123456789012345678901234',
    amount: '15.0',
    timestamp: Math.floor(Date.now() / 1000) - 86400,
    hash: '0xef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    proposalId: '2'
  }
]

export const loadTreasuryData = createAsyncThunk(
  'treasury/loadTreasuryData',
  async ({ dao, provider }, { rejectWithValue }) => {
    try {
      // Get current treasury balance
      const balance = await provider.getBalance(dao.address)
      const formattedBalance = ethers.utils.formatEther(balance)

      return {
        balance: formattedBalance,
        chartData: MOCK_CHART_DATA
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const loadTransactions = createAsyncThunk(
  'treasury/loadTransactions',
  async ({ dao, provider }, { rejectWithValue }) => {
    try {
      const transactions = []
      
      // Get deposit transactions (ETH sent to DAO)
      const latestBlock = await provider.getBlockNumber()
      const fromBlock = Math.max(0, latestBlock - 10000) // Last ~10k blocks
      
      // Query for incoming ETH transactions
      const filter = {
        address: dao.address,
        fromBlock,
        toBlock: 'latest'
      }
      
      try {
        const logs = await provider.getLogs(filter)
        
        // Process logs to extract transaction data
        for (const log of logs) {
          const tx = await provider.getTransaction(log.transactionHash)
          const receipt = await provider.getTransactionReceipt(log.transactionHash)
          const block = await provider.getBlock(receipt.blockNumber)
          
          if (tx.to === dao.address && tx.value.gt(0)) {
            transactions.push({
              type: 'DEPOSIT',
              address: tx.from,
              amount: ethers.utils.formatEther(tx.value),
              timestamp: block.timestamp,
              hash: tx.hash
            })
          }
        }
      } catch (error) {
        console.warn('Could not fetch transaction logs:', error)
      }

      // Get proposal-related transactions from events
      try {
        const proposeFilter = dao.filters.Propose()
        const proposeEvents = await dao.queryFilter(proposeFilter, fromBlock, 'latest')
        
        const finalizeFilter = dao.filters.Finalize()
        const finalizeEvents = await dao.queryFilter(finalizeFilter, fromBlock, 'latest')
        
        // Process finalized proposals as outgoing transactions
        for (const event of finalizeEvents) {
          const proposalId = event.args.id.toString()
          const proposal = await dao.proposals(proposalId)
          const tx = await provider.getTransaction(event.transactionHash)
          const block = await provider.getBlock(event.blockNumber)
          
          transactions.push({
            type: 'PROPOSAL',
            address: proposal.recipient,
            amount: ethers.utils.formatEther(proposal.amount),
            timestamp: block.timestamp,
            hash: event.transactionHash,
            proposalId
          })
        }
      } catch (error) {
        console.warn('Could not fetch proposal events:', error)
      }

      // If no real transactions found, use mock data for demonstration
      if (transactions.length === 0) {
        transactions.push(...MOCK_TRANSACTIONS)
      }

      // Sort by timestamp descending
      transactions.sort((a, b) => b.timestamp - a.timestamp)

      // Calculate totals
      const totalInflow = transactions
        .filter(tx => tx.type === 'DEPOSIT' || tx.type === 'TOKEN_PURCHASE')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
        .toFixed(4)

      const totalOutflow = transactions
        .filter(tx => tx.type === 'PROPOSAL')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
        .toFixed(4)

      // Create transaction summary for pie chart
      const transactionSummary = [
        {
          name: 'Deposits',
          value: transactions.filter(tx => tx.type === 'DEPOSIT').length,
          color: '#10B981'
        },
        {
          name: 'Proposals',
          value: transactions.filter(tx => tx.type === 'PROPOSAL').length,
          color: '#EF4444'
        },
        {
          name: 'Token Purchases',
          value: transactions.filter(tx => tx.type === 'TOKEN_PURCHASE').length,
          color: '#3B82F6'
        }
      ].filter(item => item.value > 0)

      return {
        transactions,
        totalInflow,
        totalOutflow,
        transactionSummary
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const treasurySlice = createSlice({
  name: 'treasury',
  initialState: {
    balance: '0',
    transactions: [],
    totalInflow: '0',
    totalOutflow: '0',
    chartData: [],
    transactionSummary: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Load treasury data
      .addCase(loadTreasuryData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadTreasuryData.fulfilled, (state, action) => {
        state.loading = false
        state.balance = action.payload.balance
        state.chartData = action.payload.chartData
      })
      .addCase(loadTreasuryData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Load transactions
      .addCase(loadTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload.transactions
        state.totalInflow = action.payload.totalInflow
        state.totalOutflow = action.payload.totalOutflow
        state.transactionSummary = action.payload.transactionSummary
      })
      .addCase(loadTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, addTransaction } = treasurySlice.actions

export default treasurySlice.reducer