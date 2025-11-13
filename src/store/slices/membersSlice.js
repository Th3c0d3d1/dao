import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ethers } from 'ethers'

// Mock data for demonstration - in a real app, this would come from the blockchain
const MOCK_CORPORATE_STRUCTURE = {
  executives: [
    {
      name: 'John Smith',
      position: 'CEO',
      address: '0x1234567890123456789012345678901234567890',
      balance: '400000',
      votingWeight: '40.0'
    }
  ],
  departmentHeads: [
    {
      name: 'Jane Doe',
      department: 'MARKETING',
      address: '0x2345678901234567890123456789012345678901',
      balance: '150000',
      votingWeight: '15.0'
    },
    {
      name: 'John Cena',
      department: 'RND',
      address: '0x3456789012345678901234567890123456789012',
      balance: '120000',
      votingWeight: '12.0'
    }
  ],
  employees: [
    {
      name:'Ben Franklin',
      department: 'MARKETING',
      address: '0x4567890123456789012345678901234567890123',
      balance: '50000',
      votingWeight: '5.0'
    },
    {
      name: 'Roger Goodell',
      department: 'MARKETING',
      address: '0x5678901234567890123456789012345678901234',
      balance: '45000',
      votingWeight: '4.5'
    },
    {
      name: 'Elon Musk',
      department: 'RND',
      address: '0x6789012345678901234567890123456789012345',
      balance: '60000',
      votingWeight: '6.0'
    },
    {
      name: 'Alice Johnson',
      department: 'HR',
      address: '0x7890123456789012345678901234567890123456',
      balance: '40000',
      votingWeight: '4.0'
    }
  ]
}

export const loadMembers = createAsyncThunk(
  'members/loadMembers',
  async ({ dao, token }, { rejectWithValue }) => {
    try {
      // Get all token holders from Transfer events
      const filter = token.filters.Transfer(null, null)
      const events = await token.queryFilter(filter, 0, 'latest')
      
      const uniqueAddresses = new Set()
      events.forEach(event => {
        if (event.args.to !== ethers.constants.AddressZero) {
          uniqueAddresses.add(event.args.to)
        }
      })

      // Get balances and voting weights for all holders
      const tokenHolders = []
      for (const address of uniqueAddresses) {
        try {
          const balance = await token.balanceOf(address)
          const formattedBalance = ethers.utils.formatEther(balance)
          
          if (parseFloat(formattedBalance) > 0) {
            // Calculate voting weight (simplified - in real app would use contract method)
            const totalSupply = await token.totalSupply()
            const votingWeight = (parseFloat(formattedBalance) / parseFloat(ethers.utils.formatEther(totalSupply)) * 100).toFixed(2)
            
            tokenHolders.push({
              address,
              balance: formattedBalance,
              votingWeight
            })
          }
        } catch (error) {
          console.error(`Error getting balance for ${address}:`, error)
        }
      }

      // Sort by balance descending
      tokenHolders.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance))

      // For demo purposes, merge with mock corporate structure
      // In a real app, this would be stored on-chain or in a database
      return {
        ...MOCK_CORPORATE_STRUCTURE,
        tokenHolders
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const assignRole = createAsyncThunk(
  'members/assignRole',
  async ({ dao, name, address, role, department }, { rejectWithValue }) => {
    try {
      // If DAO contract has role assignment functionality
      const tx = await dao.assignRole(name, address, role, department)
      await tx.wait()
      
      // Simulate the assignment
      // console.log(`Assigning ${role} to ${address}${department ? ` in ${department}` : ''}`)

      return { name, address, role, department }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const removeRole = createAsyncThunk(
  'members/removeRole',
  async ({ dao, address }, { rejectWithValue }) => {
    try {
      // In a real implementation, this would call a contract method
      return { address }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const membersSlice = createSlice({
  name: 'members',
  initialState: {
    executives: [],
    departmentHeads: [],
    employees: [],
    tokenHolders: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateMemberRole: (state, action) => {
      // Update member role in state
      // This would be more complex in a real implementation
    },
  },
  extraReducers: (builder) => {
    builder
      // Load members
      .addCase(loadMembers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadMembers.fulfilled, (state, action) => {
        state.loading = false
        state.executives = action.payload.executives || []
        state.departmentHeads = action.payload.departmentHeads || []
        state.employees = action.payload.employees || []
        state.tokenHolders = action.payload.tokenHolders || []
      })
      .addCase(loadMembers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Assign role
      .addCase(assignRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(assignRole.fulfilled, (state, action) => {
        const { address, name, role, department } = action.payload

        // Add member to appropriate section based on role
        if (['CEO', 'CFO', 'COO'].includes(role)) {
          if (!state.members.executives) state.members.executives = []
          state.members.executives.push({ address, name, position: role })
        } else if (role === 'Department Head') {
          if (!state.members.departmentHeads) state.members.departmentHeads = []
          state.members.departmentHeads.push({ address, name, department })
        }

        localStorage.setItem('daoMembers', JSON.stringify(state.members))
        state.loading = false
      })
      .addCase(assignRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Remove role
      .addCase(removeRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeRole.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(removeRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, updateMemberRole } = membersSlice.actions

export default membersSlice.reducer