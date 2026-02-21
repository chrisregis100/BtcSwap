import type { Metadata } from "next";
import "./globals.css";
import { StarknetProvider } from "../contexts/StarknetContext";

export const metadata: Metadata = {
  title: "BtcSwap – Private wBTC / USDC on Starknet",
  description: "Private swaps with hidden amounts on Starknet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <StarknetProvider>{children}</StarknetProvider>
      </body>
    </html>
  );
}
