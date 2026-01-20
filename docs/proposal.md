# ABSTRACT
Nepalese land registration systems face critical challenges including bureaucratic inefficiency, opaque processes, and vulnerability to document tampering. The traditional paper-based recordsmanaged by the Malpot Karyalaya (Land Revenue Offices) are often susceptible to unauthorized alterations and deterioration over time. The BhuChain project offers a blockchain-based land registration system that addresses these issues by leveraging decentralized ledger technology for enhanced security and integrity. This project aims at establishing a tamper-proof, verifiable digital platform that streamlines the land ownership process for Nepali citizens and administrators. The system architecture includes a Django REST Framework backend, a React-based frontend, and the Ethereum blockchain (interacting via Web3.py) to immutably record critical transaction data like ownership transfer. While sensitive personal data remains in an off-chain relational database, cryptographic hashes of essential records are stored on-chain to ensure authenticity. Among the expected outcomes are greater transparency in land dealings, reduced corruption risks, and strengthened public trust in Nepal's land administration. This is a practical demonstration of the potential of blockchain in transforming public sector services in developing nations.

**Keywords:** Blockchain, Land Registration, Decentralization, Smart Contracts, Nepal, Malpot, Immutable Ledger.

# ACKNOWLEDGEMENT
I would like to express my sincere gratitude to my supervisors and the Department of Computer Science and Multimedia, NCMT College, for their guidance and support in helping shape the direction of this project proposal. Their valuable insights and encouragement have been instrumental in developing the initial framework for this work.

I am also thankful to the Department of Computer Science and Multimedia, National College of Management and Technical Sciences, for fostering an academic environment that supports research and innovation.

Additionally, I appreciate the helpful suggestions from peers and mentors during the ideation phase. Lastly, I thank my family and friends for their encouragement and motivation throughout the early stages of this academic endeavor.

**Sulav Man Sing Tamang**  
**LC00021000847**

# PREFACE
The motivation behind selecting the topic "Blockchain-Based Land Registration System" stems from a deep interest in exploring how emerging technologies can solve long-standing real-world problems in Nepal. In our context, land registration processes are often synonymous with administrative hassles, lack of transparency, and fears of duplicate land ownership or fraud. Discovering the potential of blockchain to bring trust, security, and decentralization to such systems sparked a determination to propose a solution relevant to our local infrastructure. 

Preparing this proposal has been an enriching learning experience, pushing me to dive into concepts like smart contracts and system architecture—topics I was previously unfamiliar with but have grown to appreciate. Formulating the scope and objectives was challenging, as I had to align technical feasibility with the practical realities of Nepal's land governance. This proposal reflects not just a system plan, but also a vision to contribute meaningfully to modernizing public services in our country.


# ABBREVIATIONS

| Abbreviation | Full Form |
| :--- | :--- |
| API | Application Programming Interface |
| CBDC | Central Bank Digital Currency |
| DApp | Decentralized Application |
| DFD | Data Flow Diagram |
| DOLRM | Department of Land Reform and Management |
| ERD | Entity Relationship Diagram |
| GIS | Geographic Information System |
| IAM | Identity and Access Management |
| IDE | Integrated Development Environment |
| IPFS | InterPlanetary File System |
| KYC | Know Your Customer |
| LRMS | Land Revenue Management System |
| LRIMS | Land Revenue Information Management System |
| NAPR | National Agency of Public Registry |
| NCMT | Nanotech College of Management and Technical Sciences |
| NRB | Nepal Rastra Bank |
| NSO | National Statistics Office |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| UI | User Interface |
| UX | User Experience |

# 1. INTRODUCTION

Land administration in Nepal faces a crisis of reliability. For the average Nepali citizen, visiting the *Malpot Karyalaya* (Land Revenue Office) is often an experience defined by uncertainty and procedural delays. Despite the government's efforts to modernize through the *Land Revenue Information Management System (LRIMS)*, the sector remains vulnerable to systemic issues. In fact, the *Commission for the Investigation of Abuse of Authority (CIAA)*, in its Thirty-Fifth Annual Report (2081/82), revealed that complaints related to land administration constituted **5.91%** of all grievances filed, marking it as a persistent sector for public dissatisfaction (CIAA, 2025).

The problem is deeply rooted in the reliance on traditional *Dhadda* (paper-based registers) and *Muth* (loose-leaf files), which create fertile ground for data tampering. High-profile cases like the *Lalita Niwas* land grab, where over 310 individuals—including former ministers and top bureaucrats—were charged with forging government documents to transfer public land into private hands, demonstrate the scale of the risk (Shrestha, 2023). Even with recent digitization, the "human-in-the-loop" architecture means that without an immutable audit trail, records in the *Sresta* system remain susceptible to unauthorized alteration.

