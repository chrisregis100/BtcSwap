"use client";

import { useState } from "react";
import { useStarknet } from "../contexts/StarknetContext";

export function SwapForm() {
  const { address } = useStarknet();
  const [amountIn, setAmountIn] = useState("");
  const [direction, setDirection] = useState<"wbtc_to_usdc" | "usdc_to_wbtc">("wbtc_to_usdc");
  const [status, setStatus] = useState("");

  function handleSwap() {
    if (!address) setStatus("Connect wallet first.");
    else setStatus("Use proof API then vault.swap_private.");
  }

  return (
    <article className="card-hover rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <span className="text-lg font-bold">2</span>
      </div>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">Private Swap</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Swap wBTC ↔ USDC with amounts hidden on-chain.
      </p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Direction</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "wbtc_to_usdc" | "usdc_to_wbtc")}
            className="mt-1.5 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="wbtc_to_usdc">wBTC → USDC</option>
            <option value="usdc_to_wbtc">USDC → wBTC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Amount</label>
          <input
            type="text"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            className="mt-1.5 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
        <button
          type="button"
          onClick={handleSwap}
          disabled={!address}
          className="btn-primary w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Swap
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
