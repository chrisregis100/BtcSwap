import { NextRequest, NextResponse } from "next/server";

/**
 * MVP: stub for ZK proof generation.
 * Body: { commitment, nullifier, amount, userAddress, ... }
 * Returns a placeholder proof array (8 felts) for testing with the stub verifier.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commitment, nullifier, amount, userAddress } = body as {
      commitment?: string;
      nullifier?: string;
      amount?: string;
      userAddress?: string;
    };
    if (!commitment || !userAddress) {
      return NextResponse.json(
        { error: "commitment and userAddress required" },
        { status: 400 }
      );
    }
    // Placeholder proof for MVP stub verifier (accepts non-empty proof)
    const proof = [
      commitment,
      nullifier ?? "0x0",
      amount ?? "0x0",
      userAddress,
      "0x1",
      "0x2",
      "0x3",
      "0x4",
    ];
    return NextResponse.json({ proof });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