This project, BhuChain, proposes a fundamental shift from this "trust-based" model to a "truth-based" model. By replacing the vulnerability of centralized SQL databases with the cryptographic certainty of a blockchain, we aim to protect the sanctity of the *Lalpurja* (Ownership Certificate) once and for all.
## 1.1. Background of the Study
In Nepal, land is more than just property; it is a symbol of legacy and economic security. For decades, the Department of Land Reform and Management (DOLRM), under the Ministry of Land Management, Cooperatives and Poverty Alleviation, has managed these vital records. However, the transition from paper-based Likhit (deeds) to a reliable digital system remains a significant hurdle. Even today, many Malpot Karyalayas (Land Revenue Offices) still struggle with manual verification processes that are prone to human error and data manipulation (Acharya, 2008). While we have seen gradual progress in cadastral systems, the authoritative source of truth is often locked in aging paper files or centralized databases that lack transparency. This dependency frequently leads to "double ownership" disputes and bureaucratic delays that frustrate ordinary citizens (Shrestha, Nepali, & Dahal, 2021).
As we look globally, many nations are now turning to "GovTech" to solve these transparency gaps. Blockchain technology, in particular, has shown immense promise. Countries like Sweden and Georgia have already moved their land titles onto decentralized ledgers to eliminate the risk of record tampering (Shang & Price, 2019). By using a system where data is distributed rather than centralized, they have effectively created a tamper-proof "Source of Truth." This project, BhuChain, attempts to bring this same innovation to our local context. Our goal is to replace the vulnerabilities of the current Malpot system with a blockchain-backed ledger, ensuring that every Lalpurja (ownership certificate) issued is verifiable, secure, and permanent.
## 1.2. Problem Statement
The primary issue BhuChain addresses is the fragile nature of Nepal's centralized land registration records. Despite ongoing digitization efforts, the system remains vulnerable to unauthorized alterations and accidental data loss. Because there is no decentralized synchronization between local Malpot offices, discrepancies often arise, leading to massive legal headaches for landowners. (Acharya, 2008) notes that weak institutional capacities and loose legal frameworks often invite encroachment and disputes over public and private land.
This vulnerability creates real pain for stakeholders. The sheer volume of land disputes in Nepal is staggering; (Pradhan, 2017) reported nearly 400,000 pending cases in various courts, many of which stem from duplicate registration or fraudulent claims. For a common citizen, buying land involves navigating a "black box" of bureaucracy where transaction costs are high and transparency is low. This is not just a technical flaw; it is a socio-economic barrier. Insecurity in land tenure discourages investment and erodes the public's trust in government institutions. Fixing this system is, therefore, a critical step towards digital sovereignty and social justice in Nepal.
## 1.3. Objectives
*   To develop a decentralized, tamper-proof land registry using blockchain technology that acts as an immutable "Source of Truth" for land ownership (*Lalpurja*).
*   To automate secure land transfers and identity verification via smart contracts and non-custodial wallets, eliminating the risk of fraud and bureaucratic delays.
## 1.4. Scope of the Project
BhuChain is designed to handle the core operations of a land registry. This includes the initial entry of land parcels by authorized officers and the secure transfer of ownership between private parties via smart contracts. A vital part of our scope is the public verification portal, which gives anyone the ability to audit the history of a specific Kitta (parcel) using only its digital ID. We will also implement role-based access to differentiate between the administrative powers of Malpot staff and the transactional needs of the general public.
However, it is important to clarify what BhuChain will not do. We are not digitizing existing legal court disputes or integrating with heavy GIS surveying data in this phase. While the system demonstrates the financial logic of a transfer, it does not include a direct fiat payment gateway due to current regulatory hurdles in Nepal. Instead, payments are simulated to prove the underlying logic. The prototype is intended to work as a web application accessible via standard browsers using MetaMask.
## 1.5. Significance of the Project
BhuChain is more than just a technical upgrade; it is a direct response to the crisis of confidence in our land administration. By shifting from paper files to an unchangeable blockchain ledger, this project aims to protect the most valuable asset of every Nepali family: their land. For the common citizen, it promises relief from the constant fear of fraud and the exhaustion of dealing with opaque bureaucratic hurdles. At the same time, it provides the *Malpot Karyalaya* with a tool to enforce transparency, proving that advanced technology can be practically applied to solve our nation's most persistent governance challenges.

2.	LITERATURE REVIEW
Research into blockchain's role in public governance has grown rapidly over the last decade. Systematic reviews, such as those by (Zein & Twinomurinzi, 2023), clearly show that decentralized ledgers provide a robust shield against corruption in land registries. The problem is that traditional, centralized systems create "honesty silos" they are only as secure as the person holding the database keys. (Agi & Jha, 2023) argue that blockchain changes this by decentralizing the "Source of Truth," making it technically impossible for a single administrator to silently alter records. In this chapter, we look at how current systems operate and why they often fail the transparency test.
## 2.1. Review of Existing Systems/Products

