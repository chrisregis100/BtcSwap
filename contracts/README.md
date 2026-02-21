# BtcSwap Contracts (Cairo / Starknet)

Smart contracts for private wBTC ↔ USDC/USDT swaps on Starknet.

## Contracts

- **PriceOracle** – BTC/USD price (MVP: admin-set fallback; production: integrate Pragma).
- **ZKVerifier** – Verifies balance proofs (MVP: stub; production: Garaga-generated verifier from Noir circuit).
- **PrivateSwapVault** – Deposits, private swaps (commitments + nullifiers), withdrawals.

## Build

```bash
scarb build
```

## Test

```bash
scarb test
```

## Deploy

Deploy in order: PriceOracle → ZKVerifier → PrivateSwapVault (pass oracle, verifier, wBTC, USDC addresses to the vault constructor).

## Selectors

ERC20 and internal selectors are defined as constants (sn_keccak of function names). For production, ensure they match the target ABIs (e.g. Starknet ERC20 uses `transfer` / `transfer_from`).
