//! PriceOracle: BTC/USD price. MVP: admin-set fallback. Production: integrate Pragma at pragma_address.

use starknet::ContractAddress;

#[starknet::interface]
trait IPriceOracle<TContractState> {
    fn get_btc_usd_price(self: @TContractState) -> u128;
    fn set_fallback_price(ref self: TContractState, price: u128);
    fn set_admin(ref self: TContractState, admin: ContractAddress);
}

#[starknet::contract]
mod PriceOracle {
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        fallback_price: u128,
        admin: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        FallbackPriceSet: FallbackPriceSet,
        AdminSet: AdminSet,
    }

    #[derive(Drop, starknet::Event)]
    struct FallbackPriceSet {
        price: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct AdminSet {
        admin: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_fallback_price: u128, admin: ContractAddress) {
        self.fallback_price.write(initial_fallback_price);
        self.admin.write(admin);
    }

    #[abi(embed_v0)]
    impl PriceOracleImpl of super::IPriceOracle<ContractState> {
        fn get_btc_usd_price(self: @ContractState) -> u128 {
            self.fallback_price.read()
        }

        fn set_fallback_price(ref self: ContractState, price: u128) {
            let caller = get_caller_address();
            assert(self.admin.read() == caller, 'Only admin');
            self.fallback_price.write(price);
            self.emit(FallbackPriceSet { price });
        }

        fn set_admin(ref self: ContractState, admin: ContractAddress) {
            let caller = get_caller_address();
            assert(self.admin.read() == caller, 'Only admin');
            self.admin.write(admin);
            self.emit(AdminSet { admin });
        }
    }
}
