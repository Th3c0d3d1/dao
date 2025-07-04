import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ethers } from 'ethers'

// Async thunks
export const loadProposals = createAsyncThunk(
  'dao/loadProposals',
  async ({ dao }, { rejectWithValue }) => {
    try {
      const count = await dao.proposalCount()
      const proposals = []
      
      for (let i = 1; i <= count; i++) {
        const proposal = await dao.proposals(i)
        proposals.push({
          id: proposal.id.toString(),
          name: proposal.name,
          amount: ethers.utils.formatEther(proposal.amount),
          recipient: proposal.recipient,
          votes: proposal.votes.toString(),
          finalized: proposal.finalized
        })
      }
      
      return proposals
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createProposal = createAsyncThunk(
  'dao/createProposal',
  async ({ dao, name, amount, recipient }, { rejectWithValue }) => {
    try {
      const formattedAmount = ethers.utils.parseEther(amount.toString())
      const tx = await dao.createProposal(name, formattedAmount, recipient)
      await tx.wait()
      return { name, amount, recipient }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const voteOnProposal = createAsyncThunk(
  'dao/voteOnProposal',
  async ({ dao, proposalId, option, weight }, { rejectWithValue }) => {
    try {
      const tx = await dao.vote(proposalId, option, weight)
      await tx.wait()
      return { proposalId, option }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const finalizeProposal = createAsyncThunk(
  'dao/finalizeProposal',
  async ({ dao, proposalId }, { rejectWithValue }) => {
    try {
      const tx = await dao.finalizeProposal(proposalId)
      await tx.wait()
      return proposalId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const daoSlice = createSlice({
  name: 'dao',
  initialState: {
    provider: null,
    contract: null,
    account: null,
    treasuryBalance: '0',
    quorum: '0',
    proposals: [],
    votingStartTime: null,
    votingEndTime: null,
    wlVotingStartTime: null,
    isWhitelisted: false,
    loading: false,
    error: null,
  },
  reducers: {
    setProvider: (state, action) => {
      state.provider = action.payload
    },
    setContract: (state, action) => {
      state.contract = action.payload
    },
    setAccount: (state, action) => {
      state.account = action.payload
    },
    setTreasuryBalance: (state, action) => {
      state.treasuryBalance = action.payload
    },
    setQuorum: (state, action) => {
      state.quorum = action.payload
    },
    setVotingTimes: (state, action) => {
      state.votingStartTime = action.payload.votingStartTime
      state.votingEndTime = action.payload.votingEndTime
      state.wlVotingStartTime = action.payload.wlVotingStartTime
    },
    setWhitelistStatus: (state, action) => {
      state.isWhitelisted = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Load proposals
      .addCase(loadProposals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadProposals.fulfilled, (state, action) => {
        state.loading = false
        state.proposals = action.payload
      })
      .addCase(loadProposals.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create proposal
      .addCase(createProposal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProposal.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Vote on proposal
      .addCase(voteOnProposal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(voteOnProposal.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(voteOnProposal.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Finalize proposal
      .addCase(finalizeProposal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(finalizeProposal.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(finalizeProposal.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  setProvider,
  setContract,
  setAccount,
  setTreasuryBalance,
  setQuorum,
  setVotingTimes,
  setWhitelistStatus,
  clearError,
} = daoSlice.actions

export default daoSlice.reducer