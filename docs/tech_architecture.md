# Memory: Technical Architecture Blueprint

This document captures the finalized architectural decisions for BhuChain to ensure consistency during the implementation phase.

## 1. The Hybrid Model

BhuChain operates on a **Hybrid Architecture** to balance public transparency with private compliance.

- **On-Chain (Public/Truth):** Immutable ledger of ownership, parcel dimensions, and transfer history.
- **Off-Chain (Private/Performance):** Personal identifiable information (PII), digitized deed images, and administrative staging.

## 2. Layered Breakdown

| Layer            | Technology          | Primary Responsibility                                        |
| :--------------- | :------------------ | :------------------------------------------------------------ |
| **Presentation** | React.js + Vite     | UI/UX, MetaMask integration (Ethers.js).                      |
| **Application**  | Django + DRF        | API Gatekeeper, KYC verification, Metadata storage.           |
| **Blockchain**   | Solidity + Ethereum | Authoritative "Source of Truth," land minting, and transfers. |

## 3. Core Data Strategy

- **Security:** Every state-changing action (minting or transferring) REQUIRES a cryptographic signature via MetaMask.
- **Auditability:** Every administrative decision (approval/rejection) is logged off-chain into an uneditable audit table for accountability.
- **Performance:** High-volume metadata like scanned documents are NOT stored on-chain; only their cryptographic hashes or references are stored to minimize gas costs.
