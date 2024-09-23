const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('DAO', () => {
    // save token and dao
    let token, dao, accounts, deployer, funder

    beforeEach(async () => {
        // Setup accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        funder = accounts[1]

        // Deploy Tokens
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Next Gen', 'NXG', '1000000')

        // Deploy DAO
        const Dao = await ethers.getContractFactory('DAO')
        // 500000000000000000000001 - represents quorum of 51% of token supply (500000 + 1 wei)
        dao = await Dao.deploy(token.address, '500000000000000000000001')

        // Funder sends eth to DAO treasury for governance
        await funder.sendTransaction({to: dao.address, value: ether(100)})
    })

    describe('Deployment', () => {
        it('sends ether to the DAO treasury', async () => {
            expect(await ethers.provider.getBalance(dao.address)).to.eq(ether(100))
        })

        it('returns token address', async () => {
            expect(await dao.token()).to.eq(token.address)
        })

        it('returns a quorum', async () => {
            expect(await dao.quorum()).to.eq('500000000000000000000001')
        })
    })
})
