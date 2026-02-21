"use client";

import { useCallback, useState } from "react";
import { loadCredentials, saveCredentials, CREDENTIALS_STORAGE_KEY } from "../lib/starknet";

export function CredentialsManager() {
  const [exportData, setExportData] = useState("");
  const [importData, setImportData] = useState("");
  const [message, setMessage] = useState("");

  const handleExport = useCallback(() => {
    const creds = loadCredentials();
    if (!creds) {
      setMessage("No credentials stored.");
      return;
    }
    setExportData(JSON.stringify(creds, null, 2));
    setMessage("Exported. Save this file securely.");
  }, []);

  const handleImport = useCallback(() => {
    try {
      const parsed = JSON.parse(importData);
      if (!parsed.commitments || !Array.isArray(parsed.commitments)) {
        setMessage("Invalid format.");
        return;
      }
      saveCredentials({
        commitments: parsed.commitments,
        createdAt: parsed.createdAt ?? Date.now(),
      });
      setMessage("Credentials imported.");
      setImportData("");
    } catch {
      setMessage("Invalid JSON.");
    }
  }, [importData]);

  const handleClear = useCallback(() => {
    if (typeof window === "undefined") return;
    if (confirm("Remove all credentials from this device?")) {
      localStorage.removeItem(CREDENTIALS_STORAGE_KEY);
      setExportData("");
      setImportData("");
      setMessage("Credentials cleared.");
    }
  }, []);

  return (
    <article className="card-hover rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">
        Credentials (client-only)
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Export or import commitments and salts. Stored only in this browser. Losing them means losing access to private balances.
      </p>
      <div className="mt-5 space-y-5">
        <div>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl border border-[var(--card-border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Export
          </button>
          {exportData && (
            <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 text-xs font-mono text-[var(--muted)]">
              {exportData}
            </pre>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Import (paste JSON)
          </label>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            rows={4}
            className="mt-1.5 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 font-mono text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:ring-2 focus:ring-amber-500/40"
            placeholder='{"commitments":[...],"createdAt":...}'
          />
          <button
            type="button"
            onClick={handleImport}
            className="mt-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Import
          </button>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
        >
          Clear credentials
        </button>
        {message && (
          <p className="text-sm text-[var(--muted)] rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5">
            {message}
          </p>
        )}
      </div>
    </article>
  );
}