### 2.1.1. Land Revenue Management System (LRIMS/NeLIS) – Nepal
If you walk into any *Malpot* office today, you will likely see staff using the Land Revenue Management System (LRIMS) or NeLIS. It was a huge leap forward when introduced by the DOLRM, finally moving us away from dusty, purely paper-based tracking by integrating biometric data (Shrestha, Gyawali & Shrestha, 2023). But here is the catch: because it relies on a central server, it has a single point of failure. Recent cyberattacks (DDoS) on the government's main server have paralyzed hundreds of websites at once, highlighting how fragile this centralization is (Post Report, 2024). A single technical glitch or attack can freeze services or manipulate records without an external audit trail. For the average citizen, it remains a "black box" where one must simply trust that the database matches reality.

### 2.1.2. Exonum Land Registry – Georgia
Georgia was arguably the first nation to really go all-in on blockchain for land titles. They partnered with Bitfury to use the Exonum framework, which "anchors" their private registry data to the public Bitcoin blockchain (Shin, 2017). Think of it as a digital notary that stamps a record every few minutes. This cryptographic timestamp is powerful because it proves a document existed at a certain time, making it incredibly hard to fake history. However, the Georgian model is still very top-down. It acts more like a secure backup for the government than a tool for the people (Shang & Price, 2019). Citizens can’t really interact with it peer-to-peer. While it’s a massive step for institutional trust, BhuChain wants to push that further by decentralizing the actual transaction, not just the receipt.

### 2.1.3. Lantmäteriet – Sweden
Sweden’s mapping authority, Lantmäteriet, ran a fascinating pilot to streamline the endless paperwork of buying a house. By putting banks, realtors, and the registry on a private blockchain (ChromaWay), they aimed to drastically reduce the risk and processing time of transactions, which currently suffer from significant delays (Kempe, 2016). It is slick, efficient, and heavy on digital signatures. But we have to be realistic—Sweden operates on high institutional trust. People there generally trust their banks and government implicitly. That is a luxury we don't fully have yet in Nepal. BhuChain borrows their "workflow automation" logic but adapts it for a low-trust environment where the code itself has to provide the integrity that institutions sometimes fail to deliver.

### 2.1.4. Bitland – Ghana
Bitland is tackling a problem that feels very close to home for us: "dead capital." In Ghana, vast tracts of land exist without clear titles, meaning they can't be used as collateral for loans. Working in areas where power outages ("rolling blackouts") are common, Bitland proposed using solar-powered hubs to maintain a decentralized ledger of land rights (Aitken, 2016). Their main enemy is corruption and the disenfranchisement of informal settlers. This mirrors our exact goal with BhuChain empowerment. The tricky part for them has been getting full legal recognition for these digital titles (Agbesi & Tahiru, 2020), a gap we are aiming to bridge by aligning with Nepal’s *Malpot* legal framework right from day one.

## 2.2. Research Gap/Innovation Justification
While the review of existing systems highlights significant strides in digitizing land administration, a critical gap remains for developing nations like Nepal. Current implementations generally fall into two categories: centralized digitization or high-trust blockchain pilots. Nepal's LRIMS/NeLIS represents the former; while it has modernized record-keeping, it leaves the core vulnerability of centralized control unaddressed, maintaining a "black box" susceptible to manipulation and failure (Shrestha et al., 2023; Post Report, 2024). Conversely, blockchain pioneers like Sweden’s Lantmäteriet rely on pre-existing institutional trust to automate workflows (Kempe, 2016), a luxury that is not yet present in Nepal’s bureaucratic landscape. Similarly, while models like Georgia’s Exonum successfully secure data, they function primarily as a state-sanctioned backup rather than a fully transparent peer-to-peer network (Shang & Price, 2019).

Therefore, there is an absence of a unified framework that combines the transparency of a decentralized public ledger with the specific legal enforceability required by Nepal's *Malpot* system. Projects like Bitland in Ghana have attempted to address similar issues of "dead capital" (Aitken, 2016), but often struggle with formal legal integration. BhuChain aims to bridge this specific divide. Our innovation lies in moving beyond simple data storage to automating the "Logic of Law." By embedding the strict rules of a *Rajinama* (land transfer) directly into immutable smart contracts, BhuChain replaces reliance on potentially corruptible human intermediaries with algorithmic verification, ensuring that ownership changes only when every legal condition is cryptographically met.

