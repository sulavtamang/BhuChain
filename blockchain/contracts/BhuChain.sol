//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BhuChain {
    //1. Defining what a "Land Parcel" looks like
    struct LandParcel {
        uint256 id;
        string location;
        uint256 area;
        address owner;
    }
    //2. Creating our "Digital Filing Cabinet" to store parcel
    // We use the ID to find the parcel
    mapping(uint256 => LandParcel) public parcels;

    //3. Keep track of how many parcels we have
    uint256 public parcelCount;

    //This is just a placeholder to show the contract is working
    string public name = "BhuChain Land Registry"; 

    //4. Create a function to add a new parcel
    function addParcel(string memory _location, uint256 _area) public {
        //Increment the count(this will be our new Parcel ID)
        parcelCount++;

        //Create a new parcel and store it in our "cabinet"
        //We use msg.sender to record WHO is adding the land
        parcels[parcelCount] = LandParcel(parcelCount, _location, _area, msg.sender);
    }
    //5. Function to transfer land from one address to another
    function transferOwnership(uint256 _id, address _newOwner) public {
        //Security: Ensure ONLY the current owner can transfer it
        require(msg.sender == parcels[_id].owner, "You are not the owner of this parcel");

        //Update the owner in our registry (Digital Filing Cabinet)
        parcels[_id].owner = _newOwner;
    }
}