// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BhuChain {
    address public admin;

    struct LandParcel {
        uint256 id;
        string location;
        uint256 area;
        address owner;
        bool isLocked; // Added as per Proposal Table 3.3
    }

    mapping(uint256 => LandParcel) public parcels;
    mapping(address => bool) public isOfficer; // List of authorized government officers
    uint256 public parcelCount;
    string public name = "BhuChain Land Registry";

    // Modifier: The "Security Guard" checkpoint
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        isOfficer[msg.sender] = true; // The admin is the first officer
    }

    function addOfficer(address _officerAddress) public onlyAdmin {
        isOfficer[_officerAddress] = true;
    }

    // 4. Function for Officers to register land on behalf of Citizens
    function addParcel(address _owner, string memory _location, uint256 _area) public {
        require(isOfficer[msg.sender], "Only authorized officers can register land");
        parcelCount++;
        parcels[parcelCount] = LandParcel(parcelCount, _location, _area, _owner, false);
    }

    // 5. Improved Transfer: Uses isLocked to prevent double-spending/race conditions
    function transferOwnership(uint256 _id, address _newOwner) public {
        // A. Security Checks
        require(msg.sender == parcels[_id].owner, "You are not the owner of this parcel");
        require(!parcels[_id].isLocked, "Transaction already in progress for this parcel");

        // B. State Change (Lock the parcel)
        parcels[_id].isLocked = true;

        // C. Update Ownership
        parcels[_id].owner = _newOwner;

        // D. Finality (Unlock for the next owner)
        parcels[_id].isLocked = false;
    }
}