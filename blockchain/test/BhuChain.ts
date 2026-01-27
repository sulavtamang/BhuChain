import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

describe("BhuChain Land Registry", function () {
  // Helper to deploy the contract fresh for each test
  async function deployContract() {
    // 1. Get some fake accounts
    const [admin, officer, citizen1, citizen2] = await ethers.getSigners();
    
    // 2. Deploy the contract
    const BhuChain = await ethers.getContractFactory("BhuChain");
    const bhuChain = await BhuChain.deploy();
    
    // 3. Authorize the officer so they can register land
    await bhuChain.addOfficer(officer.address);

    return { bhuChain, admin, officer, citizen1, citizen2 };
  }

  it("Should set the correct registry name", async function () {
    const { bhuChain } = await deployContract();
    expect(await bhuChain.name()).to.equal("BhuChain Land Registry");
  });

  it("Should register land to the correct CITIZEN (not the officer)", async function () {
    const { bhuChain, officer, citizen1 } = await deployContract();
    
    // 1. Officer registers land for Citizen 1
    // New Signature: addParcel(owner, location, area)
    await bhuChain.connect(officer).addParcel(citizen1.address, "Kathmandu", 500);
    
    // 2. Verify the owner stored in mapping is actually Citizen 1
    const land = await bhuChain.parcels(1);
    expect(land.owner).to.equal(citizen1.address);
  });

  it("Should FAIL if a non-officer tries to register land", async function () {
    const { bhuChain, citizen1 } = await deployContract();
    
    // Citizen tries to register land for themselves (Should fail)
    await expect(
      bhuChain.connect(citizen1).addParcel(citizen1.address, "Pokhara", 1000)
    ).to.be.revertedWith("Only authorized officers can register land");
  });

  it("Should allow transfer and handle locking", async function () {
    const { bhuChain, officer, citizen1, citizen2 } = await deployContract();
    
    // 1. Setup: Officer registers land for Citizen 1
    await bhuChain.connect(officer).addParcel(citizen1.address, "Lalitpur", 750);

    // 2. Transfer: Citizen 1 transfers to Citizen 2
    // This function internally checks requires and locks/unlocks
    await bhuChain.connect(citizen1).transferOwnership(1, citizen2.address);

    // 3. Verify new owner
    const land = await bhuChain.parcels(1);
    expect(land.owner).to.equal(citizen2.address);
    expect(land.isLocked).to.equal(false); // Should be unlocked after transfer
  });

  it("Should prevent theft (Security Check)", async function () {
    const { bhuChain, officer, citizen1, citizen2 } = await deployContract();
    
    // 1. Officer registers land for Citizen 1
    await bhuChain.connect(officer).addParcel(citizen1.address, "Bhaktapur", 300);

    // 2. Citizen 2 tries to steal it
    await expect(
      bhuChain.connect(citizen2).transferOwnership(1, citizen2.address)
    ).to.be.revertedWith("You are not the owner of this parcel");
  });
});