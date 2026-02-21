"use client";

import { useStarknet } from "../contexts/StarknetContext";

export function ConnectWallet() {
  const { address, isConnecting, connect, disconnect } = useStarknet();

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" aria-hidden />
          <span className="font-mono tabular-nums">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
        </span>
        <button
          type="button"
          onClick={disconnect}
          className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
      className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