3.	SYSTEM ANALYSIS AND DESIGN
This chapter details the systematic approach taken to design the BhuChain architecture, ensuring it meets the unique constraints of Nepal's land administration environment while leveraging decentralized technology.
## 3.1. Feasibility Study
The feasibility of the BhuChain project was analyzed across five key dimensions to ensure its practical viability in Nepal.
### 3.1.1. Technical Feasibility 
The stack we have chosen Ethereum, React, and Django is industry-standard. React's widespread adoption; nearly 40% of web devs as per (Stack Overflow, 2024) means we have plenty of resources to solve frontend hurdles. On the blockchain side, Ethereum's ecosystem provides the most mature environment for smart contracts. Locally, the numbers are also in our favor. With internet penetration in Nepal hitting 50% and nearly 3 out of 4 people owning a smartphone (National Statistics Office (NSO), 2024), the basic infrastructure for a web-based DApp is already in place.
### 3.1.2. Operational Feasibility
Is the system easy to use for a Malpot clerk? To ensure this, we’ve designed the React frontend to mirror the layout of familiar government forms. By separating "Verification" (Admin) from "Public Search," we keep the workflow logical. Our goal is to augment, not disrupt, the officer's job. Automated validation checks actually save them time, reducing the mental load of manual verification.
### 3.1.3. Economic Feasibility
Building on blockchain might seem expensive, but the long-term math works. Traditional data centers require massive budgets for security and redundancy. Blockchain provides this for "free" through its distributed nature. Studies on the Georgian project (Shang & Price, 2019) suggest that these systems can cut reconciliation costs by 90%. In our case, starting on a testnet costs nothing, and a future deployment would be self-sustaining through transaction fees paid by the users, not the taxpayer.
### 3.1.4. Legal and Ethical Feasibility
BhuChain fits surprisingly well into Nepal's legal landscape. The Electronic Transactions Act (2063) already gives legal weight to digital signatures (Government of Nepal, 2006), which is essentially what we use in our DApp. We are also careful to stay within the Nepal Rastra Bank (NRB) guidelines by using non-monetary tokens for the Registry, keeping the focus on property rights rather than unregulated crypto-trading.
### 3.1.5. Schedule Feasibility
Since we are using modern rapid-development tools like Vite for the frontend and OpenZeppelin for the smart contracts, we are confident the core features Registration, Transfer, and Search will be ready for demonstration within the academic semester.
## 3.2. Requirements Specification
Building BhuChain isn't just about the technology; it’s about meeting the specific needs of the people using it. We have broken down the requirements into two categories: what the system must do (Functional) and how well it must perform (Non-Functional).
### 3.2.1. Functional Requirements
Functional requirements define the specific behaviors and services the system must provide to ensure a seamless and secure digital land registry.
*   **Secure Identity Management:** Users authenticate using their unique cryptographic wallets (MetaMask), allowing the platform to distinguish between ordinary citizens and authorized Land Revenue Officers for role-based access.
*   **Asset Initialization:** Only verified government officers possess the power to initialize new land assets on the blockchain, creating a digital record that includes the parcel ID, physical area, and legal owner.
*   **Guaranteed Ownership Transfer:** The system facilitates a tamper-proof handoff between a buyer and seller through a mutual cryptographic agreement, ensuring no record is updated without explicit consent from both parties.
*   **Transparent Public Search:** Citizens can bypass traditional administrative queues by using a searchable portal to instantly verify the ownership history and current status of any Kitta using its unique digital ID.
*   **Automated Logic Enforcement:** Smart contracts act as objective judges, automatically validating that a seller has the legal right to a parcel before any transfer request can be initiated or processed.

### 3.2.2. Non-Functional Requirements
To be a viable successor to traditional systems, BhuChain must also adhere to strict quality and performance standards.
*   **Immutability and Distributed Trust:** Once a transaction is mined into the blockchain, it becomes a permanent record that cannot be deleted or hidden, providing a "Source of Truth" that remains safe even if central servers fail.
*   **User-Centric Interface:** The application’s design prioritizes usability, mirroring familiar government forms and workflows to ensure the transition to a decentralized platform feels intuitive for all users.
*   **High System Reliability:** By leveraging the decentralized nature of the Ethereum network, BhuChain eliminates single points of failure, ensuring the registry remains accessible even during peak usage or server maintenance.
*   **Privacy-Preserving Architecture:** To protect citizens, sensitive personal metadata is kept off the public ledger and stored in a secure, encrypted Django backend, ensuring that only critical ownership data is distributed.
## 3.3. System Design
The design of BhuChain follows a "Hybrid" model. We use the blockchain for the things that need to be permanent (ownership) and a traditional backend for the things that need to be fast and private (user profiles).
### 3.3.1. System Architecture
BhuChain is built on three layers. The Presentation Layer (React.js) is what the user sees. It talks directly to the user's wallet (MetaMask) to sign transactions. The Application Layer (Django) acts as the bridge; it handles the heavy lifting of user management and caches blockchain data so the app feels fast. Finally, the Blockchain Layer (Ethereum/Solidity) is where the real work happens. This is where our Smart Contracts live, acting as the permanent "Source of Truth" for every plot of land in the system.

**Figure 3.1: System Architecture Diagram**

