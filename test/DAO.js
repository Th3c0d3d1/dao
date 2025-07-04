const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('DAO', () => {
    // declare vars
    let
        token,
        dao,
        accounts,

        // CEO
        deployer,

        // Proposal Creator
        funder,

        // HR Director/Staff
        admin,
        staff,

        // Marketing Director/Staff
        admin2,
        staff2,

        // Finance Director/Staff
        admin3,
        staff3,

        // Random Users
        publicHolder,
        user,
        user2,

        // Proposal Fund Recipient
        proposalRecipient

    beforeEach(async () => {

        // Setup accounts
        accounts = await ethers.getSigners()

        // CEO
        deployer = accounts[0]

        // Proposal Creator
        funder = accounts[1]

        // Token holders
        admin = accounts[2]
        admin2 = accounts[3]
        admin3 = accounts[4]
        staff = accounts[5]
        staff2 = accounts[6]
        staff3 = accounts[7]
        publicHolder = accounts[8]

        // Non-dao admin
        user = accounts[9]
        user2 = accounts[10]

        // Proposal Fund Recipient
        proposalRecipient = accounts[11]

        // Deploy Tokens
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Crypto Brosky Worldwide', 'CBW', '1200000')

        // Send tokens to investors
        transaction = await token.connect(deployer).transfer(deployer.address, tokens(140000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(funder.address, tokens(140000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(admin.address, tokens(140000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(admin2.address, tokens(140000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(admin3.address, tokens(140000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(staff.address, tokens(140000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(staff2.address, tokens(140000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(staff3.address, tokens(140000))
        await transaction.wait()

        transaction = await token.connect(deployer).transfer(publicHolder.address, tokens(80000))
        await transaction.wait()

        // Deploy DAO
        const Dao = await ethers.getContractFactory('DAO')

        // Set quorum
        // 500000000000000000000001 - represents quorum of 51% of token supply (500000 + 1 wei)
        dao = await Dao.deploy(token.address, '500000000000000000000001')

        // Funder sends eth to DAO treasury for governance
        await funder.sendTransaction({ to: dao.address, value: ether(100) })

        // Add deployer and Directors to the admin list
        await Promise.all([
            dao.add(deployer.address),
            dao.add(funder.address),
            dao.add(admin.address),
            dao.add(admin2.address),
            dao.add(admin3.address),
            dao.add(staff.address),
            dao.add(staff2.address),
            dao.add(staff3.address),
            dao.add(publicHolder.address)
        ]);

        // Simulate voting start timestamps
        await dao.connect(deployer).startVoting();
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

    describe('\nProposal Creation', () => {
        let transaction, result

        describe('Success', () => {
            beforeEach(async () => {

                // args from createProposal() in contract
                transaction = await dao.connect(funder).createProposal('Proposal 1', ether(100), proposalRecipient.address)
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
                expect(proposal.recipient).to.eq(proposalRecipient.address)

                // view struct in terminal
                // console.log(proposal)
            })

            it('emits a propose event', async () => {
                await expect(transaction).to.emit(dao, 'Propose')
                    .withArgs(1, ether(100), proposalRecipient.address, funder.address)
            })
        })

        describe('Failure', () => {
            it('rejects invalid amount', async () => {
                await expect(dao.connect(admin).createProposal('Proposal', ether(1000), proposalRecipient.address)).to.be.reverted
            })

            it('rejects a non-investor', async () => {
                await expect(dao.connect(user).createProposal('Proposal', ether(100), proposalRecipient.address)).to.be.reverted
            })
        })
    })

    describe('\nVoting', () => {
        let
            transaction,
            result,
            weight,
            weight2,
            weight3,
            weight4,
            ownershipTime

        beforeEach(async () => {

            // args from createProposal() in contract
            transaction = await dao.connect(funder).createProposal('Proposal 1', ether(100), proposalRecipient.address)
            result = await transaction.wait()
        })

        describe('Success', () => {
            beforeEach(async () => {

                // Perform vote function
                transaction = await dao.connect(admin).vote(1, 2, admin.address)
                result = await transaction.wait()
            })

            // Verify owner is on the whitelist
            it('verifies owners whitelist status', async () => {
                expect(await dao.isWhitelisted(deployer.address)).to.be.true
            })

            it('checks owners right to add/del user from whitelist ', async () => {

                // Owner can add wluser to whitelist
                await dao.add(user.address)
                expect(await dao.isWhitelisted(user.address)).to.be.true
                
                // Verify wluser is on the whitelist
                it('verifies wluser whitelist status', async () => {
                    expect(await dao.isWhitelisted(user.address)).to.be.true
                })

                // Owner can remove user from whitelist
                await dao.remove(user.address)
                expect(await dao.isWhitelisted(user.address)).to.be.false
            })

            // Check for proposal votes count iteration
            // Checking wluser balance
            it('updates vote count', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.votes).to.eq(tokens(140000))
            })

            it('emits an event', async () => {
                await expect(transaction).to.emit(dao, "Vote")
                    .withArgs(1, 2, admin.address)
            })
        })

        describe('Failure', () => {
            describe('Vote Start', async () => {

                // Simulate ownership start timestamps
                await dao.connect(deployer).startVoting();
            })

            it('rejects non-owner from adding/deleting whitelist users', async () => {
                // expect the dao contract to be reverted if a non-owner tries to add a user to the whitelist
                await expect(dao.connect(user).add(user2.address)).to.be.reverted
                await expect(dao.connect(user2).add(user.address)).to.be.reverted

                // expect the dao contract to be reverted if a non-owner tries to remove a user from the whitelist
                await expect(dao.connect(user).remove(admin.address)).to.be.reverted
                await expect(dao.connect(user2).remove(admin.address)).to.be.reverted
            })

            it('rejects non-wl investors from voting before time', async () => {
                await expect(dao.connect(user).vote(1, 1, user.address)).to.be.reverted
            })

            // Connect dao to user, submit 1 vote, revert as non-investor
            it('rejects a non-investor', async () => {
                await expect(dao.connect(user).vote(1, 1, user.address)).to.be.reverted
            })

            // Connect dao to staff, submit 1 vote, revert as double voter
            it('rejects double voting', async () => {
                transaction = await dao.connect(staff).vote(1, 1, staff.address)
                await transaction.wait()

                await expect(dao.connect(staff).vote(1, 1, staff.address)).to.be.reverted
            })
        })
    })

    describe('\nGovernance', () => {
        let transaction, result

        describe('Success', () => {
            beforeEach(async () => {

                // Create proposal
                transaction = await dao.connect(admin).createProposal('Proposal 1', ether(100), proposalRecipient.address)
                result = await transaction.wait()

                // Vote on Proposal
                transaction = await dao.connect(publicHolder).vote(1, 1, publicHolder.address)
                result = await transaction.wait()

                transaction = await dao.connect(admin).vote(1, 1, admin.address)
                result = await transaction.wait()

                transaction = await dao.connect(admin2).vote(1, 1, admin2.address)
                result = await transaction.wait()

                transaction = await dao.connect(admin3).vote(1, 2, admin3.address)
                result = await transaction.wait()

                transaction = await dao.connect(staff).vote(1, 1, staff.address)
                result = await transaction.wait()

                transaction = await dao.connect(staff2).vote(1, 1, staff2.address)
                result = await transaction.wait()

                transaction = await dao.connect(staff3).vote(1, 2, staff3.address)
                result = await transaction.wait()

                // Finalize proposal
                transaction = await dao.connect(admin).finalizeProposal(1)
                result = await transaction.wait()
            })

            it('transfers funds to recipient', async () => {
                expect(await ethers.provider.getBalance(proposalRecipient.address)).to.eq(tokens(10100))
            })
            // 
            it('updates the proposal to finalized', async () => {

                // read proposal out of mapping
                // returns a struct
                const proposal = await dao.proposals(1)
                expect(proposal.finalized).to.eq(true)
            })

            it('emits an event', async () => {
                await expect(transaction).to.emit(dao, "Finalize")
                    .withArgs(1)
            })
        })
        describe('Failure', () => {
            beforeEach(async () => {

                // Create proposal
                transaction = await dao.connect(admin2).createProposal('Proposal 1', ether(100), proposalRecipient.address)
                result = await transaction.wait()

                // Vote on Proposal
                transaction = await dao.connect(staff).vote(1, 1, staff.address)
                result = await transaction.wait()

                transaction = await dao.connect(staff2).vote(1, 1, staff2.address)
                result = await transaction.wait()
            })

            it('rejects finalization if not enough votes', async () => {
                await expect(dao.connect(admin2).finalizeProposal(1)).to.be.reverted
            })

            // Vote 3
            it('rejects proposal if already finalized', async () => {
                // Vote on Proposal
                transaction = await dao.connect(publicHolder).vote(1, 1, publicHolder.address)
                result = await transaction.wait()

                transaction = await dao.connect(admin).vote(1, 1, admin.address)
                result = await transaction.wait()

                transaction = await dao.connect(admin2).vote(1, 1, admin2.address)
                result = await transaction.wait()

                transaction = await dao.connect(admin3).vote(1, 2, admin3.address)
                result = await transaction.wait()

                transaction = await dao.connect(staff3).vote(1, 2, staff3.address)
                result = await transaction.wait()

                // Finalize proposal
                transaction = await dao.connect(admin2).finalizeProposal(1)
                result = await transaction.wait()

                // Try to finalize again
                await expect(dao.connect(admin2).finalizeProposal(1)).to.be.reverted
            })

            it('rejects finalization from a non user', async () => {
                transaction = await dao.connect(admin3).vote(1, 1, admin3.address)
                result = await transaction.wait()

                await expect(dao.connect(user).finalizeProposal(1)).to.be.reverted
            })
        })
    })
})
