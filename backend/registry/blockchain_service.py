import json
import os
from web3 import Web3
from django.conf import settings

class BhuChainService:
    def __init__(self):
        # 1. Connect to the Local Hardhat Node
        rpc_url = os.getenv('BLOCKCHAIN_RPC_URL', 'http://127.0.0.1:8545')
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))

        # 2. Set Contract Address (FROM DEPLOYMENT)
        self.contract_address = os.getenv('CONTRACT_ADDRESS', '0x5FbDB2315678afecb367f032d93F642f64180aa3')

        # 3. Dynamic ABI Loading
        # This finds the "BhuChain.json" file that Hardhat generated
        json_path = os.path.join(
            settings.BASE_DIR,
            '..',
            'blockchain/artifacts/contracts/BhuChain.sol/BhuChain.json'
        )

        try:
            with open(json_path, 'r') as f:
                artifact = json.load(f)
                self.abi = artifact['abi']

                # Initialize the Contract
                self.contract = self.w3.eth.contract(
                    address = self.contract_address,
                    abi = self.abi
                )
        except FileNotFoundError:
            print(f"Warning: Could not find ABI at {json_path}")
            self.contract = None

    def check_connection(self):
        """Simple check to see if we can talk to the blockchain"""
        return self.w3.is_connected()

    def get_parcel_details(self, parcel_id):
        """
        Independent verification: Fetch parcel data directly from the smart contract.
        Used to cross-verify frontend submissions.
        """
        if not self.contract:
            return None
            
        try:
            # parcels(uint256) returns (id, location, area, owner, isLocked)
            parcel_data = self.contract.functions.parcels(parcel_id).call()
            
            # Web3.py returns a list/tuple for structs
            if not parcel_data or parcel_data[0] == 0:
                return None
                
            return {
                'id': parcel_data[0],
                'location': parcel_data[1],
                'area': parcel_data[2],
                'owner': parcel_data[3],
                'is_locked': parcel_data[4]
            }
        except Exception as e:
            print(f"Error fetching parcel {parcel_id}: {str(e)}")
            return None

# Create a single instance to use everywhere
blockchain = BhuChainService()