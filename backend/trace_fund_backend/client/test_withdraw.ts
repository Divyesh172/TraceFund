import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { TraceFund } from "../target/types/trace_fund";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.TraceFund as anchor.Program<TraceFund>;

// test-withdraw.ts
console.log("Testing Withdraw Function...");

const campaignName = "SchoolFund"; // Must match what you initialized earlier
const withdrawAmount = new BN(100000000); // 0.1 SOL in Lamports

// 1. Find the Campaign Address again
const [campaignPda] = anchor.web3.PublicKey.findProgramAddressSync(
  [
    Buffer.from("campaign"),
    program.provider.publicKey.toBuffer(),
    Buffer.from(campaignName),
  ],
  program.programId
);

console.log("Campaign Address:", campaignPda.toString());

// 2. Check Balance Before
const balanceBefore = await program.provider.connection.getBalance(campaignPda);
console.log(`Balance Before: ${balanceBefore / 1e9} SOL`);

if (balanceBefore < 100000000) {
  console.log("❌ Not enough funds to withdraw! Run the Donate test first.");
} else {
  // 3. Call Withdraw
  try {
    const tx = await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        campaign: campaignPda,
        admin: program.provider.publicKey, // This MUST be the creator
      })
      .rpc();

    console.log("✅ Withdraw Success! Tx:", tx);

    const balanceAfter = await program.provider.connection.getBalance(campaignPda);
    console.log(`Balance After: ${balanceAfter / 1e9} SOL`);
  } catch (err) {
    console.error("❌ Withdraw Failed:", err);
  }
}
