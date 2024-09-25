import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Loading from './Loading';

// ABIs: Import your contract ABIs here
import DAO_ABI from '../abis/Token.json'

// Config: Import your network config here
import config from '../config.json';

function App() {
  
  const [dao, setDao] = useState(null)
  
  const [treasuryBalance, setTreasuryBalance] = useState(0)

  const [account, setAccount] = useState(null)

  const [proposal, proposals] = useState(null)

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // Initiate Contracts
    const dao = new ethers.Contract(config[31337].dao.address, DAO_ABI, provider)
    setDao(dao)

    // Fetch Treasury Balance
    let treasuryBalance = await provider.getBalance(dao.address)
    treasuryBalance = ethers.utils.formatUnits(treasuryBalance, 18)
    setTreasuryBalance(treasuryBalance)

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    // Fetch Proposals Count
    const count = await dao.proposalCount()
    const items = []

    for(var i = 0; i < count; i++){

      // Fetch Proposals
      const proposal = await dao.proposals(i + 1)
      items.push(proposal)
    }
    proposals(items)
    console.log(items)

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  return (
    <Container>
      <Navigation account={account} />

      <h1 className='my-4 text-center'>The DAO for the next generation!</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
        <hr/>
        <p className='text-center'><strong>Treasury Balance: </strong>{treasuryBalance} ETH</p>
        <hr/>
        </>
      )}
    </Container>
  )
}

export default App;
