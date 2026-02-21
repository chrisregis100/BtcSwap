"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface StarknetContextValue {
  address: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const StarknetContext = createContext<StarknetContextValue | null>(null);

export function useStarknet() {
  const ctx = useContext(StarknetContext);
  if (!ctx) throw new Error("useStarknet must be used within StarknetProvider");
  return ctx;
}

declare global {
  interface Window {
    starknet?: {
      enable: () => Promise<{ address: string }>;
      isConnected: boolean;
      selectedAddress?: string;
    };
  }
}

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (!window.starknet) {
      alert("Install ArgentX or Braavos to connect.");
      return;
    }
    setIsConnecting(true);
    try {
      const { address: addr } = await window.starknet.enable();
      setAddress(addr ?? window.starknet.selectedAddress ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => setAddress(null), []);

  useEffect(() => {
    if (window.starknet?.isConnected && window.starknet.selectedAddress) {
      setAddress(window.starknet.selectedAddress);
    }
  }, []);

  return (
    <StarknetContext.Provider
      value={{ address, isConnecting, connect, disconnect }}
    >
      {children}
    </StarknetContext.Provider>
  );
}
