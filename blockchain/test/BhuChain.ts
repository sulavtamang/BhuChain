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
});