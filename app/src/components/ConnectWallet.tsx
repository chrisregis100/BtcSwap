"use client";

import { useStarknet } from "../contexts/StarknetContext";

export function ConnectWallet() {
  const { address, isConnecting, connect, disconnect } = useStarknet();

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500 font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          type="button"
          onClick={disconnect}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={connect}
      disabled={isConnecting}
      className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
