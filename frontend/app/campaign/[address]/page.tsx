"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import Navbar from "../../components/Navbar";
import DonationSuccessModal from "../../components/DonationSuccessModal";
import idl from "../../utils/idl.json";

const idl_object = JSON.parse(JSON.stringify(idl));

export default function CampaignDetails() {
    const { address } = useParams();
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [campaign, setCampaign] = useState<any>(null);
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successData, setSuccessData] = useState({
        isOpen: false,
        amount: "0",
        campaignName: "",
        donorAddress: "",
        txSignature: ""
    });

    const getCampaign = async () => {
        if (!address) return;
        try {
            // 1. Fetch Campaign Data
            const provider = new AnchorProvider(connection, window.solana, { preflightCommitment: "processed" });
            const program = new Program(idl_object, provider) as any;
            const account: any = await program.account.campaign.fetch(new PublicKey(address));

            setCampaign({
                pubkey: address,
                name: account.name,
                description: account.description,
                targetAmount: account.targetAmount.toString() / 1_000_000_000,
                amountCollected: account.amountCollected.toString() / 1_000_000_000,
                image: account.imageUrl,
                admin: account.admin.toString(),
            });
        } catch (error) {
            console.error("Error fetching campaign:", error);
        }
    };

    useEffect(() => {
        getCampaign();
    }, [address, connection]);

    // --- 🔥 THE FIX IS HERE ---
    const saveAuditLog = (event: string, hash: string) => {
        const newLog = {
            hash: hash,
            event: event,
            time: "Just now",
            status: "verified"
        };

        // Get existing logs
        const savedLogs = localStorage.getItem("tracefund_logs");
        let logs = savedLogs ? JSON.parse(savedLogs) : [];

        // Add new log to top
        logs = [newLog, ...logs].slice(0, 10); // Keep last 10

        // Save back
        localStorage.setItem("tracefund_logs", JSON.stringify(logs));
    };

    const donate = async () => {
        if (!publicKey || !amount || !campaign) return;
        setIsLoading(true);

        try {
            const provider = new AnchorProvider(connection, window.solana, { preflightCommitment: "processed" });
            const program = new Program(idl_object, provider) as any;

            // 1. Send Transaction
            const tx = await program.methods
                .donate(new BN(parseFloat(amount) * 1_000_000_000))
                .accounts({
                    campaign: new PublicKey(address),
                    donor: publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log("Donation successful:", tx);

            // 2. Refresh Data
            await getCampaign();

            // 3. Show Certificate
            setSuccessData({
                isOpen: true,
                amount: amount,
                campaignName: campaign.name,
                donorAddress: publicKey.toString(),
                txSignature: tx
            });

            // 4. 🔥 SAVE TO AUDIT LOG (Bridge to Home Page)
            saveAuditLog(`Donation to '${campaign.name}'`, `${tx.slice(0, 8)}...`);

        } catch (error) {
            console.error("Donation failed:", error);
            alert("Donation failed. Check console.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!campaign) return <div className="text-white text-center pt-20">Loading Campaign...</div>;

    return (
        <main className="min-h-screen bg-black text-white font-sans">
            <Navbar />

            <DonationSuccessModal
                isOpen={successData.isOpen}
                onClose={() => setSuccessData({ ...successData, isOpen: false })}
                amount={successData.amount}
                campaignName={successData.campaignName}
                donorAddress={successData.donorAddress}
                txSignature={successData.txSignature}
            />

            <div className="max-w-4xl mx-auto pt-24 px-4">

                {/* Header */}
                <div className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
                    <div className="h-64 w-full relative">
                        <img src={campaign.image} alt={campaign.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                        <div className="absolute bottom-6 left-6">
                            <h1 className="text-4xl font-bold text-white mb-2">{campaign.name}</h1>
                            <div className="flex gap-2">
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-mono border border-green-500/30">
                  VERIFIED CAMPAIGN
                </span>
                                <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-xs font-mono border border-gray-700">
                  {campaign.pubkey.slice(0,6)}...{campaign.pubkey.slice(-4)}
                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Left: Stats & Input */}
                        <div className="md:col-span-2 space-y-8">
                            <div>
                                <h3 className="text-gray-400 font-bold mb-2 text-sm uppercase tracking-wide">About this Campaign</h3>
                                <p className="text-gray-300 leading-relaxed text-lg">{campaign.description}</p>
                            </div>

                            <div className="bg-black/50 p-6 rounded-2xl border border-gray-800">
                                <label className="block text-sm font-bold text-gray-400 mb-2">Donate Amount (SOL)</label>
                                <div className="flex gap-4">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.5"
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition-colors text-xl font-mono"
                                    />
                                    <button
                                        onClick={donate}
                                        disabled={isLoading}
                                        className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {isLoading ? "Signing..." : "Donate 💸"}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                                    <span>🔒</span> Secure on-chain transaction via Solana
                                </p>
                            </div>
                        </div>

                        {/* Right: Progress Card */}
                        <div className="space-y-6">
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-white">{campaign.amountCollected}</span>
                                    <span className="text-xl text-gray-400 ml-2">SOL</span>
                                </div>

                                <div className="w-full bg-gray-700 h-3 rounded-full mb-2 overflow-hidden">
                                    <div
                                        className="bg-green-500 h-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min((campaign.amountCollected / campaign.targetAmount) * 100, 100)}%` }}
                                    ></div>
                                </div>

                                <div className="flex justify-between text-sm text-gray-400 font-mono">
                                    <span>Raised</span>
                                    <span>Goal: {campaign.targetAmount} SOL</span>
                                </div>
                            </div>

                            {/* Admin Zone (Only shows if YOU are the owner) */}
                            {publicKey && publicKey.toString() === campaign.admin && (
                                <div className="border border-red-900/50 bg-red-900/10 p-6 rounded-2xl">
                                    <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                                        <span>👑</span> Admin Zone
                                    </h3>
                                    <p className="text-xs text-red-300/70 mb-4">You are the campaign owner.</p>
                                    <button className="w-full border border-red-500/30 text-red-400 hover:bg-red-900/30 py-2 rounded-lg text-sm transition-all">
                                        Withdraw Funds
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}