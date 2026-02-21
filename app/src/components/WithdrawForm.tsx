"use client";

import { useState } from "react";
import { useStarknet } from "../contexts/StarknetContext";

export function WithdrawForm() {
  const { address } = useStarknet();
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<"wbtc" | "usdc">("wbtc");
  const [status, setStatus] = useState<string>("");

  async function handleWithdraw() {
    if (!address) {
      setStatus("Connect wallet first.");
      return;
    }
    setStatus("Withdraw requires proof, commitment, nullifier. Generate proof then call vault.withdraw.");
  }

  return (
    <article className="card-hover rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <span className="text-lg font-bold">3</span>
      </div>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">Withdraw</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Withdraw to your wallet using a ZK proof of your private balance.
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
          onClick={handleWithdraw}
          disabled={!address}
          className="btn-primary w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Withdraw
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
