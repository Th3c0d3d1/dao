// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
    }
    
    const ether = tokens

async function main() {
    console.log(`Fetching accounts & networks...\n`)
    // use const instead of let because const will not change; ***let may potentially be changed
    const accounts = await ethers.getSigners()

    // Proposal Creator
    const funder = accounts[0]

    // Token holders
    const investor1 = accounts[1]
    const investor2 = accounts[2]
    const investor3 = accounts[3]
    const recipient = accounts[4]
    
    console.log(`Fetching accounts & transferring to accounts...\n`)

    // Fetch deployed token
    const token = await ethers.getContractAt('Token', '0x5fbdb2315678afecb367f032d93f642f64180aa3')
    console.log(`Token fetched: ${token.address}\n`)

    // Send tokens to investors; 20% each
    transaction = await token.transfer(investor1.address, tokens(200000))
    await transaction.wait()

    transaction = await token.transfer(investor2.address, tokens(200000))
    await transaction.wait()

    transaction = await token.transfer(investor3.address, tokens(200000))
    await transaction.wait()

    // Fetch DAO
    console.log(`Fetching DAO...\n`)

    const dao = await hre.ethers.getContractAt('DAO', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')
    console.log(`DAO fetched: ${dao.address}\n`)

    // Funder sends eth to DAO treasury for governance
    await funder.sendTransaction({to: dao.address, value: ether(1000)})
    await transaction.wait()
    console.log(`Sent funds to DAO treasury...\n`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
