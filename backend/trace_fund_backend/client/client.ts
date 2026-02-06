import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { TraceFund } from "../target/types/trace_fund";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.TraceFund as anchor.Program<TraceFund>;

// Client Test Script
console.log("My address:", program.provider.publicKey.toString());

// 1. Define the input data
const campaignName = "SchoolFund";
const description = "Funding for books";
const targetAmount = new BN(100);
const imageUrl = "https://placehold.co/600x400";

// 2. Derive the PDA (The "Math" part)
// This calculates the EXACT address the Smart Contract expects.
const [campaignPda] = anchor.web3.PublicKey.findProgramAddressSync(
  [
    Buffer.from("campaign"),
    program.provider.publicKey.toBuffer(),
    Buffer.from(campaignName),
  ],
  program.programId
);

console.log("Calculated Campaign Address:", campaignPda.toString());

// 3. Call the Smart Contract
try {
  const tx = await program.methods
    .initializeCampaign(
      campaignName,
      description,
      targetAmount,
      imageUrl
    )
    .accounts({
      campaign: campaignPda,
      user: program.provider.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  console.log("✅ Success! Transaction Hash:", tx);
} catch (err) {
  console.error("❌ Failed:", err);
}