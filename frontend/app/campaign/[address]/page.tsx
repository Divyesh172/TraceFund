"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { PublicKey, ParsedTransactionWithMeta } from "@solana/web3.js";
import Navbar from "../../components/Navbar";
import DonationSuccessModal from "../../components/DonationSuccessModal";
import idl from "../../utils/idl.json";

const idl_object = JSON.parse(JSON.stringify(idl));
const PROGRAM_ID = new PublicKey(idl.address);

export default function CampaignDetails() {
    const { address } = useParams();
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    // --- STATE MANAGEMENT ---
    const [campaign, setCampaign] = useState<any>(null);
    const [donationAmount, setDonationAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawReason, setWithdrawReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Data Lists
    const [history, setHistory] = useState<any[]>([]); // The Audit Log
    const [topDonors, setTopDonors] = useState<any[]>([]); // The Leaderboard

    // Viral & Modal State
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastTx, setLastTx] = useState("");
    const [lastDonationAmount, setLastDonationAmount] = useState("");

    // --- 1. FETCH CAMPAIGN DETAILS ---
    const getCampaign = async () => {
        if (!address) return;
        const provider = new AnchorProvider(connection, window.solana, { preflightCommitment: "processed" });
        const program = new Program(idl_object, provider) as any;

        try {
            const account: any = await program.account.campaign.fetch(new PublicKey(address as string));
            setCampaign({
                name: account.name,
                description: account.description,
                targetAmount: account.targetAmount.toString() / 1_000_000_000,
                amountCollected: account.amountCollected.toString() / 1_000_000_000,
                image: account.imageUrl,
                admin: account.admin.toString(),
            });
        } catch (e) {
            console.error("Error loading campaign:", e);
        }
    };

    // --- 2. FETCH HISTORY & CALCULATE LEADERBOARD ---
    const getHistory = async () => {
        if (!address) return;

        try {
            // Get the last 20 signatures for this address
            const signatures = await connection.getSignaturesForAddress(
                new PublicKey(address as string),
                { limit: 20 }
            );

            const txs = await connection.getParsedTransactions(
                signatures.map(s => s.signature),
                { commitment: "confirmed" }
            );

            const historyData: any[] = [];
            const donorMap = new Map(); // To tally up donations per user

            txs.forEach((tx: any, i) => {
                if (!tx) return;

                const signature = signatures[i].signature;
                const date = new Date((tx.blockTime || 0) * 1000).toLocaleDateString();
                const logs = tx.meta?.logMessages || [];

                // CHECK: Was this a Donation?
                if (logs.some((log: string) => log.includes("Instruction: Donate"))) {
                    // Calculate how much the Campaign (index 0) gained
                    const pre = tx.meta.preBalances[0];
                    const post = tx.meta.postBalances[0];
                    const amount = (post - pre) / 1_000_000_000;

                    // Find the donor (usually the signer)
                    const donor = tx.transaction.message.accountKeys.find((k: any) => k.signer)?.pubkey.toString();

                    if (amount > 0 && donor) {
                        historyData.push({ type: "🟢 Donation", date, signature, color: "text-green-400", amount, donor });

                        // Update Leaderboard Map
                        const currentTotal = donorMap.get(donor) || 0;
                        donorMap.set(donor, currentTotal + amount);
                    }
                }

                // CHECK: Was this a Withdrawal?
                if (logs.some((log: string) => log.includes("Instruction: Withdraw"))) {
                    historyData.push({ type: "🔴 Withdraw", date, signature, color: "text-red-400" });
                }

                // CHECK: Was this Creation?
                if (logs.some((log: string) => log.includes("Instruction: Initialize"))) {
                    historyData.push({ type: "🚀 Created", date, signature, color: "text-blue-400" });
                }
            });

            setHistory(historyData);

            // Sort & Set Top Donors (Highest First)
            const sortedDonors = Array.from(donorMap.entries())
                .map(([donor, total]) => ({ donor, total }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 3); // Top 3

            setTopDonors(sortedDonors);

        } catch (e) {
            console.error("Error fetching history:", e);
        }
    };

    useEffect(() => {
        if (connection) {
            getCampaign();
            getHistory();
        }
    }, [connection, address]);

    // --- 3. ACTIONS: DONATE & WITHDRAW ---
    const donate = async () => {
        if (!publicKey) return alert("Connect wallet first!");
        setIsLoading(true);
        try {
            const provider = new AnchorProvider(connection, window.solana, { preflightCommitment: "processed" });
            const program = new Program(idl_object, provider);
            const amount = new BN(parseFloat(donationAmount) * 1_000_000_000);

            const tx = await program.methods.donate(amount).accounts({
                campaign: new PublicKey(address as string),
                donor: publicKey,
                systemProgram: web3.SystemProgram.programId,
            }).rpc();

            // Success! Trigger the Certificate Modal
            setLastTx(tx);
            setLastDonationAmount(donationAmount);
            setShowSuccess(true);

            setDonationAmount("");
            getCampaign();
            getHistory(); // Instant update
        } catch (error) {
            console.error("Donation failed:", error);
            alert("Donation failed. Check console.");
        } finally {
            setIsLoading(false);
        }
    };

    const withdraw = async () => {
        if (!publicKey) return;
        setIsLoading(true);
        try {
            const provider = new AnchorProvider(connection, window.solana, { preflightCommitment: "processed" });
            const program = new Program(idl_object, provider);
            const amount = new BN(parseFloat(withdrawAmount) * 1_000_000_000);

            await program.methods.withdraw(amount, withdrawReason).accounts({
                campaign: new PublicKey(address as string),
                admin: publicKey,
            }).rpc();

            alert("Funds withdrawn successfully!");
            setWithdrawAmount("");
            setWithdrawReason("");
            getCampaign();
            getHistory();
        } catch (error) {
            console.error("Withdraw failed:", error);
            alert("Withdraw failed.");
        } finally {
            setIsLoading(false);
        }
    };

    // Share Function for Main Page
    const shareCampaign = () => {
        const url = window.location.href;
        const text = `Check out "${campaign?.name}" on TraceFund! I'm tracking every donation on the blockchain. 🔍`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
    };

    if (!campaign) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Loading Campaign Data...</div>;

    const isAdmin = publicKey && campaign.admin === publicKey.toString();

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />

            {/* --- THE VIRAL LOOP: CERTIFICATE MODAL --- */}
            <DonationSuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                amount={lastDonationAmount}
                campaignName={campaign.name}
                donorAddress={publicKey ? publicKey.toString() : ""}
                txSignature={lastTx}
            />

            <div className="max-w-4xl mx-auto pt-10 px-4 mb-20">
                <div className="flex justify-between items-center mb-6">
                    <a href="/" className="text-gray-500 hover:text-white transition-colors">← Back to Campaigns</a>
                    <button onClick={shareCampaign} className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-2">
                        🐦 Share Campaign
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                    {/* --- LEFT COLUMN: INFO --- */}
                    <div>
                        <img src={campaign.image || "https://placehold.co/600x400/222/white?text=Campaign"} className="w-full rounded-2xl mb-6 shadow-2xl border border-gray-800" />
                        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                            <h2 className="text-xl font-bold mb-4 text-green-400">About the Cause</h2>
                            <p className="text-gray-300 leading-relaxed">{campaign.description}</p>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: ACTION --- */}
                    <div className="space-y-6">
                        <h1 className="text-4xl font-bold">{campaign.name}</h1>

                        {/* Progress Bar */}
                        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                            <div className="flex justify-between text-lg mb-2">
                                <span className="font-mono text-green-400 font-bold">{campaign.amountCollected} SOL</span>
                                <span className="text-gray-500">raised of {campaign.targetAmount} SOL</span>
                            </div>
                            <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${Math.min((campaign.amountCollected / campaign.targetAmount) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        {/* --- LEADERBOARD (GAMIFICATION) --- */}
                        {topDonors.length > 0 && (
                            <div className="bg-gradient-to-b from-yellow-900/20 to-gray-900 border border-yellow-700/30 p-6 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-2xl rounded-full"></div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-400">
                                    🏆 Top Philanthropists
                                </h3>
                                <div className="space-y-3 relative z-10">
                                    {topDonors.map((d, i) => (
                                        <div key={i} className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-yellow-900/20">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-300"}`}>
                                                    {i + 1}
                                                </div>
                                                <span className="font-mono text-sm text-gray-300">
                                            {d.donor.slice(0, 4)}...{d.donor.slice(-4)}
                                        </span>
                                            </div>
                                            <span className="text-yellow-500 font-bold text-sm">{d.total.toFixed(2)} SOL</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Donation Input */}
                        <div className="bg-gray-900 p-8 rounded-2xl border border-green-900/30">
                            <h3 className="text-2xl font-bold mb-4">Make a Donation</h3>
                            <div className="flex gap-4 mb-4">
                                <input
                                    type="number" placeholder="Amount (SOL)" value={donationAmount}
                                    onChange={(e) => setDonationAmount(e.target.value)}
                                    className="w-full bg-black border border-gray-700 p-4 rounded-xl text-xl focus:border-green-500 outline-none text-white"
                                />
                                <button onClick={donate} disabled={isLoading} className="bg-green-600 hover:bg-green-500 text-black font-bold px-8 rounded-xl transition-all transform hover:scale-105">
                                    {isLoading ? "..." : "Donate"}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 text-center">🔒 100% Transparent on Solana Blockchain</p>
                        </div>

                        {/* Admin Zone (Conditional) */}
                        {isAdmin && (
                            <div className="bg-red-900/10 border border-red-900/50 p-6 rounded-2xl">
                                <h3 className="text-xl font-bold text-red-400 mb-4">👑 Admin Zone</h3>
                                <div className="space-y-3">
                                    <input
                                        type="text" placeholder="Reason (e.g. Buying Rice)"
                                        value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)}
                                        className="w-full bg-black border border-red-900/30 p-3 rounded-lg text-white"
                                    />
                                    <div className="flex gap-3">
                                        <input
                                            type="number" placeholder="Amount"
                                            value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                                            className="w-full bg-black border border-red-900/30 p-3 rounded-lg text-white"
                                        />
                                        <button onClick={withdraw} disabled={isLoading} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 rounded-lg whitespace-nowrap">
                                            Withdraw
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- BOTTOM SECTION: SPENDING HISTORY TABLE --- */}
                <div className="w-full">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        📜 Audit Log <span className="text-sm font-normal text-gray-500">(Real-Time Blockchain Data)</span>
                    </h2>

                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="p-4">Event Type</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Details</th>
                                <th className="p-4">Proof</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                            {history.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No blockchain activity found yet.</td></tr>
                            ) : (
                                history.map((item, i) => (
                                    <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                        <td className={`p-4 font-bold ${item.color}`}>{item.type}</td>
                                        <td className="p-4 text-gray-400">{item.date}</td>
                                        <td className="p-4 text-sm text-gray-300">
                                            {item.amount ? `${item.amount} SOL from ${item.donor?.slice(0,4)}...` : "See Explorer"}
                                        </td>
                                        <td className="p-4 font-mono text-sm">
                                            <a
                                                href={`https://explorer.solana.com/tx/${item.signature}?cluster=devnet`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-500 hover:underline flex items-center gap-1"
                                            >
                                                {item.signature.slice(0, 8)}... ↗
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    );
}