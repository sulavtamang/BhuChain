import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

describe("BhuChain Land Registry", function () {
  /**
   * Helper function to deploy a fresh contract instance for each test
   * This ensures tests don't interfere with each other
   */
  async function deployContract() {
    // Get test accounts from Hardhat's local blockchain
    const [admin, officer, citizen1, citizen2] = await ethers.getSigners();
    
    // Deploy the BhuChain contract
    const BhuChain = await ethers.getContractFactory("BhuChain");
    const bhuChain = await BhuChain.deploy();
    
    // Authorize the officer account for land registration
    await bhuChain.addOfficer(officer.address);

    return { bhuChain, admin, officer, citizen1, citizen2 };
  }

  // ============ BASIC FUNCTIONALITY TESTS ============

  it("Should set the correct registry name", async function () {
    const { bhuChain } = await deployContract();
    expect(await bhuChain.name()).to.equal("BhuChain Land Registry");
  });

  // ============ EVENT EMISSION TESTS ============

  it("Should emit an event when an Officer is added", async function () {
    const { bhuChain, officer } = await deployContract();
    
    // Verify that adding an officer triggers the OfficerAdded event
    await expect(bhuChain.addOfficer(officer.address))
      .to.emit(bhuChain, "OfficerAdded")
      .withArgs(officer.address);
  });

  it("Should emit ParcelRegistered event with correct data", async function () {
    const { bhuChain, officer, citizen1 } = await deployContract();
    
    // Verify that registering land triggers the event with accurate parameters
    await expect(
      bhuChain.connect(officer).addParcel(citizen1.address, "Kathmandu", 500)
    )
      .to.emit(bhuChain, "ParcelRegistered")
      .withArgs(1, citizen1.address, "Kathmandu", 500);
  });

  it("Should emit ParcelOwnershipTransferred event", async function () {
    const { bhuChain, officer, citizen1, citizen2 } = await deployContract();
    
    // Setup: Register land for citizen1
    await bhuChain.connect(officer).addParcel(citizen1.address, "KTM", 500);
    
    // Verify that transferring ownership triggers the event
    await expect(
      bhuChain.connect(citizen1).transferParcelOwnership(1, citizen2.address)
    )
      .to.emit(bhuChain, "ParcelOwnershipTransferred")
      .withArgs(1, citizen1.address, citizen2.address);
  });

  // ============ OWNERSHIP LOGIC TESTS ============

  it("Should register land to the correct CITIZEN (not the officer)", async function () {
    const { bhuChain, officer, citizen1 } = await deployContract();
    
    // Officer registers land on behalf of Citizen 1
    await bhuChain.connect(officer).addParcel(citizen1.address, "Kathmandu", 500);
    
    // Verify that the blockchain records Citizen 1 as the owner, not the officer
    const land = await bhuChain.parcels(1);
    expect(land.owner).to.equal(citizen1.address);
  });

  it("Should allow transfer between citizens", async function () {
    const { bhuChain, officer, citizen1, citizen2 } = await deployContract();
    
    // Setup: Register land for Citizen 1
    await bhuChain.connect(officer).addParcel(citizen1.address, "Lalitpur", 750);
    
    // Citizen 1 transfers ownership to Citizen 2
    await bhuChain.connect(citizen1).transferParcelOwnership(1, citizen2.address);
    
    // Verify that Citizen 2 is now the owner
    const land = await bhuChain.parcels(1);
    expect(land.owner).to.equal(citizen2.address);
  });

  // ============ SECURITY TESTS ============

  it("Should FAIL if a non-officer tries to register land", async function () {
    const { bhuChain, citizen1 } = await deployContract();
    
    // Attempt: Citizen tries to register land without officer privileges
    // Expected: Transaction should revert with specific error message
    await expect(
      bhuChain.connect(citizen1).addParcel(citizen1.address, "Pokhara", 1000)
    ).to.be.revertedWith("Only authorized officers can register land");
  });

  it("Should prevent theft (Security Check)", async function () {
    const { bhuChain, officer, citizen1, citizen2 } = await deployContract();
    
    // Setup: Register land for Citizen 1
    await bhuChain.connect(officer).addParcel(citizen1.address, "Bhaktapur", 300);

    // Attack: Citizen 2 tries to steal Citizen 1's land
    // Expected: Transaction should revert because Citizen 2 is not the owner
    await expect(
      bhuChain.connect(citizen2).transferParcelOwnership(1, citizen2.address)
    ).to.be.revertedWith("You are not the owner of this parcel");
  });
});