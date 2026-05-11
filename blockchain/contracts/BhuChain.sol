// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import battle-tested security libraries from OpenZeppelin
// Ownable: Provides secure admin access control
// ReentrancyGuard: Protects against double-spending attacks
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// BhuChain Land Registry - Blockchain-based land registration system for Nepal
contract BhuChain is Ownable, ReentrancyGuard {
    // Land Parcel record
    struct LandParcel {
        uint256 id;          // Unique identifier for this parcel
        string location;     // Physical address (e.g., "Kathmandu, Ward 5")
        uint256 area;        // Land area in square meters
        address owner;       // Wallet address of the current legal owner
        bool isLocked;       // Lock flag — prevents transfers during dispute/investigation
    }

    // Authorization events
    event OfficerAdded(address indexed officerAddress);
    event ParcelRegistered(
        uint256 indexed parcelID,
        address indexed owner,
        string location,
        uint256 area
    );
    event ParcelOwnershipTransferred(
        uint256 indexed parcelID,
        address indexed oldOwner,
        address indexed newOwner
    );

    event ParcelLocked(uint256 indexed parcelID, address indexed lockedBy);

    /**
     * @dev Emitted when a parcel lock is lifted by an authorized officer
     * @param parcelID The ID of the unlocked parcel
     * @param unlockedBy The officer address that lifted the lock
     */
    event ParcelUnlocked(uint256 indexed parcelID, address indexed unlockedBy);
    
    /// @dev Maps parcel IDs to their corresponding LandParcel data
    mapping(uint256 => LandParcel) public parcels;
    
    /// @dev Tracks which wallet addresses belong to authorized Land Revenue Officers
    mapping(address => bool) public isOfficer;
    
    /// @dev Counter for total number of registered parcels (also serves as next parcel ID)
    uint256 public parcelCount;
    
    /// @dev Human-readable name of this registry
    string public name = "BhuChain Land Registry";

    
    constructor() Ownable(msg.sender) {
        isOfficer[msg.sender] = true;
    }
    
    // Authorize a new Land Revenue Officer
    function addOfficer(address _officerAddress) public onlyOwner {
        isOfficer[_officerAddress] = true;
        emit OfficerAdded(_officerAddress);
    }
    
    function addParcel(
        address _owner,
        string memory _location,
        uint256 _area
    ) public {
        require(
            isOfficer[msg.sender],
            "Only authorized officers can register land"
        );
        
        parcelCount++;
        
        parcels[parcelCount] = LandParcel(
            parcelCount,
            _location,
            _area,
            _owner,
            false  // isLocked defaults to false on registration
        );

        emit ParcelRegistered(parcelCount, _owner, _location, _area);
    }

    function lockParcel(uint256 _id) public {
        require(
            msg.sender == parcels[_id].owner || isOfficer[msg.sender],
            "Only the owner or an officer can lock this parcel"
        );
        require(!parcels[_id].isLocked, "Parcel is already locked");

        parcels[_id].isLocked = true;
        emit ParcelLocked(_id, msg.sender);
    }

    function unlockParcel(uint256 _id) public {
        require(
            isOfficer[msg.sender],
            "Only an authorized officer can unlock a parcel"
        );
        require(parcels[_id].isLocked, "Parcel is not locked");

        parcels[_id].isLocked = false;
        emit ParcelUnlocked(_id, msg.sender);
    }

    function transferParcelOwnership(uint256 _id, address _newOwner) public nonReentrant {
        require(
            msg.sender == parcels[_id].owner,
            "You are not the owner of this parcel"
        );
        require(
            !parcels[_id].isLocked,
            "This parcel is locked and cannot be transferred. Contact the Land Revenue Office."
        );

        address oldOwner = parcels[_id].owner;
        parcels[_id].owner = _newOwner;

        emit ParcelOwnershipTransferred(_id, oldOwner, _newOwner);
    }
}