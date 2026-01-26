import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

describe("BhuChain Land Registry", function () {
  async function deployContract() {
    // Get the contract from our contracts/ folder
    const BhuChain = await ethers.getContractFactory("BhuChain");
    // "Deploy" it to our local fake blockchain
    const bhuChain = await BhuChain.deploy();
    return bhuChain;
  }

  it("Should set the correct registry name", async function () {
    const bhuChain = await deployContract();
    // Check if the name variable matches what we wrote in Solidity
    expect(await bhuChain.name()).to.equal("BhuChain Land Registry");
  });

  it("Should allow adding a new parcel", async function () {
    const bhuChain = await deployContract();
    
    // Add a parcel: Kathmandu, 500 area
    await bhuChain.addParcel("Kathmandu", 500);
    
    // Check if the parcelCount increased to 1
    expect(await bhuChain.parcelCount()).to.equal(1);
  });

  it("Should NOT allow a non-owner to transfer land", async function () {
  const bhuChain = await deployContract();
  
  // 1. Setup: Create 'Owner' and 'Hacker' accounts
  const [owner, hacker] = await ethers.getSigners();
  
  // 2. Add a parcel (Owner adds it, so ID 1 belongs to Owner)
  await bhuChain.addParcel("Pokhara", 1000);
  
  // 3. Attempt Theft: Hacker tries to transfer Parcel #1 to themselves
  // We expect this to FAIL with our exact error message
  await expect(
    bhuChain.connect(hacker).transferOwnership(1, hacker.address)
  ).to.be.revertedWith("You are not the owner of this parcel");
});
});