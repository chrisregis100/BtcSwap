/**
 * Starknet config and contract addresses.
 * Set via env: NEXT_PUBLIC_VAULT_ADDRESS, NEXT_PUBLIC_ORACLE_ADDRESS, etc.
 */

export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID ?? "SN_SEPOLIA";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ??
  "https://starknet-sepolia.public.blastapi.io";

export const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS ?? "";
export const ORACLE_ADDRESS = process.env.NEXT_PUBLIC_ORACLE_ADDRESS ?? "";
export const VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_VERIFIER_ADDRESS ?? "";
export const WBTC_ADDRESS = process.env.NEXT_PUBLIC_WBTC_ADDRESS ?? "";
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "";

export const CREDENTIALS_STORAGE_KEY = "btcswap_credentials";

export interface Credentials {
  commitments: { token: string; commitment: string; salt: string }[];
  createdAt: number;
}

export function loadCredentials(): Credentials | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Credentials;
  } catch {
    return null;
  }
}

export function saveCredentials(creds: Credentials): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(creds));
}

export function addCredential(
  token: string,
  commitment: string,
  salt: string
): void {
  const prev = loadCredentials();
  const next: Credentials = {
    commitments: [
      ...(prev?.commitments ?? []),
      { token, commitment, salt },
    ],
    createdAt: prev?.createdAt ?? Date.now(),
  };
  saveCredentials(next);
}
