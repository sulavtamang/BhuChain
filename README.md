# BhuChain: Hybrid Blockchain Land Registry 🇳🇵

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Backend-Django%205-green)](https://www.djangoproject.com/)
[![Solidity](https://img.shields.io/badge/Blockchain-Solidity%20^0.8.28-gray)](https://soliditylang.org/)

BhuChain is a state-of-the-art **Hybrid Blockchain-based Land Registry System** designed to eliminate document tampering and fraud in the Nepalese land administration sector. It combines the immutable trust of the **Ethereum Sepolia** network with the high-speed performance of a **Django-driven** relational database.

---

## 🏛️ System Architecture

BhuChain uses a **Hybrid "Truth vs. Cache" Architecture**:
- **Source of Truth (Web3):** All property ownership records are minted as unique **ERC-721 NFTs** on the Ethereum Sepolia Testnet.
- **High-Speed Cache (Web2):** A Django backend mirrors blockchain data to provide instant search results, metadata management, and administrative filtering.
- **Security:** Sign-In With Ethereum (SIWE) provides passwordless, cryptographic authentication via MetaMask.

---

## 🚀 Key Features

- **Immutable Deeds:** Every property is a verifiable asset on the blockchain.
- **QR Verification:** Digital certificates include Etherscan links for instant public verification.
- **Fraud Prevention:** Land parcels can be "Locked" on-chain by authorized officers during disputes.
- **Zero Passwords:** Entire system authentication is handled via cryptographic wallet signatures.
- **Hybrid Performance:** Blazing fast search speeds with blockchain-level security.

---

## 🛠️ Tech Stack

- **Blockchain:** Solidity, Hardhat, Ethers.js, Sepolia Testnet.
- **Backend:** Django, Django REST Framework, PostgreSQL.
- **Frontend:** React 19, Tailwind CSS v4, Vite.
- **Auth:** MetaMask (EIP-4361 / SIWE).

---

## 🔧 Installation & Setup

### 1. Smart Contracts (Blockchain)
```bash
cd blockchain
npm install
# Create .env from .env.example
npx hardhat compile
npx hardhat ignition deploy ./ignition/modules/BhuChain.ts --network sepolia
```

### 2. Backend (Django)
```bash
cd backend
python -m venv env
source env/bin/activate # On Windows: env\Scripts\activate
pip install -r requirements.txt
# Create .env from .env.example and setup PostgreSQL
python manage.py migrate
python manage.py runserver
```

### 3. Frontend (React)
```bash
cd frontend
npm install
# Create .env from .env.example
npm run dev
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👥 Authors

- **[Sulav Man Sing Tamang]** - *Lead Developer* - [Sulav Man Sing Tamang](https://github.com/sulavtamang)

---

**BhuChain** — *Building trust, one block at a time.*
