"use client";

import { useState } from "react";
import { useStarknet } from "../contexts/StarknetContext";
import { addCredential, VAULT_ADDRESS, WBTC_ADDRESS, USDC_ADDRESS } from "../lib/starknet";

export function DepositForm() {
  const { address } = useStarknet();
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<"wbtc" | "usdc">("wbtc");
  const [status, setStatus] = useState("");
  const tokenAddress = token === "wbtc" ? WBTC_ADDRESS : USDC_ADDRESS;

  async function handleDeposit() {
    if (!address || !VAULT_ADDRESS || !tokenAddress) {
      setStatus("Set contract addresses in env.");
      return;
    }
    setStatus("Call approve then vault.deposit; save commitment/salt from event.");
    addCredential(token, "0x0", "0x0");
  }

  return (
    <article className="card-hover rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <span className="text-lg font-bold">1</span>
      </div>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">Deposit</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Deposit wBTC or USDC. Store credentials locally.
      </p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Token</label>
          <select
            value={token}
            onChange={(e) => setToken(e.target.value as "wbtc" | "usdc")}
            className="mt-1.5 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="wbtc">wBTC</option>
            <option value="usdc">USDC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="mt-1.5 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
        <button
          type="button"
          onClick={handleDeposit}
          disabled={!address}
          className="btn-primary w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Deposit
        </button>
        {status && (
          <p className="text-sm text-[var(--muted)] rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-2">
            {status}
          </p>
        )}
      </div>
    </article>
  );
}
