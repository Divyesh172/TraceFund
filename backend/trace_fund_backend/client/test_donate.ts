import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { TraceFund } from "../target/types/trace_fund";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.TraceFund as anchor.Program<TraceFund>;

// test-donate.ts
console.log("Testing Donate Function...");

const campaignName = "SchoolFund";
const donateAmount = new BN(500000000); // 0.5 SOL

// 1. Get the Campaign Address (PDA)
const [campaignPda] = anchor.web3.PublicKey.findProgramAddressSync(
  [
    Buffer.from("campaign"),
    program.provider.publicKey.toBuffer(),
    Buffer.from(campaignName),
  ],
  program.programId
);

console.log("Campaign Address:", campaignPda.toString());

// 2. Call Donate
try {
  const tx = await program.methods
    .donate(donateAmount)
    .accounts({
      campaign: campaignPda,
      donor: program.provider.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  console.log("✅ Donation Success! Tx:", tx);

  // 3. Verify Balance
  const balance = await program.provider.connection.getBalance(campaignPda);
  console.log(`New Campaign Balance: ${balance / 1e9} SOL`);
} catch (err) {
  console.error("❌ Donation Failed:", err);
}
