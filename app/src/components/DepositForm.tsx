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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Deposit</h2>
      <p className="mt-1 text-sm text-zinc-500">Deposit wBTC or USDC. Store credentials locally.</p>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Token</label>
          <select value={token} onChange={(e) => setToken(e.target.value as "wbtc" | "usdc")} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800">
            <option value="wbtc">wBTC</option>
            <option value="usdc">USDC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Amount</label>
          <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
        </div>
        <button type="button" onClick={handleDeposit} disabled={!address} className="w-full rounded-lg bg-amber-600 py-2 text-white hover:bg-amber-700 disabled:opacity-50">Deposit</button>
        {status && <p className="text-sm text-zinc-600 dark:text-zinc-400">{status}</p>}
      </div>
    </div>
  );
}