### 3.3.2. Use Case Diagram
Our system has three main actors. The Citizen is the primary user who searches for land and initiates transfers. The Land Revenue Officer (Admin) is the gatekeeper who verifies that the legal papers are in order before a transfer is finalized. Finally, the System Admin makes sure the underlying infrastructure is healthy. Every action starts with the "Connect Wallet" use case, which ensures that every user is identified cryptographically.

Figure 3.2: Use Case Diagram

### 3.3.3. Data Flow Diagrams (DFD)
We’ve mapped out how data moves from the user’s screen to the blockchain.
Level 0 (Context)
Shows the big picture how citizens send in registration requests and officers send back approvals.
 
Figure 3.3: Level 0 DFD

Level 1 DFD
Level 1 (Logical Flow): Breaks the system down into five steps: from logging in with a wallet, to submitting a land deed, and finally watching the smart contract update the ledger. This flow ensures that no data reaches the blockchain without being properly validated first.
Figure 3.4: Level 1 DFD

### 3.3.4. ER Diagram
Our data model is built on a hybrid philosophy: we separate what needs to be public and permanent from what needs to be private and flexible.
Off-Chain Strategy (Django Database): The off-chain database handles the "paperwork" of the system. We have a User entity that stores the real-world identity (like citizenship numbers) linked to a unique wallet address. This is connected to the Registration_Application entity, which acts as a staging area for land records. Before any data hits the blockchain, it sits here as a "Pending" request, allowing an officer to review the uploaded deeds. To keep the officers accountable, we also have an Admin_Action_Log that records every single approval or rejection, creating a clear trail of responsibility.
On-Chain Strategy (The Ledger): The blockchain layer is where the "Source of Truth" lives. We define a Land_Parcel as an immutable digital asset. Every parcel has a unique ID, a fixed area, and a specific wallet address assigned as the owner. Next to this is the Ownership_Transfer_Event ledger. This isn't a table in the traditional sense; it’s a chronological stream of events that proves exactly when and to whom a piece of land was sold. Together, these entities ensure that once a plot of land is registered, its history can never be rewritten.
 
Figure 3.5 ER Diagram

### 3.3.5. Sequence Diagram
The Sequence Diagram maps out the most critical journey in our system: the Transfer of Ownership. This process is a coordinated dance between the Citizen, the Officer, and the Smart Contract.
It starts when a Seller initiates a transfer on the frontend. After they sign the request using MetaMask, the request is stored in our database. The Land Officer then receives a notification, performs a manual check of the legal documents, and if everything is correct submits an "Approval" transaction to the blockchain. The Smart Contract then takes over. It validates the officer’s signature, checks that the seller actually owns the land, and updates the ledger. This sequence ensures that while the process is fast, it still includes the necessary legal checks required by Nepal's land laws.

Figure 3.6 Sequence Diagram


### 3.3.6. Class Diagram
The structure of our code is designed to keep the blockchain logic separate from the web logic.
On the Blockchain (Solidity): The LandRegistry contract is the brain of the system. It manages the Parcel objects and enforces the rules of the registry. We’ve implemented strict modifiers like onlyAdmin to ensure that only verified officers can register new land, while anyone can use the public getter functions to verify ownership.
In the Backend (Python/Django): Our backend code focuses on managing the user experience. The UserProfile class handles the link between a web account and a blockchain wallet. The RegistrationApplication class manages the lifecycle of a request, from "Submitted" to "Mined." Finally, the AdminActionLog class provides a persistent record of administrative behavior. By separating these concerns, we ensure that the system is both secure on the blockchain and responsive on the web.


Figure 3.7 Class Diagram

### 3.3.7. Database Schema
The database schema acts as the blueprint for how we handle both our private off-chain data and our immutable on-chain records. I have designed this structure to ensure that while we benefit from blockchain security, our system remains fast and user-friendly by offloading non-critical metadata to a traditional relational database.
User Profile Table
This table is where we bridge the gap between a digital wallet and a real-world citizen. Since an Ethereum address is just a string of hex characters, we need this table to store the actual identity like the legal name and government-issued citizenship number. This is crucial for our Know Your Customer (KYC) process; without this link, an officer wouldn't know if a wallet address belongs to a legitimate landowner or someone attempting impersonation.
Table 3.1 User Profile Table
Field Name	Data Type	Constraint	Description
id	Integer	PK, Auto-Inc	Unique internal database ID
wallet_address	Varchar(42)	Unique, Not Null	Ethereum Wallet Address (0x...)
citizenship_no	Varchar(20)	Unique, Not Null	Government Citizenship ID
full_name	Varchar(100)	Not Null	Legal Name of the user
email	Varchar(255)	Unique, Not Null	Contact Email Address
role	Varchar(10)	Not Null	'Citizen' or 'Officer'
is_verified	Boolean	Default=False	KYC Verification Status

 
Registration Application Table
Writing data to the blockchain is both slow and expensive. Therefore, we use this table as a "staging area." When a citizen wants to register a new plot or transfer an old one, their request and the path to their digital deeds sits here first. This gives the Malpot officer a chance to review the documents off-chain before "minting" the final record onto the permanent ledger.
Table 3.2 Registration Application Table
Field Name	Data Type	Constraint	Description
app_id	Integer	PK, Auto-Inc	Unique Application ID
user_id	Integer	FK (User Profile)	Link to the Applicant
parcel_id	Integer	Nullable	Link to Blockchain Parcel ID (if valid)
document_path	Varchar(255)	Not Null	Server path to stored deed image
status	Varchar(20)	Default='Pending'	Workflow: Pending, Approved, Rejected
created_at	DateTime	Auto-Now	Submission timestamp

