"use client";

import Link from "next/link";
import { ConnectWallet } from "../components/ConnectWallet";
import { DepositForm } from "../components/DepositForm";
import { SwapForm } from "../components/SwapForm";
import { WithdrawForm } from "../components/WithdrawForm";
import { CredentialsManager } from "../components/CredentialsManager";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-amber-600">
            BtcSwap
          </Link>
          <ConnectWallet />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Private wBTC / USDC swaps
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          Deposit, swap, and withdraw with amounts hidden on-chain (Starknet).
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <DepositForm />
          <SwapForm />
          <WithdrawForm />
          <CredentialsManager />
        </div>
      </main>
    </div>
  );
}
