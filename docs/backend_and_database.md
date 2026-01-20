# Memory: Backend & Database Design

This document covers the Django REST Framework logic and PostgreSQL schema for off-chain data management.

## 1. Database Schema (PostgreSQL)

### A. User Profiles (`users`)

Used for KYC and Role-Based Access Control (RBAC).

- `wallet_address`: Unique ID linked to MetaMask.
- `citizenship_no`: Legal identifier (encrypted).
- `role`: Citizen or Officer.
- `is_verified`: Boolean status.

### B. Registration Staging (`applications`)

Used as a "Pre-Blockchain" review area.

- `document_path`: Link to deed scans.
- `status`: Pending, Approved, Rejected.
- `created_at`: Compliance timestamp.

### C. Admin Audit trail (`admin_logs`)

Ensures accountability for officers.

- `admin_id`: The officer responsible.
- `target_app_id`: The transaction in question.
- `action`: Approval/Rejection details.

## 2. API Design & Security

- **Web3 Auth:** Django uses the wallet address as the primary identifier. Nonces and signatures are used to prevent session hijacking.
- **Middleware:** Every non-public API endpoint must verify the `is_authenticated` and `is_verified` status.
- **Data Protection:** Database entries for citizenship IDs must be hashed or encrypted at rest to align with privacy standards.