Admin Action Log Table
To solve the issue of administrative fraud, we need to keep the officers themselves accountable. This table serves as an internal audit trail. Every time an officer clicks "Approve" or "Reject," we record the who, when, and why. Even if the main database were technically editable, having this dedicated log makes it much harder to manipulate records without leaving a clear trail of responsibility.

Field Name	Data Type	Constraint	Description
log_id	Integer	PK, Auto-Inc	Unique Log ID
admin_id	Integer	FK (User Profile)	Link to the Officer performing action
app_id	Integer	FK (Application)	Link to the Target Application
action_type	Varchar(50)	Not Null	E.g., 'APPROVED_TRANSFER', 'REJECTED_KYC'
remarks	Text	Nullable	Reason for rejection/approval
timestamp	DateTime	Auto-Now	Exact time of the action

Smart Contract Storage Layout (On-Chain) 
These aren't traditional tables, but rather state variables stored directly on the Ethereum virtual machine. Once something is written here, it is mathematically locked and cannot be changed by anyone not even the system administrator.
Land Parcel Storage (mapping(uint => Parcel))
This is the heart of BhuChain. It’s a permanent key-value mapping where each unique Parcel ID is tied to its owner’s wallet address and the land’s physical dimensions. Unlike the Django database, this mapping is public; anyone with a blockchain explorer can verify that a specific plot belongs to a specific wallet, removing the need to "trust" the clerk's word.

Table 3.3 Land Parcel Storage
Field Name	Solidity Type	Description
parcel_id	uint256	The unique Token ID acting as the Primary Key
owner	address	The wallet address of the current legal owner
location	string	Physical address (District/Ward)
area	uint256	Square footage of the land
isLocked	bool	Locking mechanism to prevent double-spending during transfer
Authorized Officers List (mapping(address => bool)) 
We use this mapping to enforce the laws of our system. It acts as a "white-list" of wallet addresses that belong to legitimate government officials. Only addresses that are marked as true in this mapping are allowed to execute the code that registers new land or approves a transfer. This ensures that the decentralized network still respects the authoritative role of the Land Revenue Office.
Table 3.4 Authorized Officers List
Field Name	Solidity Type	Description
officer_address	address	Wallet address of the Land Revenue Officer
is_authorized	bool	True if the officer currently holds valid permissions


### 3.3.8. UI/UX Wireframes
To ensure the system remains accessible to both tech-savvy users and traditional office staff, we have designed a clean, task-oriented user interface. The following wireframes represent the core screens of the BhuChain application:
Landing Portal & Wallet Integration
This is the entry point where the philosophy of BhuChain is introduced. It features a prominent "Explore Records" button for public access and a "Connect Wallet" option for authenticated users. The design emphasizes simplicity, using MetaMask's intuitive popup to handle the decentralized login without traditional passwords.

**Figure 3.8: Landing Page Wireframe**

Citizen Dashboard
Once logged in, a citizen can see a visual summary of their property. We’ve designed this to look like a digital Lalpurja wallet, displaying cards for each parcel they own. From here, they can initiate a transfer or view the verified digital deed.

**Figure 3.9: Citizen Dashboard Page Wireframe**


Public Land Search
Transparency is the key here. We provide a simple, Google-like search bar where anyone can type in a Kitta (Parcel) ID. The result is a "Chain of Title" display that shows exactly who has owned the land and when, providing instant confidence for potential buyers.
 
Figure 3.10 Public Land Search Page Wireframe


Ownership Handoff (Transfer Form)
For a seller, this screen is the core of their experience. They select a plot, enter the buyer's wallet address, and click "Sign & Move." This triggers a secure transaction request that ensures both parties are acting with full cryptographic consent.
 
Figure 3.11 Transfer Initiation Form Wireframe
Malpot Officer Dashboard
Government staff need a high-level view of their daily tasks. Their dashboard features a real-time feed of "Incoming Verification Requests." We use color-coded status badges (Pending, Approved, Rejected) to help them prioritize applications quickly.
 
Figure 3.12 Land Officer Dashboard Wireframe






Application Verification Screen
This is where the digital meets the legal. On a split-screen view, the officer can see the uploaded document on the left and a checklist of smart contract parameters on the right. With one final click on "Approve & Mint," they permanently record the validated data onto the blockchain.
 
