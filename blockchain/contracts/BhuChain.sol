// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import battle-tested security libraries from OpenZeppelin
// Ownable: Provides secure admin access control
// ReentrancyGuard: Protects against double-spending attacks
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BhuChain Land Registry
 * @dev A blockchain-based land registration system for Nepal
 * @notice This contract manages land parcels with tamper-proof ownership records
 */
contract BhuChain is Ownable, ReentrancyGuard {
    
    // ============ DATA STRUCTURES ============
    
    /**
     * @dev Represents a single piece of land in the registry
     * @notice Each parcel has a unique ID and immutable ownership history
     */
    struct LandParcel {
        uint256 id;          // Unique identifier for this parcel
        string location;     // Physical address (e.g., "Kathmandu, Ward 5")
        uint256 area;        // Land area in square meters
        address owner;       // Wallet address of the current legal owner
    }

    // ============ EVENTS ============
    
    /**
     * @dev Emitted when a new Land Revenue Officer is authorized
     * @param officerAddress The wallet address of the newly authorized officer
     */
    event OfficerAdded(address indexed officerAddress);

    /**
     * @dev Emitted when a new land parcel is registered on the blockchain
     * @param parcelID The unique ID assigned to this parcel
     * @param owner The wallet address of the citizen who owns this land
     * @param location The physical location of the land
     * @param area The size of the land in square meters
     */
    event ParcelRegistered(
        uint256 indexed parcelID,
        address indexed owner,
        string location,
        uint256 area
    );

    /**
     * @dev Emitted when land ownership is transferred from one citizen to another
     * @param parcelID The ID of the parcel being transferred
     * @param oldOwner The previous owner's wallet address
     * @param newOwner The new owner's wallet address
     */
    event ParcelOwnershipTransferred(
        uint256 indexed parcelID,
        address indexed oldOwner,
        address indexed newOwner
    );

    // ============ STATE VARIABLES ============
    
    /// @dev Maps parcel IDs to their corresponding LandParcel data
    mapping(uint256 => LandParcel) public parcels;
    
    /// @dev Tracks which wallet addresses belong to authorized Land Revenue Officers
    mapping(address => bool) public isOfficer;
    
    /// @dev Counter for total number of registered parcels (also serves as next parcel ID)
    uint256 public parcelCount;
    
    /// @dev Human-readable name of this registry
    string public name = "BhuChain Land Registry";

    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Initializes the contract and sets the deployer as the first officer
     * @notice The deployer automatically becomes the contract owner (via Ownable)
     */
    constructor() Ownable(msg.sender) {
        // Make the contract deployer the first authorized officer
        isOfficer[msg.sender] = true;
    }

    // ============ ADMINISTRATIVE FUNCTIONS ============
    
    /**
     * @dev Authorizes a new Land Revenue Officer
     * @param _officerAddress The wallet address to be granted officer privileges
     * @notice Only the contract owner (admin) can call this function
     */
    function addOfficer(address _officerAddress) public onlyOwner {
        isOfficer[_officerAddress] = true;
        emit OfficerAdded(_officerAddress);
    }

    // ============ LAND REGISTRATION ============
    
    /**
     * @dev Registers a new land parcel on behalf of a citizen
     * @param _owner The wallet address of the citizen who owns this land
     * @param _location The physical location of the land
     * @param _area The size of the land in square meters
     * @notice Only authorized officers can register land
     * @notice This function creates a permanent, tamper-proof record
     */
    function addParcel(
        address _owner,
        string memory _location,
        uint256 _area
    ) public {
        // Security: Verify that the caller is an authorized officer
        require(
            isOfficer[msg.sender],
            "Only authorized officers can register land"
        );
        
        // Increment the counter to generate a new unique parcel ID
        parcelCount++;
        
        // Store the parcel data permanently on the blockchain
        parcels[parcelCount] = LandParcel(
            parcelCount,
            _location,
            _area,
            _owner
        );

        // Broadcast the registration event for off-chain listeners (frontend/backend)
        emit ParcelRegistered(parcelCount, _owner, _location, _area);
    }

    // ============ OWNERSHIP TRANSFER ============
    
    /**
     * @dev Transfers land ownership from one citizen to another
     * @param _id The unique ID of the parcel to transfer
     * @param _newOwner The wallet address of the new owner
     * @notice Only the current owner can initiate a transfer
     * @notice Protected against reentrancy attacks via OpenZeppelin's nonReentrant modifier
     */
    function transferParcelOwnership(uint256 _id, address _newOwner) public nonReentrant {
        // Security: Verify that the caller is the current owner
        require(
            msg.sender == parcels[_id].owner,
            "You are not the owner of this parcel"
        );

        // Capture the old owner's address for the event log
        address oldOwner = parcels[_id].owner;

        // Update the ownership record on the blockchain
        parcels[_id].owner = _newOwner;

        // Broadcast the transfer event for transparency and auditability
        emit ParcelOwnershipTransferred(_id, oldOwner, _newOwner);
    }
}