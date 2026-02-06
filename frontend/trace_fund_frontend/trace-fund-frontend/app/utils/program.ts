import { AnchorProvider, BN, Program, web3 } from "@project-serum/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import idl from "./idl.json";

// 🚨 PASTE YOUR PROGRAM ID HERE 🚨
const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

export const getProgram = (connection: any, wallet: any) => {
  const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
  return new Program(idl as any, PROGRAM_ID, provider);
};

export const getAllCampaigns = async (connection: any, wallet: any) => {
  const program = getProgram(connection, wallet);
  const campaigns = await program.account.campaign.all();
  return campaigns.map((c) => ({
    pubkey: c.publicKey.toString(),
    ...c.account,
    amountCollected: c.account.amountCollected.toString(),
    targetAmount: c.account.targetAmount.toString(),
  }));
};

export const createCampaign = async (connection: any, wallet: any, name: string, desc: string, target: number, img: string) => {
  const program = getProgram(connection, wallet);
  const [campaignPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("campaign"), wallet.publicKey.toBuffer(), Buffer.from(name)],
    program.programId
  );
  await program.methods.initializeCampaign(name, desc, new BN(target * LAMPORTS_PER_SOL), img)
    .accounts({ campaign: campaignPda, user: wallet.publicKey, systemProgram: web3.SystemProgram.programId })
    .rpc();
};

export const donate = async (connection: any, wallet: any, campaignPubkey: string, amount: number) => {
  const program = getProgram(connection, wallet);
  await program.methods.donate(new BN(amount * LAMPORTS_PER_SOL))
    .accounts({ campaign: new PublicKey(campaignPubkey), donor: wallet.publicKey, systemProgram: web3.SystemProgram.programId })
    .rpc();
};
