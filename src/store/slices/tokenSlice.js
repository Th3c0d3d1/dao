import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ethers } from 'ethers'

// Async thunks
export const loadTokenData = createAsyncThunk(
  'token/loadTokenData',
  async ({ token, account }, { rejectWithValue }) => {
    try {
      const [name, symbol, totalSupply, balance, decimals] = await Promise.all([
        token.name(),
        token.symbol(),
        token.totalSupply(),
        token.balanceOf(account),
        token.decimals()
      ])

      return {
        name,
        symbol,
        totalSupply: ethers.utils.formatEther(totalSupply),
        balance: ethers.utils.formatEther(balance),
        decimals: decimals.toString()
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const transferTokens = createAsyncThunk(
  'token/transferTokens',
  async ({ token, to, amount }, { rejectWithValue }) => {
    try {
      const formattedAmount = ethers.utils.parseEther(amount.toString())
      const tx = await token.transfer(to, formattedAmount)
      await tx.wait()
      return { to, amount }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const tokenSlice = createSlice({
  name: 'token',
  initialState: {
    contract: null,
    name: '',
    symbol: '',
    totalSupply: '0',
    balance: '0',
    decimals: '18',
    ownershipStart: null,
    loading: false,
    error: null,
  },
  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload
    },
    setOwnershipStart: (state, action) => {
      state.ownershipStart = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Load token data
      .addCase(loadTokenData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadTokenData.fulfilled, (state, action) => {
        state.loading = false
        state.name = action.payload.name
        state.symbol = action.payload.symbol
        state.totalSupply = action.payload.totalSupply
        state.balance = action.payload.balance
        state.decimals = action.payload.decimals
      })
      .addCase(loadTokenData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Transfer tokens
      .addCase(transferTokens.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(transferTokens.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(transferTokens.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setContract, setOwnershipStart, clearError } = tokenSlice.actions

export default tokenSlice.reducer