import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TraceFund } from "../target/types/trace_fund";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import assert from "assert";

describe("trace_fund", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TraceFund as Program<TraceFund>;
  
  // Admin wallet (the provider's wallet)
  const admin = provider.wallet;
  const campaignKeypair = Keypair.generate();
  const donor = Keypair.generate();

  // Campaign data
  const campaignName = "Test Campaign";
  const campaignDescription = "A test crowdfunding campaign";
  const targetAmount = new anchor.BN(5 * LAMPORTS_PER_SOL); 
  const imageUrl = "https://example.com/campaign-image.png";
  const donationAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);
  const withdrawAmount = new anchor.BN(0.5 * LAMPORTS_PER_SOL);

  it("Initializes a new campaign", async () => {
    const tx = await program.methods
      .initializeCampaign(
        campaignName,
        campaignDescription,
        targetAmount,
        imageUrl
      )
      .accounts({
        campaign: campaignKeypair.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([campaignKeypair])
      .rpc();
    console.log("Initialize campaign tx:", tx);
  });

  it("Airdrops SOL to donor wallet", async () => {
    const airdropSignature = await provider.connection.requestAirdrop(
      donor.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature: airdropSignature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });
  });

  it("Donor donates to the campaign", async () => {
    const tx = await program.methods
      .donate(donationAmount)
      .accounts({
        campaign: campaignKeypair.publicKey,
        donor: donor.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([donor])
      .rpc();
    console.log("Donate tx:", tx);
  });

  it("Admin withdraws from the campaign", async () => {
    const tx = await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        campaign: campaignKeypair.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Withdraw tx:", tx);
  });
});