Figure 3.13 Application Verification Screen Wireframe






### 3.3.9. Technology Stack
To build a system as sensitive as a land registry, we cannot rely on a single technology; we need a "Hybrid" stack that balances the absolute security of a blockchain with the speed of a modern web application. This selection is based on the following explicit requirement analysis:

1. **Requirement: Immutable Ownership Ledger (Blockchain - Solidity & Ethereum)** 
For the core "Source of Truth," we chose Solidity on Ethereum. We develop these smart contracts in the Hardhat environment, allowing us to rigorously simulate and test the logic of land transfers in a local sandbox before they ever touch a live network. This ensures that the requirement for a tamper-proof ownership history is mathematically guaranteed and cryptographically secure.

2. **Requirement: Secure Data Management & API Services (Backend - Django & Python)** 
Supporting the blockchain is a Django backend, selected specifically for its "batteries-included" security model. While the blockchain handles the immutable ledger, Django acts as the secure gatekeeper for the requirement of handling off-chain data like user profiles and document storage, protecting the system against common web vulnerabilities like SQL injection that often plague government portals.

3. **Requirement: Responsive and Accessible User Experience (Frontend - React.js & Vite)** 
On the user-facing side, the priority was to make complex crypto-logic invisible to the average *Malpot* officer or citizen. We implemented the interface using React.js and Vite, favoring their component-based architecture to fulfill the requirement for a snappy and familiar dashboard that is usable for common citizens, not just developers.

4. **Requirement: Cryptographic Identity & Authorization (Authentication - MetaMask)** 
Crucially, we replaced traditional password logins with MetaMask to address the requirement for secure, non-custodial authentication. This integration turns the user’s browser into a secure cryptographic wallet, ensuring that every sensitive action, such as approving a deed transfer, is signed by a private key that only the rightful owner possesses, eliminating the risks associated with centralized identity management.

4.	IMPLEMENTATION PLAN
## 4.1. Development Methodology
For a blockchain project like this, I have chosen the Agile (Scrum) approach. This iterative style is perfect because blockchain development has a unique "finality" to it. Once you deploy a smart contract to a real network, you can’t exactly go back and fix a typo. By working in short sprints, I can build and test the Solidity logic in isolation before I even start on the frontend. This ensures that the security of our "Source of Truth" is solid from day one. Agile also lets me refine the user interface based on ongoing testing, making sure the final DApp is actually usable for a common citizen, not just a developer.
## 4.2. Module Breakdown
The architectural integrity of BhuChain is maintained through four primary functional modules that work in concert to bridge the gap between traditional identity and decentralized assets. The **Identity & Access Module (IAM)** serves as the entry point, forming the critical link between a user's cryptographic wallet address and their verified real-world persona while handling role-based navigation. Once authenticated, the **Land Asset Module** takes over as the core engine of the system, housing the smart contract logic that governs the lifecycle of land parcels and enforces the rules of ownership. Supporting this is the **Registration Workflow Module**, which manages the "pre-blockchain" staging area where citizens upload their digitized deeds and government officers perform the necessary manual reviews. Finally, the **Public Verification & Audit Module** ensures total transparency by allowing anyone to query the blockchain directly for Parcel IDs while maintaining an off-chain log of all administrative actions to prevent any abuse of power.
## 4.3. Tools, Platforms, and Languages
To translate this theoretical framework into a functional prototype, we have assembled a development stack that prioritizes security, speed, and decentralized integrity. The backbone of our system is written in a trio of core languages: **Solidity** for the self-executing smart contracts on the blockchain, **Python** for the robust Django backend, and modern **JavaScript** for the dynamic React-based user interface. This linguistic foundation is enhanced by industrial-strength frameworks, including **React.js** and **Vite** for the frontend, the **Django REST Framework** for our secure internal APIs, and **Ethers.js** to handle the complex communication between the browser and the Ethereum network.

The storage strategy is equally calculated, utilizing **PostgreSQL** to manage the high volume of sensitive off-chain metadata while relying on the **Ethereum State Mapping** as the ultimate, immutable ledger for property records. All development and testing are conducted within the **Hardhat** environment and coded in **Visual Studio Code**, ensuring we can iron out technical hurdles in a simulated network before any real transactions occur. Finally, the entire project lifecycle is managed through **Git** for version control, with **MetaMask** serving as the primary gateway for identity management and cryptographic transaction signing.

## 4.4. Project Timeline (Gantt Chart)
Development of BhuChain follows a structured Agile methodology. This framework uses iterative sprints to refine smart contracts, backend logic, and the user interface at the same time. The Gantt chart below shows the specific order and links between each stage of the project.
 

