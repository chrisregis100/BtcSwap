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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Private Swap</h2>
      <p className="mt-1 text-sm text-zinc-500">Swap wBTC to USDC or vice versa.</p>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Direction</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value as "wbtc_to_usdc" | "usdc_to_wbtc")} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800">
            <option value="wbtc_to_usdc">wBTC to USDC</option>
            <option value="usdc_to_wbtc">USDC to wBTC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Amount</label>
          <input type="text" value={amountIn} onChange={(e) => setAmountIn(e.target.value)} placeholder="0.0" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
        </div>
        <button type="button" onClick={handleSwap} disabled={!address} className="w-full rounded-lg bg-amber-600 py-2 text-white hover:bg-amber-700 disabled:opacity-50">Swap</button>
        {status && <p className="text-sm text-zinc-600 dark:text-zinc-400">{status}</p>}
      </div>
    </div>
  );
}
