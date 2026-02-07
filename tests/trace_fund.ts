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
  
  // Generate a fresh campaign keypair for each test run
  const campaignKeypair = Keypair.generate();
  
  // Generate a donor wallet
  const donor = Keypair.generate();

  // Campaign data
  const campaignName = "Test Campaign";
  const campaignDescription = "A test crowdfunding campaign";
  const targetAmount = new anchor.BN(5 * LAMPORTS_PER_SOL); // 5 SOL target
  const imageUrl = "https://example.com/campaign-image.png";

  // Donation and withdrawal amounts
  const donationAmount = new anchor.BN(1 * LAMPORTS_PER_SOL); // 1 SOL
  const withdrawAmount = new anchor.BN(0.5 * LAMPORTS_PER_SOL); // 0.5 SOL

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

    // Fetch the campaign account and verify data
    const campaign = await program.account.campaign.fetch(
      campaignKeypair.publicKey
    );

    assert.strictEqual(campaign.name, campaignName);
    assert.strictEqual(campaign.description, campaignDescription);
    assert.strictEqual(campaign.targetAmount.toString(), targetAmount.toString());
    assert.strictEqual(campaign.imageUrl, imageUrl);
    assert.strictEqual(campaign.admin.toString(), admin.publicKey.toString());
    assert.strictEqual(campaign.amountCollected.toString(), "0");

    console.log("Campaign initialized successfully!");
    console.log("Campaign address:", campaignKeypair.publicKey.toString());
  });

  it("Airdrops SOL to donor wallet", async () => {
    // Request airdrop of 2 SOL to the donor
    const airdropSignature = await provider.connection.requestAirdrop(
      donor.publicKey,
      2 * LAMPORTS_PER_SOL
    );

    // Confirm the airdrop transaction
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature: airdropSignature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    // Verify the donor's balance
    const donorBalance = await provider.connection.getBalance(donor.publicKey);
    assert.ok(donorBalance >= 2 * LAMPORTS_PER_SOL);

    console.log("Donor wallet funded successfully!");
    console.log("Donor address:", donor.publicKey.toString());
    console.log("Donor balance:", donorBalance / LAMPORTS_PER_SOL, "SOL");
  });

  it("Donor donates to the campaign", async () => {
    // Get initial campaign state
    const campaignBefore = await program.account.campaign.fetch(
      campaignKeypair.publicKey
    );
    const amountCollectedBefore = campaignBefore.amountCollected;

    console.log(
      "Amount collected before donation:",
      amountCollectedBefore.toString()
    );

    // Donate from the donor's wallet
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

    // Fetch updated campaign state
    const campaignAfter = await program.account.campaign.fetch(
      campaignKeypair.publicKey
    );
    const amountCollectedAfter = campaignAfter.amountCollected;

    console.log(
      "Amount collected after donation:",
      amountCollectedAfter.toString()
    );

    // Verify that amount_collected has increased by the donation amount
    const expectedAmount = amountCollectedBefore.add(donationAmount);
    assert.strictEqual(
      amountCollectedAfter.toString(),
      expectedAmount.toString(),
      "Amount collected should increase by donation amount"
    );

    console.log("Donation successful!");
    console.log(
      "Total collected:",
      amountCollectedAfter.toNumber() / LAMPORTS_PER_SOL,
      "SOL"
    );
  });

  it("Admin withdraws from the campaign", async () => {
    // Get initial campaign state
    const campaignBefore = await program.account.campaign.fetch(
      campaignKeypair.publicKey
    );
    const amountCollectedBefore = campaignBefore.amountCollected;

    // Get admin's initial balance
    const adminBalanceBefore = await provider.connection.getBalance(
      admin.publicKey
    );

    console.log(
      "Campaign balance before withdrawal:",
      amountCollectedBefore.toString()
    );
    console.log(
      "Admin balance before withdrawal:",
      adminBalanceBefore / LAMPORTS_PER_SOL,
      "SOL"
    );

    // Withdraw as admin
    const tx = await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        campaign: campaignKeypair.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Withdraw tx:", tx);

    // Fetch updated campaign state
    const campaignAfter = await program.account.campaign.fetch(
      campaignKeypair.publicKey
    );
    const amountCollectedAfter = campaignAfter.amountCollected;

    // Verify campaign balance decreased
    const expectedCampaignBalance = amountCollectedBefore.sub(withdrawAmount);
    assert.strictEqual(
      amountCollectedAfter.toString(),
      expectedCampaignBalance.toString(),
      "Campaign balance should decrease by withdrawal amount"
    );

    // Get admin's final balance
    const adminBalanceAfter = await provider.connection.getBalance(
      admin.publicKey
    );

    // Admin should have received the withdrawn amount (minus tx fees)
    // We check that the balance increased by at least (withdrawAmount - 0.01 SOL for fees)
    const minExpectedIncrease =
      withdrawAmount.toNumber() - 0.01 * LAMPORTS_PER_SOL;
    const actualIncrease = adminBalanceAfter - adminBalanceBefore;
    
    assert.ok(
      actualIncrease >= minExpectedIncrease,
      "Admin balance should increase by approximately the withdrawal amount"
    );

    console.log("Withdrawal successful!");
    console.log(
      "Campaign balance after withdrawal:",
      amountCollectedAfter.toNumber() / LAMPORTS_PER_SOL,
      "SOL"
    );
    console.log(
      "Admin balance after withdrawal:",
      adminBalanceAfter / LAMPORTS_PER_SOL,
      "SOL"
    );
  });

  it("Verifies final campaign state", async () => {
    const campaign = await program.account.campaign.fetch(
      campaignKeypair.publicKey
    );

    console.log("\n=== Final Campaign State ===");
    console.log("Name:", campaign.name);
    console.log("Description:", campaign.description);
    console.log("Target:", campaign.targetAmount.toNumber() / LAMPORTS_PER_SOL, "SOL");
    console.log("Collected:", campaign.amountCollected.toNumber() / LAMPORTS_PER_SOL, "SOL");
    console.log("Admin:", campaign.admin.toString());
    console.log("Image URL:", campaign.imageUrl);

    // Final assertions
    const expectedFinalAmount = donationAmount.sub(withdrawAmount);
    assert.strictEqual(
      campaign.amountCollected.toString(),
      expectedFinalAmount.toString(),
      "Final amount should be donation minus withdrawal"
    );
  });
});