## 4.5. Risk Analysis
Given the sensitive nature of land data and the immutable character of blockchain, we have identified several critical risks that could impact the BhuChain project. On the technical front, the most significant threat stems from potential vulnerabilities in our smart contracts. To safeguard against this, we are strictly following OpenZeppelin security standards and conducting exhaustive unit testing within the Hardhat environment before any deployment. Similarly, the complexity of bridging our React frontend with the Ethereum blockchain is a known hurdle. We have dedicated a specific window for integration testing and early prototyping of Ethers.js connections to ensure that the "Source of Truth" remains accessible and secure. We are also prioritizing the security of our off-chain PostgreSQL database by leveraging Django’s built-in cryptographic hashing and middleware protection to prevent unauthorized data breaches.

Beyond the code, we must also account for the risk of development delays as we approach the deadline. To mitigate this, we are employing an Agile Scrum methodology, which allows us to focus on delivering a Minimum Viable Product (MVP) first. This iterative approach ensures that even if we face unexpected technical bottlenecks, the core registry functionality will be polished and ready on time. Finally, to handle potential API dependency failures or external service outages, we have built robust error-handling mechanisms into the React frontend, ensuring the system provides clear feedback to the user rather than failing silently. These proactive measures allow us to move forward with confidence, knowing that the most likely points of failure have been addressed through architectural and procedural safeguards.


5.	EXPECTED OUTCOMES AND LIMITATIONS
## 5.1. Expected Product Features
The primary outcome of the BhuChain project is a fully functional decentralized application (DApp) that serves as a modern bridge between traditional land administration and blockchain security. At its core, the system provides an immutable land registry where parcel details, ownership lineages, and area specifications are anchored permanently on the Ethereum blockchain, making unauthorized tampering technically impossible. Users interact with this ledger through a seamless integration with MetaMask, which facilitates non-custodial authentication and transaction signing without relying on centralized passwords. The ecosystem is completed by a dual-access architecture: an Administrative Oversight Dashboard where government officers can securely review digitized proofs like citizenship and deeds, and a Public Verification Portal that allows any citizen to verify property data independently and transparently. This hybrid approach ensures that sensitive personal metadata remains secure in a PostgreSQL database while the "Source of Truth" for ownership remains distributed and public.

## 5.2. User Benefits and Impact
Deploying BhuChain is expected to fundamentally transform how land is registered and verified in Nepal by introducing unprecedented transparency and speed. By moving the "Master Record" from a vulnerable central server to a decentralized ledger, the system effectively eliminates the risk of hidden record alterations and duplicate registrations. For the average citizen, this means the end of exhausting, multi-day visits to *Malpot* offices for simple status checks; instead, property data can be verified from any smartphone or computer. This digital transition doesn't just benefit the public; it streamlines the government's internal workflow as well, replacing manual paper searches with instant cryptographic audits. Furthermore, the hybrid design ensures that the platform remains scalable and cost-effective, keeping the blockchain data footprint lean while off-loading heavier documentation to traditional secure storage.

## 5.3. Limitations of the System
While BhuChain establishes a robust foundation for decentralized land registries, it is important to acknowledge the constraints inherent in this initial prototype. Currently, the most significant hurdle for widespread adoption is the reliance on external Web3 wallets like MetaMask, which necessitates a baseline level of digital literacy that many citizens may not yet possess. From a technical standpoint, while ownership records are decentralized, the larger document files—such as scanned deed images—are still stored on a localized server rather than a distributed network like IPFS, presenting a temporary single point of failure for metadata. Additionally, due to current regional banking regulations, land payments and taxes are handled through traditional channels and require manual administrative verification before the final on-chain transfer is triggered. Finally, as the prototype is optimized for the Hardhat testing environment, a move to the public Ethereum Mainnet would require significant further optimization to handle the associated gas fees and transaction latencies.

6.	CONCLUSION
This final chapter summarizes the main findings of the project and looks at how the system can be improved in the future.
## 6.1. Summary of the Proposed Work
The BhuChain project was started to fix major problems in the traditional land registration systems of Nepal. These issues include document tampering, fraud, and slow administrative work. By using a hybrid blockchain design, the project successfully combines official records with digital security. The system uses Ethereum for permanent ownership data, Django for managing user info, and React for a simple user interface.
This work is important because it builds trust through a digital identity model using MetaMask and a public record of ownership. Even in a test environment, the results show that a decentralized registry can stop ownership fraud and make property checks faster. BhuChain serves as a practical example of how to modernize government services and protect property rights in a transparent way.
## 6.2. Future Scope
While BhuChain establishes a basic framework for land registration, there are many ways to expand the system. One option is to integrate decentralized storage like IPFS to store legal deeds and citizenship documents. This would remove the need for a central server. The system could also be linked to national digital IDs like the Nagarik App to make the identity verification process easier for citizens.
Other future improvements include using machine learning to provide automated property valuations based on market trends. The platform could also include smart tax payment modules that work with digital currencies or bank gateways. Finally, developing a native mobile application would help people in rural areas access land services more easily.
 
