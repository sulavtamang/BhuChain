import json
import os
from web3 import Web3
from django.conf import settings

class BhuChainService:
    def __init__(self):
        # 1. Connect to the Local Hardhat Node
        self.w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

        # 2. Set Contract Address (FROM DEPLOYMENT)
        self.contract_address = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

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

# Create a single instance to use everywhere
blockchain = BhuChainService()