# BtcSwap

Private wBTC ↔ USDC/USDT swaps on Starknet. Amounts are hidden on-chain using commitments and ZK proofs.

## Structure

- **contracts/** – Cairo (Starknet): PriceOracle, ZKVerifier, PrivateSwapVault
- **app/** – Next.js + Tailwind: wallet connection, Deposit / Swap / Withdraw, credentials (client-only), proof API stub

## Contracts

```bash
cd contracts
scarb build
```

See [contracts/README.md](contracts/README.md) for deploy order and config.

## App

```bash
cd app
npm install
npm run dev
```

Set env (e.g. `.env.local`):

- `NEXT_PUBLIC_VAULT_ADDRESS`
- `NEXT_PUBLIC_ORACLE_ADDRESS`
- `NEXT_PUBLIC_VERIFIER_ADDRESS`
- `NEXT_PUBLIC_WBTC_ADDRESS`
- `NEXT_PUBLIC_USDC_ADDRESS`
- `NEXT_PUBLIC_RPC_URL` (optional, default Sepolia)
- `NEXT_PUBLIC_CHAIN_ID` (optional, default SN_SEPOLIA)

## Flow

1. **Deposit** – User approves token and calls vault `deposit`. Vault emits commitment + salt; user stores them locally (export/import in UI).
2. **Swap** – User builds a ZK proof (MVP: stub from `/api/proof` or mock), then calls vault `swap_private(proof, commitment_in, commitment_out, nullifier, ...)`.
3. **Withdraw** – User proves balance with ZK and calls vault `withdraw(proof, commitment, nullifier, amount, token)`.

## Security

- Credentials (salt, commitment, nullifier material) are stored only in the browser; export/import for backup.
- Production: replace stub ZKVerifier with a Garaga-generated verifier from a Noir circuit; use Pragma for the oracle when on mainnet.
