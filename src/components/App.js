import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ethers } from 'ethers'

// Redux
import { setProvider, setContract, setAccount, setTreasuryBalance, setQuorum } from '../store/slices/daoSlice'
import { setContract as setTokenContract, loadTokenData } from '../store/slices/tokenSlice'

// Components
import Sidebar from './Layout/Sidebar'
import Header from './Layout/Header'
import Dashboard from './Dashboard/Dashboard'
import ProposalsList from './Proposals/ProposalsList'
import TokenExchange from './Exchange/TokenExchange'
import Members from './Members/Members'
import Treasury from './Treasury/Treasury'
import Analytics from './Analytics/Analytics'

// ABIs and Config
import DAO_ABI from '../abis/Dao.json'
import TOKEN_ABI from '../abis/Token.json'
import config from '../config.json'

function App() {
  const dispatch = useDispatch()
  const { activeTab, sidebarOpen, theme } = useSelector((state) => state.ui)

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    const loadBlockchainData = async () => {
      try {
        // Initialize provider
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        dispatch(setProvider(web3Provider))

        // Initialize contracts
        const daoContract = new ethers.Contract(config[31337].dao.address, DAO_ABI, web3Provider)
        const tokenContract = new ethers.Contract(config[31337].token.address, TOKEN_ABI, web3Provider)
        
        dispatch(setContract(daoContract))
        dispatch(setTokenContract(tokenContract))

        // Get account
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = ethers.utils.getAddress(accounts[0])
        dispatch(setAccount(account))

        // Load DAO data
        const treasuryBalance = await web3Provider.getBalance(daoContract.address)
        dispatch(setTreasuryBalance(ethers.utils.formatEther(treasuryBalance)))

        const quorum = await daoContract.quorum()
        dispatch(setQuorum(ethers.utils.formatEther(quorum)))

        // Load token data
        dispatch(loadTokenData({ token: tokenContract, account }))

      } catch (error) {
        console.error('Error loading blockchain data:', error)
      }
    }

    if (window.ethereum) {
      loadBlockchainData()
    }
  }
  )

  // Apply theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [theme])
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'proposals':
        return <ProposalsList />
      case 'exchange':
        return <TokenExchange />
      case 'treasury':
        return <Treasury />
      case 'members':
        return <Members />
      case 'analytics':
        return <Analytics />
      case 'settings':
        return <div className="p-8 text-center text-gray-500">Settings panel coming soon...</div>
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-14'}`}>
        <Header />
        
        <main className="p-6">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  )
}

export default App