//! ZKVerifier: Verifies ZK proofs for private balance.
//! MVP: stub verifier for testing. Replace with Garaga-generated verifier from Noir circuit.

#[starknet::interface]
trait IZKVerifier<TContractState> {
    /// Verifies a balance proof. MVP: up to 32 proof felts (Garaga uses serialized proof).
    fn verify_balance_proof(
        self: @TContractState,
        proof_len: u32,
        proof_0: felt252,
        proof_1: felt252,
        proof_2: felt252,
        proof_3: felt252,
        proof_4: felt252,
        proof_5: felt252,
        proof_6: felt252,
        proof_7: felt252,
        commitment: felt252,
        nullifier: felt252,
        amount: u128,
        user_address: felt252,
    ) -> bool;
}

#[starknet::contract]
mod ZKVerifier {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        /// If true, stub accepts any non-empty proof (for testnet MVP)
        mock_accept: bool,
    }

    #[constructor]
    fn constructor(ref self: ContractState, mock_accept: bool) {
        self.mock_accept.write(mock_accept);
    }

    #[abi(embed_v0)]
    impl ZKVerifierImpl of super::IZKVerifier<ContractState> {
        fn verify_balance_proof(
            self: @ContractState,
            proof_len: u32,
            proof_0: felt252,
            proof_1: felt252,
            proof_2: felt252,
            proof_3: felt252,
            proof_4: felt252,
            proof_5: felt252,
            proof_6: felt252,
            proof_7: felt252,
            commitment: felt252,
            nullifier: felt252,
            amount: u128,
            user_address: felt252,
        ) -> bool {
            if self.mock_accept.read() {
                return proof_len > 0 && commitment != 0 && user_address != 0;
            }
            false
        }
    }
}
