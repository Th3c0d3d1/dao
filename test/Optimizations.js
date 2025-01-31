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

    describe('\n\nSpeed Benchmarking', () => {

        it("Speed Benchmark: createProposal", async function () {
            console.time("createProposal");
            await dao.connect(investor2).createProposal("Proposal Creation Speed", ether(100), recipient.address);
            console.timeEnd("createProposal");
        })

        it("Speed Benchmark: add", async function () {
            console.time("add");
            await dao.connect(deployer).add(investor5.address);
            console.timeEnd("add");
        });

        it("Speed Benchmark: remove", async function () {
            console.time("remove");
            await dao.connect(deployer).remove(investor5.address);
            console.timeEnd("remove");
        });

        it("Speed Benchmark: getWhitelist", async function () {
            console.time("getWhitelist");
            await dao.getWhitelist();
            console.timeEnd("getWhitelist");
        });

        it("Speed Benchmark: isWhitelisted", async function () {
            console.time("isWhitelisted");
            await dao.isWhitelisted(deployer.address);
            console.timeEnd("isWhitelisted");
        });

        it("Speed Benchmark: calculateWeight", async function () {
            console.time("calculateWeight");
            await dao.calculateWeight(deployer.address);
            console.timeEnd("calculateWeight");
        });

        it("Speed Benchmark: startVoting", async function () {
            console.time("startVoting");
            await dao.connect(deployer).startVoting();
            console.timeEnd("startVoting");
        });

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
