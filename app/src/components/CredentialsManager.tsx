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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Credentials (client-only)
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Export or import your commitments and salts. Stored only in this browser. Losing them means losing access to private balances.
      </p>
      <div className="mt-4 space-y-4">
        <div>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Export
          </button>
          {exportData && (
            <pre className="mt-2 max-h-40 overflow-auto rounded border border-zinc-200 bg-zinc-50 p-2 text-xs dark:border-zinc-600 dark:bg-zinc-800">
              {exportData}
            </pre>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Import (paste JSON)
          </label>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
          <button
            type="button"
            onClick={handleImport}
            className="mt-2 rounded-lg bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700"
          >
            Import
          </button>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20"
        >
          Clear credentials
        </button>
        {message && <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>}
      </div>
    </div>
  );
}
