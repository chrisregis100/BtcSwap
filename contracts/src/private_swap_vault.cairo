//! PrivateSwapVault: Private deposits, swaps (ZK), and withdrawals.

use starknet::ContractAddress;

#[starknet::interface]
trait IPrivateSwapVault<TContractState> {
    fn deposit(ref self: TContractState, amount_low: u128, amount_high: u128, token: ContractAddress);
    fn swap_private(
        ref self: TContractState,
        proof: Array<felt252>,
        commitment_in: felt252,
        commitment_out: felt252,
        nullifier: felt252,
        amount_in: u128,
        token_in: ContractAddress,
        token_out: ContractAddress,
    );
    fn withdraw(
        ref self: TContractState,
        proof: Array<felt252>,
        commitment: felt252,
        nullifier: felt252,
        amount_low: u128,
        amount_high: u128,
        token: ContractAddress,
    );
    fn get_reserves(self: @TContractState, token: ContractAddress) -> u128;
}

// Selectors (sn_keccak of function name) for cross-contract calls
const SELECTOR_GET_BTC_USD_PRICE: felt252 = 0xf6975a57be9494bfa97643b1fb1ae96b0b22ff3699a1711b6524697b82dc76;
const SELECTOR_VERIFY_BALANCE_PROOF: felt252 = 0xa715635bc086e66fe396073e6d897f382eff30ab515dbdba1f44108bb8ceaa;
const SELECTOR_TRANSFER_FROM: felt252 = 0x6b8672c62584e8f8a2cbcb5030059747a6ceb8e8a88ab29bd240b0c714183e;
const SELECTOR_TRANSFER: felt252 = 0xd12389c01ffafc02ffee8f9a037aeefe31d5017489046399efca6ffacc447b;

#[starknet::contract]
mod PrivateSwapVault {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::syscalls::call_contract_syscall;
    use core::hash::HashStateTrait;
    use core::poseidon::PoseidonTrait;
    use core::array::ArrayTrait;

    #[storage]
    struct Storage {
        verifier: ContractAddress,
        oracle: ContractAddress,
        wbtc_token: ContractAddress,
        usdc_token: ContractAddress,
        reserves_wbtc: u128,
        reserves_usdc: u128,
        deposit_nonce: u64,
        nullifiers_used: Map<felt252, bool>,
        commitments: Map<felt252, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Deposit: Deposit,
        SwapPrivate: SwapPrivate,
        Withdraw: Withdraw,
    }

