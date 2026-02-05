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
      }
    ],
    "stateMutability": "view",
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

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

/**
 * Get the ether.js provider from MetaMask.
 * Provider = read-only connection to blockchain
 */
export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this app.')
  }
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Get the signer (user's walllet) for write operations.
 * Signer = can sign transactions and send them to blockchain
 */
export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

/**
 * Get the BhuChain contract instance with signer.
 * This allows both read and write operations.
 */
export const getContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
};

/**
 * Get the total number of registered parcels.
 * @returns {Promise<number>} Total parcel count
 */
export const getParcelCount = async () => {
  const contract = await getContract();
  const count = await contract.parcelCount();
  return Number(count); // Convert BigInt to regular number
};

/**
 * Get details of a specific parcel by ID.
 * @param {number} parcelID - The parcel ID to fetch
 * @returns {Promise<Object>} Parcel data { id, location, area, owner }
 */
export const getParcel = async (parcelID) => {
  const contract = await getContract();
  const parcel = await contract.parcels(parcelID);

  return {
    id: Number(parcel.id),
    location: parcel.location,
    area: Number (parcel.area),
    owner: parcel.owner
  };
};

/**
 * Check if an address is an authorized officer.
 * @param {string} address - Ethereum address to check
 * @returns {Promise<boolean>} True if address is an officer
 */
export const checkIsOfficer = async (address) => {
  const contract = await getContract();
  return await contract.isOfficer(address);
};

/**
 * Register a new land parcel on the blockchain (Officer only).
 * @param {string} ownerAddress - Wallet address of the land owner
 * @param {string} location - Physical location of the land
 * @param {number} area - Area in square meters 
 * @returns {Promise<Object>} Transaction receipt
 */
export const addParcel = async (ownerAddress, location, area) => {
  const contract = await getContract();

  // Send transaction (MetaMask will pop up for approval)
  const tx = await contract.addParcel(ownerAddress, location, area);

  // Wait for transaction to be mined (confirmed on blockchain)
  const receipt = await tx.wait();

  return receipt;
};

/**
 * Transfer ownership of a parcel to a new owner.
 * @param {number} parcelID - ID of the parcel to transfer
 * @param {string} newOwnerAddress -Wallet address of the new owner
 * @returns {Promise<Object>} Transaction receipt
 */
export const transferParcelOwnership = async (parcelID, newOwnerAddress) => {
  const contract = await getContract();

  const tx = await contract.transferParcelOwnership(parcelID, newOwnerAddress);
  const receipt = await tx.wait();

  return receipt;
};


/**
 * Request MetaMask to connect and return user's address.
 * @returns {Promise<string>} Connected wallet address
 */
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });

  return accounts[0];
};

/**
 * Get the currently connected wallet address (if any).
 * @returns {Promise<string | null>} Wallet address or null
 */
export const getCurrentAccount = async () => {
  if (!window.ethereum) return null;

  const accounts = await window.ethereum.request({
    method: 'eth_accounts'
  });

  return accounts[0] || null;
};

/**
 * Switch MetaMask to the Hardhat local network.
 */
export const switchToHardhatNetwork = async () => {
  const chainId = import.meta.env.VITE_CHAIN_ID;
  const chainIdHex = `0x${parseInt(chainId).toString(16)}`;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (error) {
    // If network doesn't exist, add it
    if (error.code === 4902) {
      await window.ethereum.request9({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainIdHex,
          chainName: 'Hardhat Local',
          rpcUrls: [import.meta.env.VITE_RPC_URL],
          nativeCurrency: {
            name: 'ETH',
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
