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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Withdraw</h2>
      <p className="mt-1 text-sm text-zinc-500">Withdraw to your wallet using a ZK proof of your private balance.</p>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Token</label>
          <select value={token} onChange={(e) => setToken(e.target.value as "wbtc" | "usdc")} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800">
            <option value="wbtc">wBTC</option>
            <option value="usdc">USDC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Amount</label>
          <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
        </div>
        <button type="button" onClick={handleWithdraw} disabled={!address} className="w-full rounded-lg bg-amber-600 py-2 text-white hover:bg-amber-700 disabled:opacity-50">Withdraw</button>
        {status && <p className="text-sm text-zinc-600 dark:text-zinc-400">{status}</p>}
      </div>
    </div>
  );
}
