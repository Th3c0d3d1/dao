const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('DAO', () => {
    // save token, dao, investors, etc
    let 
        token,
        dao,
        accounts,
        deployer,
        funder,
        investor1,
        investor2,
        investor3,
        investor4,
        investor5,
        recipient,
        user

    beforeEach(async () => {
        // Setup accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]

        // Proposal Creator
        funder = accounts[1]

        // Token holders
        investor1 = accounts[2]
        investor2 = accounts[3]
        investor3 = accounts[4]
        investor4 = accounts[5]
        investor5 = accounts[6]
        recipient = accounts[7]

        // Non-dao member
        user = accounts[8]

        // Deploy Tokens
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Next Gen', 'NXG', '1000000')

        // Send tokens to investors
        // 200000 = 20% each investor (5 investors)
        transaction = await token.connect(deployer).transfer(investor1.address, tokens(200000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(investor2.address, tokens(200000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(investor3.address, tokens(200000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(investor4.address, tokens(200000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(investor5.address, tokens(200000))
        await transaction.wait()

        // Deploy DAO
        const Dao = await ethers.getContractFactory('DAO')

        // Set quorum
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

    describe('Proposal Creation', () => {
        let transaction, result

        describe('Success', () => {
            beforeEach(async () => {
                // args from createProposal() in contract
                transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
                result = await transaction.wait()
            })
            // Check for contract ID count iteration
            it('updates proposal count', async () => {
                expect(await dao.proposalCount()).to.eq(1)
            })

            it('updates proposal mapping', async () => {
                // retrieve specific proposal by passing proposal id
                // returns Proposal struct
                const proposal = await dao.proposals(1)

                // expected struct args
                expect(proposal.id).to.eq(1)
                expect(proposal.amount).to.eq(ether(100))
                expect(proposal.recipient).to.eq(recipient.address)

                // view struct in terminal
                // console.log(proposal)
            })

            it('emits a propose event', async () => {
                await expect(transaction).to.emit(dao, 'Propose')
                .withArgs(1, ether(100), recipient.address, investor1.address)
            })
        })

        describe('Failure', () => {
            it('rejects invalid amount', async () => {
                await expect(dao.connect(investor1).createProposal('Proposal', ether(1000), recipient.address)).to.be.reverted
            })

            it('rejects a non-investor', async () => {
                await expect(dao.connect(user).createProposal('Proposal', ether(100), recipient.address)).to.be.reverted
            })
        })
    })

    describe('Voting', () => {
        let transaction, result

        beforeEach(async () => {
            // args from createProposal() in contract
            transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
            result = await transaction.wait()
        })

        describe('Success', () => {
            beforeEach(async () => {
                // Perform vote function
                transaction = await dao.connect(investor1).vote(1)
                result = await transaction.wait()
            })
            // Check for proposal votes count iteration
            // Checking investor1 balance
            it('updates vote count', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.votes).to.eq(tokens(200000))
            })

            it('emits an event', async () => {
                await expect(transaction).to.emit(dao, "Vote")
                .withArgs(1, investor1.address)
            })

            // it('updates proposal mapping', async () => {
            //     // retrieve specific proposal by passing proposal id
            //     // returns Proposal struct
            //     const proposal = await dao.proposals(1)

            //     // expected struct args
            //     expect(proposal.id).to.eq(1)
            //     expect(proposal.amount).to.eq(ether(100))
            //     expect(proposal.recipient).to.eq(recipient.address)

            //     // view struct in terminal
            //     // console.log(proposal)
            // })

            // it('emits a propose event', async () => {
            //     await expect(transaction).to.emit(dao, 'Propose')
            //     .withArgs(1, ether(100), recipient.address, investor1.address)
            // })
        })

        describe('Failure', () => {
            // Connect dao to user, submit 1 vote, revert as non-investor
            it('rejects a non-investor', async () => {
                await expect(dao.connect(user).vote(1)).to.be.reverted
            })

            //
            it('rejects double voting', async () => {
                transaction = await dao.connect(investor1).vote(1)
                await transaction.wait()

                await expect(dao.connect(investor1).vote(1)).to.be.reverted
            })
        })
    })
})
