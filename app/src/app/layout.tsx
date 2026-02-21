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
    <html lang="en">
      <body className="antialiased">
        <StarknetProvider>{children}</StarknetProvider>
      </body>
    </html>
  );
}
