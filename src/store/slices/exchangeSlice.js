import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Mock exchange rates and liquidity pools
const MOCK_EXCHANGE_RATES = {
  'NXG/ETH': 0.001,
  'NXG/USDC': 2.5,
  'ETH/USDC': 2500,
}

const MOCK_LIQUIDITY_POOLS = {
  'NXG/ETH': { reserve0: '1000000', reserve1: '1000' },
  'NXG/USDC': { reserve0: '1000000', reserve1: '2500000' },
  'ETH/USDC': { reserve0: '1000', reserve1: '2500000' },
}

export const calculateSwapAmount = createAsyncThunk(
  'exchange/calculateSwapAmount',
  async ({ fromToken, toToken, amount }, { rejectWithValue }) => {
    try {
      const pair = `${fromToken}/${toToken}`
      const reversePair = `${toToken}/${fromToken}`
      
      let rate = MOCK_EXCHANGE_RATES[pair]
      if (!rate) {
        rate = 1 / MOCK_EXCHANGE_RATES[reversePair]
      }
      
      const outputAmount = parseFloat(amount) * rate
      const slippage = 0.005 // 0.5% slippage
      const minOutput = outputAmount * (1 - slippage)
      
      return {
        inputAmount: amount,
        outputAmount: outputAmount.toFixed(6),
        minOutput: minOutput.toFixed(6),
        rate: rate.toFixed(6),
        slippage: (slippage * 100).toFixed(2)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const executeSwap = createAsyncThunk(
  'exchange/executeSwap',
  async ({ fromToken, toToken, amount, minOutput }, { rejectWithValue }) => {
    try {
      // Simulate swap execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return {
        fromToken,
        toToken,
        amount,
        minOutput,
        txHash: '0x' + Math.random().toString(16).substr(2, 64)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState: {
    fromToken: 'NXG',
    toToken: 'ETH',
    inputAmount: '',
    outputAmount: '',
    minOutput: '',
    rate: '',
    slippage: '0.50',
    liquidityPools: MOCK_LIQUIDITY_POOLS,
    recentTrades: [],
    loading: false,
    calculating: false,
    error: null,
  },
  reducers: {
    setFromToken: (state, action) => {
      state.fromToken = action.payload
    },
    setToToken: (state, action) => {
      state.toToken = action.payload
    },
    setInputAmount: (state, action) => {
      state.inputAmount = action.payload
    },
    setSlippage: (state, action) => {
      state.slippage = action.payload
    },
    swapTokens: (state) => {
      const temp = state.fromToken
      state.fromToken = state.toToken
      state.toToken = temp
      state.inputAmount = state.outputAmount
      state.outputAmount = ''
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Calculate swap amount
      .addCase(calculateSwapAmount.pending, (state) => {
        state.calculating = true
        state.error = null
      })
      .addCase(calculateSwapAmount.fulfilled, (state, action) => {
        state.calculating = false
        state.outputAmount = action.payload.outputAmount
        state.minOutput = action.payload.minOutput
        state.rate = action.payload.rate
      })
      .addCase(calculateSwapAmount.rejected, (state, action) => {
        state.calculating = false
        state.error = action.payload
      })
      // Execute swap
      .addCase(executeSwap.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(executeSwap.fulfilled, (state, action) => {
        state.loading = false
        state.recentTrades.unshift({
          ...action.payload,
          timestamp: Date.now(),
          id: Math.random().toString(36).substr(2, 9)
        })
        state.inputAmount = ''
        state.outputAmount = ''
      })
      .addCase(executeSwap.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  setFromToken,
  setToToken,
  setInputAmount,
  setSlippage,
  swapTokens,
  clearError,
} = exchangeSlice.actions

export default exchangeSlice.reducer