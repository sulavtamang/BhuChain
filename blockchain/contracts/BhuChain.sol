// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BhuChain {
    address public admin;

    struct LandParcel {
        uint256 id;
        string location;
        uint256 area;
        address owner;
    }

    mapping(uint256 => LandParcel) public parcels;
    mapping(address => bool) public isOfficer; // List of authorized government officers
    uint256 public parcelCount;
    string public name = "BhuChain Land Registry";

    // Modifer: The "Security Guard" checkpoint
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can perform this action");
        _;
    }

    // Constructor: Runs only once when the contract is born
    constructor() {
        admin = msg.sender;
        isOfficer[msg.sender] = true; // The admin is the first officer
    }

    // Function for the Admin to add new Land Revenue Officers
    function addOfficer(address _officerAddress) public onlyAdmin {
        isOfficer[_officerAddress] = true;
    }

    // Updated addParcel: Restricted to Authorized Officers only
    function addParcel(string memory _location, uint256 _area) public {
        require(isOfficer[msg.sender], "Only authorized officers can register land");
        parcelCount++;
        parcels[parcelCount] = LandParcel(parcelCount, _location, _area, msg.sender);
    }

    function transferOwnership(uint256 _id, address _newOwner) public {
        require(msg.sender == parcels[_id].owner, "You are not the owner of this parcel");
        parcels[_id].owner = _newOwner;
    }
}