    #[derive(Drop, starknet::Event)]
    struct Deposit {
        commitment: felt252,
        salt: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct SwapPrivate {
        commitment_in: felt252,
        commitment_out: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct Withdraw {
        commitment: felt252,
        recipient: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        verifier: ContractAddress,
        oracle: ContractAddress,
        wbtc_token: ContractAddress,
        usdc_token: ContractAddress,
    ) {
        self.verifier.write(verifier);
        self.oracle.write(oracle);
        self.wbtc_token.write(wbtc_token);
        self.usdc_token.write(usdc_token);
        self.reserves_wbtc.write(0);
        self.reserves_usdc.write(0);
        self.deposit_nonce.write(0);
    }

    #[abi(embed_v0)]
    impl PrivateSwapVaultImpl of super::IPrivateSwapVault<ContractState> {
        fn deposit(ref self: ContractState, amount_low: u128, amount_high: u128, token: ContractAddress) {
            self._assert_whitelisted_token(token);
            let caller = get_caller_address();
            let amount = amount_low;
            assert(amount > 0, 'Amount must be positive');

            self._transfer_from(token, caller, get_contract_address(), amount_low, amount_high);

            let nonce = self.deposit_nonce.read();
            self.deposit_nonce.write(nonce + 1);
            let salt = (nonce + 1).into();
            let commitment = self._poseidon_commitment(amount, salt, caller);

            assert(!self.commitments.read(commitment), 'Commitment exists');
            self.commitments.write(commitment, true);

            if token == self.wbtc_token.read() {
                let r = self.reserves_wbtc.read();
                self.reserves_wbtc.write(r + amount);
            } else {
                let r = self.reserves_usdc.read();
                self.reserves_usdc.write(r + amount);
            }

            self.emit(Deposit { commitment, salt });
        }

        fn swap_private(
            ref self: ContractState,
            proof: Array<felt252>,
            commitment_in: felt252,
            commitment_out: felt252,
            nullifier: felt252,
            amount_in: u128,
            token_in: ContractAddress,
            token_out: ContractAddress,
        ) {
            self._assert_whitelisted_token(token_in);
            self._assert_whitelisted_token(token_out);
            assert(token_in != token_out, 'Same token');
            assert(!self.nullifiers_used.read(nullifier), 'Nullifier used');
            assert(self.commitments.read(commitment_in), 'Unknown commitment');

            let caller = get_caller_address();
            let verified = self._call_verifier(proof, commitment_in, nullifier, amount_in, caller.into());
            assert(verified, 'Invalid proof');

            let btc_price = self._get_oracle_price();
            let amount_out = (amount_in * btc_price) / 100000000;

            self.nullifiers_used.write(nullifier, true);
            self.commitments.write(commitment_in, false);
            self.commitments.write(commitment_out, true);

            if token_in == self.wbtc_token.read() {
                let r_wbtc = self.reserves_wbtc.read();
                let r_usdc = self.reserves_usdc.read();
                self.reserves_wbtc.write(r_wbtc - amount_in);
                self.reserves_usdc.write(r_usdc + amount_out);
            } else {
                let r_wbtc = self.reserves_wbtc.read();
                let r_usdc = self.reserves_usdc.read();
                self.reserves_usdc.write(r_usdc - amount_in);
                self.reserves_wbtc.write(r_wbtc + amount_out);
            }

            self.emit(SwapPrivate { commitment_in, commitment_out });
        }

        fn withdraw(
            ref self: ContractState,
            proof: Array<felt252>,
            commitment: felt252,
            nullifier: felt252,
            amount_low: u128,
            amount_high: u128,
            token: ContractAddress,
        ) {
            self._assert_whitelisted_token(token);
            assert(!self.nullifiers_used.read(nullifier), 'Nullifier used');
            assert(self.commitments.read(commitment), 'Unknown commitment');

            let caller = get_caller_address();
            let amount = amount_low;
            let verified = self._call_verifier(proof, commitment, nullifier, amount, caller.into());
            assert(verified, 'Invalid proof');

            self.nullifiers_used.write(nullifier, true);
            self.commitments.write(commitment, false);

            if token == self.wbtc_token.read() {
                let r = self.reserves_wbtc.read();
                assert(r >= amount, 'Insufficient reserves');
                self.reserves_wbtc.write(r - amount);
            } else {
                let r = self.reserves_usdc.read();
                assert(r >= amount, 'Insufficient reserves');
                self.reserves_usdc.write(r - amount);
            }

            self._transfer(token, caller, amount_low, amount_high);
            self.emit(Withdraw { commitment, recipient: caller });
        }

        fn get_reserves(self: @ContractState, token: ContractAddress) -> u128 {
            if token == self.wbtc_token.read() {
                self.reserves_wbtc.read()
            } else {
                self.reserves_usdc.read()
            }
        }
    }

    #[generate_trait]
    impl PrivateSwapVaultInternal of PrivateSwapVaultInternalTrait {
        fn _assert_whitelisted_token(self: @ContractState, token: ContractAddress) {
            let wbtc = self.wbtc_token.read();
            let usdc = self.usdc_token.read();
            assert(token == wbtc || token == usdc, 'Token not whitelisted');
        }

        fn _poseidon_commitment(self: @ContractState, balance: u128, salt: felt252, user: ContractAddress) -> felt252 {
            let mut state = PoseidonTrait::new();
            state = state.update(balance.try_into().unwrap());
            state = state.update(salt);
            state = state.update(user.into());
            state.finalize()
        }

        fn _get_oracle_price(self: @ContractState) -> u128 {
            let oracle_addr = self.oracle.read();
            let selector = super::SELECTOR_GET_BTC_USD_PRICE;
            let result = call_contract_syscall(oracle_addr, selector, ArrayTrait::new().span()).unwrap();
            (*result.at(0)).try_into().unwrap()
        }

        fn _call_verifier(
            self: @ContractState,
            proof: Array<felt252>,
            commitment: felt252,
            nullifier: felt252,
            amount: u128,
            user_address: felt252,
        ) -> bool {
            let verifier_addr = self.verifier.read();
            let proof_len = proof.len();
            let p0 = if proof_len > 0 { *proof.at(0) } else { 0 };
            let p1 = if proof_len > 1 { *proof.at(1) } else { 0 };
            let p2 = if proof_len > 2 { *proof.at(2) } else { 0 };
            let p3 = if proof_len > 3 { *proof.at(3) } else { 0 };
            let p4 = if proof_len > 4 { *proof.at(4) } else { 0 };
            let p5 = if proof_len > 5 { *proof.at(5) } else { 0 };
            let p6 = if proof_len > 6 { *proof.at(6) } else { 0 };
            let p7 = if proof_len > 7 { *proof.at(7) } else { 0 };
            let selector = super::SELECTOR_VERIFY_BALANCE_PROOF;
            let mut calldata = ArrayTrait::new();
            calldata.append(8_u32.into());
            calldata.append(p0);
            calldata.append(p1);
            calldata.append(p2);
            calldata.append(p3);
            calldata.append(p4);
            calldata.append(p5);
            calldata.append(p6);
            calldata.append(p7);
            calldata.append(commitment);
            calldata.append(nullifier);
            calldata.append(amount.into());
            calldata.append(user_address);
            let result = call_contract_syscall(verifier_addr, selector, calldata.span()).unwrap();
            *result.at(0) != 0
        }

        fn _transfer_from(
            ref self: ContractState,
            token: ContractAddress,
            from: ContractAddress,
            to: ContractAddress,
            amount_low: u128,
            amount_high: u128,
        ) {
            let selector = super::SELECTOR_TRANSFER_FROM;
            let mut calldata = ArrayTrait::new();
            calldata.append(from.into());
            calldata.append(to.into());
            calldata.append(amount_low.into());
            calldata.append(amount_high.into());
            call_contract_syscall(token, selector, calldata.span()).unwrap();
        }

        fn _transfer(
            ref self: ContractState,
            token: ContractAddress,
            to: ContractAddress,
            amount_low: u128,
            amount_high: u128,
        ) {
            let selector = super::SELECTOR_TRANSFER;
            let mut calldata = ArrayTrait::new();
            calldata.append(to.into());
            calldata.append(amount_low.into());
            calldata.append(amount_high.into());
            call_contract_syscall(token, selector, calldata.span()).unwrap();
        }
    }
}
