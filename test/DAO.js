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
        wluser,
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
        wluser = accounts[2]
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
        transaction = await token.connect(deployer).transfer(wluser.address, tokens(200000))
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
        await funder.sendTransaction({ to: dao.address, value: ether(100) })

        // Add deployer and wluser to the whitelist
        await Promise.all([
            dao.add(deployer.address),
            dao.add(wluser.address),
            dao.add(investor2.address),
            dao.add(investor3.address),
            dao.add(investor4.address)
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
                transaction = await dao.connect(wluser).createProposal('Proposal 1', ether(100), recipient.address)
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
                    .withArgs(1, ether(100), recipient.address, wluser.address)
            })
        })

        describe('Failure', () => {
            it('rejects invalid amount', async () => {
                await expect(dao.connect(wluser).createProposal('Proposal', ether(1000), recipient.address)).to.be.reverted
            })

            it('rejects a non-investor', async () => {
                await expect(dao.connect(user).createProposal('Proposal', ether(100), recipient.address)).to.be.reverted
            })
        })
    })

    describe('\nVoting', () => {
        let transaction, result, weight

        beforeEach(async () => {

            // args from createProposal() in contract
            transaction = await dao.connect(wluser).createProposal('Proposal 1', ether(100), recipient.address)
            result = await transaction.wait()
        })

        describe('Success', () => {
            beforeEach(async () => {

                // Perform vote function
                transaction = await dao.connect(wluser).vote(1, 2, wluser.address)
                result = await transaction.wait()
            })

            // Verify owner is on the whitelist
            it('verifies owners whitelist status', async () => {
                expect(await dao.isWhitelisted(deployer.address)).to.be.true
            })

            it('checks owners right to add/del user from whitelist ', async () => {

                // Owner can add wluser to whitelist
                await dao.add(investor2.address)
                expect(await dao.isWhitelisted(investor2.address)).to.be.true

                // Owner can remove user from whitelist
                await dao.remove(wluser.address)
                expect(await dao.isWhitelisted(wluser.address)).to.be.false
            })

            // Verify wluser is on the whitelist
            it('verifies wluser whitelist status', async () => {
                expect(await dao.isWhitelisted(wluser.address)).to.be.true
            })

            // Verify weight calculation
            it('correctly calculates weighted voting', async () => {
                await token.connect(investor3).transfer(investor3.address, ether(100))
                result = await transaction.wait()

                weight = await dao.calculateWeight(investor3.address).to.eq(ether(200100))
            })

            // Check for proposal votes count iteration
            // Checking wluser balance
            it('updates vote count', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.votes).to.eq(tokens(200000))
            })

            it('emits an event', async () => {
                await expect(transaction).to.emit(dao, "Vote")
                    .withArgs(1, 2, wluser.address)
            })
        })

        describe('Failure', () => {
            describe('Vote Start', async () => {

                // Simulate ownership start timestamps
                await dao.connect(deployer).startVoting();
            })

            it('rejects non-owner from adding/deleting whitelist users', async () => {
                // expect the dao contract to be reverted if a non-owner tries to add a user to the whitelist
                await expect(dao.connect(investor4).add(investor2.address)).to.be.reverted
                await expect(dao.connect(wluser).add(investor4.address)).to.be.reverted

                // expect the dao contract to be reverted if a non-owner tries to remove a user from the whitelist
                await expect(dao.connect(investor4).remove(investor2.address)).to.be.reverted
                await expect(dao.connect(wluser).remove(investor4.address)).to.be.reverted
            })

            it('rejects non-wl investors from voting before time', async () => {
                await expect(dao.connect(user).vote(1, 1, user.address)).to.be.reverted
            })

            // Connect dao to user, submit 1 vote, revert as non-investor
            it('rejects a non-investor', async () => {
                await expect(dao.connect(user).vote(1, 1, user.address)).to.be.reverted
            })

            // Connect dao to wluser, submit 1 vote, revert as double voter
            it('rejects double voting', async () => {
                transaction = await dao.connect(wluser).vote(1, 1, wluser.address)
                await transaction.wait()

                await expect(dao.connect(wluser).vote(1, 1, wluser.address)).to.be.reverted
            })
        })
    })

    describe('\nGovernance', () => {
        let transaction, result

        beforeEach(async () => {

            // Add investors to whitelist
            await Promise.all([
                dao.add(investor2.address),
                dao.add(investor3.address),
                dao.add(investor4.address),
                dao.add(investor5.address)
            ]);
        })

        describe('Success', () => {
            beforeEach(async () => {

                // Create proposal
                transaction = await dao.connect(wluser).createProposal('Proposal 1', ether(100), recipient.address)
                result = await transaction.wait()

                // Vote on Proposal
                transaction = await dao.connect(wluser).vote(1, 1, wluser.address)
                result = await transaction.wait()

                transaction = await dao.connect(investor2).vote(1, 1, investor2.address)
                result = await transaction.wait()

                transaction = await dao.connect(investor3).vote(1, 2, investor3.address)
                result = await transaction.wait()

                // Finalize proposal
                transaction = await dao.connect(wluser).finalizeProposal(1)
                result = await transaction.wait()
            })

            it('transfers funds to recipient', async () => {
                expect(await ethers.provider.getBalance(recipient.address)).to.eq(tokens(10100))
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
                transaction = await dao.connect(investor5).createProposal('Proposal 1', ether(100), recipient.address)
                result = await transaction.wait()

                // Vote on Proposal
                transaction = await dao.connect(investor4).vote(1, 1, investor4.address)
                result = await transaction.wait()

                transaction = await dao.connect(investor2).vote(1, 1, investor2.address)
                result = await transaction.wait()
            })

            it('rejects finalization if not enough votes', async () => {
                await expect(dao.connect(investor5).finalizeProposal(1)).to.be.reverted
            })

            // Vote 3
            it('rejects proposal if already finalized', async () => {
                transaction = await dao.connect(investor3).vote(1, 1, investor3.address)
                result = await transaction.wait()

                // Finalize proposal
                transaction = await dao.connect(investor5).finalizeProposal(1)
                result = await transaction.wait()

                // Try to finalize again
                await expect(dao.connect(investor5).finalizeProposal(1)).to.be.reverted
            })

            it('rejects finalization from a non user', async () => {
                transaction = await dao.connect(investor3).vote(1, 1, investor3.address)
                result = await transaction.wait()

                await expect(dao.connect(user).finalizeProposal(1)).to.be.reverted
            })
        })
    })

    describe('\nGas Optimizations', () => {

        let transaction, receipt

        it('createProposal', async () => {
            transaction = await dao.connect(wluser).createProposal('Proposal 1', ether(100), recipient.address)
            receipt = await transaction.wait()
            console.log('\nGas Used for createProposal:', receipt.gasUsed.toString())
        })

        it('add', async () => {
            transaction = await dao.connect(deployer).add(investor2.address)
            receipt = await transaction.wait()
            console.log('Gas Used for add:', receipt.gasUsed.toString())
        })

        it('remove', async () => {
            transaction = await dao.connect(deployer).remove(investor2.address)
            receipt = await transaction.wait()
            console.log('Gas Used for remove:', receipt.gasUsed.toString())
        })

        it('getWhitelist', async () => {
            transaction = await dao.getWhitelist()
            console.log('Gas Used for getWhitelist:', receipt.gasUsed.toString())
        })

        it('isWhitelisted', async () => {
            transaction = await dao.isWhitelisted(deployer.address)
            console.log('Gas Used for isWhitelisted:', receipt.gasUsed.toString())
        })

        it('calculateWeight', async () => {
            transaction = await dao.calculateWeight(deployer.address)
            console.log('Gas Used for calculateWeight:', receipt.gasUsed.toString())
        })

        it('startVoting', async () => {
            transaction = await dao.connect(deployer).startVoting()
            receipt = await transaction.wait()
            console.log('Gas Used for startVoting:', receipt.gasUsed.toString())
        })

        it('vote', async () => {
            transaction = await dao.connect(wluser).vote(1, 1, wluser.address)
            receipt = await transaction.wait()
            console.log('Gas Used for vote:', receipt.gasUsed.toString())
        })

        it('finalizeProposal', async () => {

            // Create proposal
            transaction = await dao.connect(wluser).createProposal('Proposal 1', ether(100), recipient.address)

            // Vote on Proposal
            transaction = await dao.connect(wluser).vote(1, 1, wluser.address)
            await transaction.wait()

            transaction = await dao.connect(investor2).vote(1, 1, investor2.address)
            await transaction.wait()

            transaction = await dao.connect(investor3).vote(1, 2, investor3.address)
            await transaction.wait()

            // Finalize proposal
            transaction = await dao.connect(wluser).finalizeProposal(1)
            receipt = await transaction.wait()
            console.log('Gas Used for finalizeProposal:', receipt.gasUsed.toString())
        })
    })

    describe('\nSpeed Benchmarking', () => {

        it("Speed Benchmark: createProposal", async function () {
            console.time("createProposal");
            await dao.connect(investor2).createProposal("Proposal Creation Speed", ether(100), recipient.address);
            console.timeEnd("createProposal");
        })

        it("Speed Benchmark: vote", async function () {
            await token.connect(investor3).transfer(investor3.address, ether(100));
            result = await transaction.wait();

            console.time("vote");
            await dao.connect(investor3).vote(0, 1, investor3.address);
            result = await transaction.wait();
            console.timeEnd("vote");
        });

        it("Speed Benchmark: finalizeProposal", async function () {
            await dao.connect(investor4).createProposal("Finalize Proposal", ether(100), recipient.address);
            result = await transaction.wait();

            await dao.connect(investor4).vote(0, 1, investor4.address);
            result = await transaction.wait();

            await dao.connect(investor2).vote(0, 1, investor2.address);
            result = await transaction.wait();

            await dao.connect(investor3).vote(0, 2, investor3.address);
            result = await transaction.wait();

            console.time("finalizeProposal");
            await dao.connect(investor4).finalizeProposal(0);
            console.timeEnd("finalizeProposal");
        });
    })
})
