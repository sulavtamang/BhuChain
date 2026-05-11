/**
 * addOfficer.mjs - Standalone script to authorize an officer on the BhuChain contract.
 * Run with: node scripts/addOfficer.mjs
 * 
 * Uses Hardhat Account #0's well-known private key (safe for local dev only).
 */
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const OFFICER_ADDRESS  = "0x3Fa58b175bFBee13165aE4594b3f39D6823CEbFc";

// Hardhat Account #0 — always the same on every fresh `npx hardhat node`
// ⚠ NEVER use this key on mainnet / testnets
const DEPLOYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const ABI = [
  "function addOfficer(address _officerAddress) external",
  "function isOfficer(address) view returns (bool)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const deployer = new ethers.Wallet(DEPLOYER_KEY, provider);
  console.log("Deployer (owner):", deployer.address);

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, deployer);

  // Check if already authorized
  const already = await contract.isOfficer(OFFICER_ADDRESS);
  if (already) {
    console.log(`✅ ${OFFICER_ADDRESS} is already an authorized officer. Nothing to do.`);
    return;
  }

  console.log(`Authorizing officer: ${OFFICER_ADDRESS} ...`);
  const tx = await contract.addOfficer(OFFICER_ADDRESS);
  const receipt = await tx.wait();
  console.log(`✅ Officer authorized! Block: ${receipt.blockNumber}`);
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
