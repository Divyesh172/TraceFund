"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "../utils/idl.json"; // This is the file you copied from backend

const idl_object = JSON.parse(JSON.stringify(idl));
const PROGRAM_ID = new PublicKey(idl.address);

export default function CreateCampaignModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [target, setTarget] = useState("");
    const [image, setImage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const createCampaign = async () => {
        if (!publicKey) return alert("Please connect your wallet first!");

        setIsLoading(true);

        try {
            // 1. Setup the Anchor Provider
            const provider = new AnchorProvider(connection, window.solana, { preflightCommitment: "processed" });
            const program = new Program(idl_object, provider);

            // 2. Derive the Campaign Account Address (PDA)
            // This MUST match the seeds in your Rust code: [b"campaign", user.key, name]
            const [campaignPda] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("campaign"),
                    publicKey.toBuffer(),
                    Buffer.from(name)
                ],
                program.programId
            );

            // 3. Convert Target to Lamports (1 SOL = 1,000,000,000 Lamports)
            const targetAmount = new BN(parseFloat(target) * 1_000_000_000);

            // 4. Call the Smart Contract
            const tx = await program.methods
                .initializeCampaign(name, description, targetAmount, image)
                .accounts({
                    campaign: campaignPda,
                    user: publicKey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();

            console.log("Transaction Signature:", tx);
            alert("Campaign Created! View on Solana Explorer.");
            onClose();

        } catch (error) {
            console.error("Error creating campaign:", error);
            alert("Transaction failed! Check console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>

                <h2 className="text-2xl font-bold mb-6 text-green-400">Start a Fundraiser</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Campaign Name</label>
                        <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                            placeholder="e.g. Clean Water for Village"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                        <textarea
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none h-24"
                            placeholder="Tell your story..."
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Target Amount (SOL)</label>
                        <input
                            type="number"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                            placeholder="e.g. 5"
                            onChange={(e) => setTarget(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                        <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                            placeholder="https://..."
                            onChange={(e) => setImage(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={createCampaign}
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                        {isLoading ? "Creating on Blockchain..." : "Launch Campaign 🚀"}
                    </button>
                </div>
            </div>
        </div>
    );
}