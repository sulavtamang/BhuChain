import { ethers } from 'ethers';

const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "officerAddress",
        "type": "address"
      }
    ],
    "name": "OfficerAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "parcelID",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "lockedBy",
        "type": "address"
      }
    ],
    "name": "ParcelLocked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "parcelID",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "ParcelOwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "parcelID",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "area",
        "type": "uint256"
      }
    ],
    "name": "ParcelRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "parcelID",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "unlockedBy",
        "type": "address"
      }
    ],
    "name": "ParcelUnlocked",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_officerAddress",
        "type": "address"
      }
    ],
    "name": "addOfficer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_area",
        "type": "uint256"
      }
    ],
    "name": "addParcel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isOfficer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "parcelCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "lockParcel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "parcels",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "area",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isLocked",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "unlockParcel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_newOwner",
        "type": "address"
      }
    ],
    "name": "transferParcelOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// SINGLETONS: Prevent Hammering the node with too many connections
let cachedReadOnlyProvider = null;
let cachedReadOnlyContract = null;
let cachedBrowserProvider = null;
let cachedChainId = null;

export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && !!window.ethereum;
};

// Blockchain Provider & Signer
export const getProvider = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('WEB3_PROVIDER_MISSING');
  }
  
  if (!cachedBrowserProvider) {
    cachedBrowserProvider = new ethers.BrowserProvider(window.ethereum);
  }
  
  return cachedBrowserProvider;
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

// Network Management
export const switchToHardhatNetwork = async () => {
  const chainId = import.meta.env.VITE_CHAIN_ID || '31337';
  const chainIdHex = `0x${parseInt(chainId).toString(16)}`;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (error) {
    // If network doesn't exist in MetaMask, add it
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainIdHex,
          chainName: 'Hardhat Local',
          rpcUrls: [import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545'],
          nativeCurrency: {
            name: 'Hardhat ETH',
            symbol: 'ETH',
            decimals: 18
          }
        }]
      });
    } else {
      throw error;
    }
  }
};

const EXPECTED_CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '31337');

// Validate chain ID before transactions (with caching)
const ensureCorrectNetwork = async () => {
  const provider = getProvider();
  
  // Only check network if we haven't already verified it in this session
  if (cachedChainId === EXPECTED_CHAIN_ID) return;

  const network = await provider.getNetwork();
  cachedChainId = Number(network.chainId);

  if (cachedChainId !== EXPECTED_CHAIN_ID) {
    console.warn(`Wrong network! On chain ${cachedChainId}, switching to ${EXPECTED_CHAIN_ID}...`);
    await switchToHardhatNetwork();
    // Refresh cache after switch
    const newNetwork = await provider.getNetwork();
    cachedChainId = Number(newNetwork.chainId);
  }
};

// Read/Write Contract Instance
export const getContract = async () => {
  await ensureCorrectNetwork();
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
};

export const getParcelCount = async () => {
  const contract = await getContract();
  const count = await contract.parcelCount();
  return Number(count); // Convert BigInt to regular number
};

// Read-Only Contract Instance (JsonRpcProvider)
export const getReadOnlyContract = () => {
  const rpcUrl = import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545';
  
  // Reuse existing provider + contract to save memory/conns
  if (cachedReadOnlyContract && cachedReadOnlyProvider?.provider?._url === rpcUrl) {
    return cachedReadOnlyContract;
  }


  cachedReadOnlyProvider = new ethers.JsonRpcProvider(rpcUrl);
  cachedReadOnlyContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, cachedReadOnlyProvider);
  
  return cachedReadOnlyContract;
};

export const getParcel = async (parcelID) => {
  const contract = getReadOnlyContract();
  const parcel = await contract.parcels(parcelID);

  return {
    id: Number(parcel.id),
    location: parcel.location,
    area: Number(parcel.area),
    owner: parcel.owner,
    isLocked: parcel.isLocked  // Lock status for UI enforcement
  };
};

// Fetch all parcels owned by an address (Hybrid Approach: DB first, then verify on-chain)
export const getParcelsByOwner = async (address) => {
  if (!address) return [];
  
  try {
    // 1. Fetch from Backend (Optimized & No Alchemy Limits)
    const { getProperties } = await import("./api");
    const allProperties = await getProperties();
    
    // 2. Filter by owner address
    const ownedProperties = allProperties.filter(p => 
      p.owner_details?.wallet_address?.toLowerCase() === address.toLowerCase()
    );

    // 3. Map to match the expected Blockchain object format
    return ownedProperties.map(p => ({
      id: Number(p.parcel_id),
      location: p.location,
      area: Number(p.area),
      owner: p.owner_details?.wallet_address,
      isLocked: p.is_active === false,
      land_image: p.land_image
    }));

  } catch (err) {
    console.error("Parcel discovery failed (DB Fallback):", err);
    return [];
  }
};


export const checkIsOfficer = async (address) => {
  // Use read-only contract — no MetaMask signer needed for a view call
  const contract = getReadOnlyContract();
  return await contract.isOfficer(address);
};

// Mint new parcel
export const addParcel = async (ownerAddress, location, area) => {
  const contract = await getContract();
  const tx = await contract.addParcel(ownerAddress, location, area);
  const receipt = await tx.wait();

  // Parse logs to find the Parcel ID
  let parcelId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && (parsed.name === 'ParcelRegistered' || parsed.name === 'LandRegistered')) {
        parcelId = Number(parsed.args.parcelID ?? parsed.args.parcelId ?? parsed.args[0]);
        break;
      }
    } catch (e) {
      // Not a relevant log
    }
  }

  if (parcelId === null || isNaN(parcelId)) {
     console.error("Failed to parse ParcelID from blockchain logs.");
  }

  return { receipt, parcelId };
};

// Transfer Ownership
export const transferParcelOwnership = async (parcelID, newOwnerAddress) => {
  const contract = await getContract();

  if (!contract || typeof contract.transferParcelOwnership !== 'function') {
    throw new Error('Smart contract method "transferParcelOwnership" not found.');
  }

  try {
    const tx = await contract.transferParcelOwnership(parcelID, newOwnerAddress);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('[Blockchain] Transfer transaction failed:', error);
    throw error;
  }
};

// Lock/Unlock Parcels
export const lockParcel = async (parcelID) => {
  const contract = await getContract();
  try {
    const tx = await contract.lockParcel(parcelID);
    return await tx.wait();
  } catch (error) {
    console.error('[Blockchain] Lock transaction failed:', error);
    throw error;
  }
};

export const unlockParcel = async (parcelID) => {
  const contract = await getContract();
  try {
    const tx = await contract.unlockParcel(parcelID);
    return await tx.wait();
  } catch (error) {
    console.error('[Blockchain] Unlock transaction failed:', error);
    throw error;
  }
};

// Wallet connection helpers
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });

  return accounts[0];
};

export const getCurrentAccount = async () => {
  if (!window.ethereum) return null;

  const accounts = await window.ethereum.request({
    method: 'eth_accounts'
  });

  return accounts[0] || null;
};

// switchToHardhatNetwork is defined above near getContract()
