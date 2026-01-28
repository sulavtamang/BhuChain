# Memory: Smart Contract Specifications

This document defines the core logic, variables, and security rules for the BhuChain Solidity contracts.

## 1. Global State Variables

The system uses mappings for fast, public lookups:

- `mapping(uint256 => Parcel) public parcels`: Links a unique Kitta (Parcel) ID to its data.
- `mapping(address => bool) public authorizedOfficers`: Whitelist for Malpot staff.

## 2. Data Structure: `Parcel`

```solidity
struct Parcel {
    uint256 parcel_id;  // Unique Token ID
    address owner;      // Current legal owner's wallet
    string location;    // Physical address (District/Ward)
    uint256 area;       // Square footage / Ropani-Anna-Paisa
    bool isLocked;      // Prevents double-transfer during pending stages
}
```

## 3. Core Logic (Functions)

### A. Initialization (`mintLand`)

- **Caller:** `onlyAuthorizedOfficer`
- **Action:** Creates a new digital land asset.
- **Verification:** Must ensure the `parcel_id` doesn't already exist.

### B. Ownership Handoff (`initiateTransfer`)

- **Caller:** `currentOwner`
- **Action:** Locks the parcel and generates a transfer intent.

### C. Final Approval (`approveTransfer`)

- **Caller:** `onlyAuthorizedOfficer`
- **Action:** Re-assigns the `owner` address and unlocks the parcel.
- **Requirement:** Must verify both parties have consented cryptographically.

## 4. Security Rules

- **Access Control:** No ownership change can happen without an officer's approval (to mirror Nepal's Malpot laws).
- **Immutability:** Once minted, the `area` and `location` of a parcel cannot be changed; only the `owner` is mutable.
