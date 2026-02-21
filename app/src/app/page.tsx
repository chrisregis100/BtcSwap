"use client";

import Link from "next/link";
import { ConnectWallet } from "../components/ConnectWallet";
import { DepositForm } from "../components/DepositForm";
import { SwapForm } from "../components/SwapForm";
import { WithdrawForm } from "../components/WithdrawForm";
import { CredentialsManager } from "../components/CredentialsManager";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-amber-600 transition hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
              B
            </span>
            BtcSwap
          </Link>
          <ConnectWallet />
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <section className="mb-10 text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)] mb-2">
            Starknet · Private swaps
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            wBTC ↔ USDC
          </h1>
          <p className="mt-3 max-w-xl text-base text-[var(--muted)] leading-relaxed">
            Deposit, swap and withdraw with amounts hidden on-chain. Your balances stay private.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
            Actions
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DepositForm />
            <SwapForm />
            <WithdrawForm />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
            Security
          </h2>
          <div className="max-w-2xl">
            <CredentialsManager />
          </div>
        </section>

        <footer className="mt-16 border-t border-[var(--card-border)] pt-8 pb-6 text-center text-sm text-[var(--muted)]">
          Store credentials locally. Export a backup to avoid losing access.
        </footer>
      </main>
    </div>
  );
}
