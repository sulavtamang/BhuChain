# Memory: Frontend & UX Flows

This document details the user journey and UI requirements for the BhuChain DApp.

## 1. Primary User Journeys

### A. The Citizen (User)

1. **Connect:** Signs in via MetaMask popup.
2. **Dashboard:** Views digital "Lalpurja" cards representing owned parcels.
3. **Initiate Transfer:** Enters buyer wallet -> Signs "Sign & Move" transaction -> Application moves to Pending.

### B. The Malpot Officer (Admin)

1. **Queue Review:** Views list of pending transfers with color-coded priority.
2. **Verification:** Split-screen view (Document Scan vs. Blockchain Data).
3. **Approve/Mint:** Clicks "Approve" -> Signs transaction -> Immutable ledger updates.

### C. The Public (Guest)

1. **Search:** Enters Kitta (Parcel) ID into a global search bar.
2. **Audit:** Views the "Chain of Title" (Timeline of ownership transfers).

## 2. UI/UX Requirements

- **Simplicity:** The interface should mimic traditional Malpot forms to reduce learning curves.
- **Feedback:** Clear loading states for blockchain "Mining" durations (e.g., spinning Lalpurja icon).
- **Security Alerts:** Prominent warnings when signing transactions regarding permanent data changes.
- **Web3 Integration:** Use Ethers.js to handle all provider connections and event listeners.
