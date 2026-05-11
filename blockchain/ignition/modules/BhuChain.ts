import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BhuChainModule = buildModule("BhuChainModule", (m) => {
  // Deploy the BhuChain contract
  // The constructor takes 0 arguments now, so no additional parameters are needed
  const bhuChain = m.contract("BhuChain");

  return { bhuChain };
});

export default BhuChainModule;
