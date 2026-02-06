"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import Navbar from "./components/Navbar";
import CreateCampaignModal from "./components/CreateCampaignModal";
import idl from "./utils/idl.json";

const idl_object = JSON.parse(JSON.stringify(idl));
const PROGRAM_ID = new PublicKey(idl.address);

export default function Home() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCampaigns = async () => {
    setIsLoading(true);
    try {
      const provider = new AnchorProvider(connection, window.solana, { preflightCommitment: "processed" });
      const program = new Program(idl_object, provider) as any;

      const accounts = await program.account.campaign.all();

      // FIX: Added ': any' to 'account' to silence TypeScript errors
      const cleanedData = accounts.map((account: any) => ({
        pubkey: account.publicKey,
        name: account.account.name,
        description: account.account.description,
        targetAmount: account.account.targetAmount.toString() / 1_000_000_000,
        amountCollected: account.account.amountCollected.toString() / 1_000_000_000,
        image: account.account.imageUrl,
        admin: account.account.admin.toString(),
      }));

      setCampaigns(cleanedData);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connection) {
      getCampaigns();
    }
  }, [connection, publicKey]);

  return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />

        <CreateCampaignModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              getCampaigns();
            }}
        />

        <div className="flex flex-col items-center pt-20 px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
            Donations with <span className="text-green-500">Zero Secrets</span>.
          </h1>
          <p className="text-xl text-gray-400 mb-12 text-center max-w-2xl">
            TraceFund uses the Solana blockchain to track every single donation from your wallet to the final expense.
          </p>

          <div className="flex gap-4 mb-16">
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105"
            >
              Start a Campaign
            </button>

            <button
                onClick={getCampaigns}
                className="border border-gray-600 hover:border-gray-400 text-gray-300 px-8 py-3 rounded-full font-bold transition-all"
            >
              Refresh List 🔄
            </button>
          </div>

          <div className="w-full max-w-6xl">
            <h2 className="text-2xl font-bold mb-6 border-l-4 border-green-500 pl-4">Live Campaigns ({campaigns.length})</h2>

            {isLoading && <p className="text-gray-400 animate-pulse">Loading blockchain data...</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                  <div key={campaign.pubkey.toString()} className="bg-gray-900 border border-gray-800 overflow-hidden rounded-2xl hover:border-green-500/50 transition-all flex flex-col">

                    <div className="h-48 bg-gray-800 w-full relative">
                      {campaign.image ? (
                          <img src={campaign.image} alt={campaign.name} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🏫</div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-2 truncate">{campaign.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">{campaign.description}</p>

                      <div className="w-full bg-gray-800 h-2 rounded-full mb-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((campaign.amountCollected / campaign.targetAmount) * 100, 100)}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 font-mono mb-4">
                        <span className="text-green-400 font-bold">{campaign.amountCollected} SOL Raised</span>
                        <span>Goal: {campaign.targetAmount} SOL</span>
                      </div>

                      <Link href={`/campaign/${campaign.pubkey.toString()}`} className="w-full">
                        <button className="w-full bg-gray-800 hover:bg-green-600 hover:text-white text-green-400 py-3 rounded-xl text-sm font-bold transition-all">
                          View Details & Donate →
                        </button>
                      </Link>
                    </div>
                  </div>
              ))}
            </div>

            {!isLoading && campaigns.length === 0 && (
                <div className="text-center py-20 border border-dashed border-gray-800 rounded-3xl">
                  <p className="text-gray-500 text-xl mb-4">No campaigns found yet.</p>
                  <button onClick={() => setIsModalOpen(true)} className="text-green-500 hover:underline">
                    Be the first to start one!
                  </button>
                </div>
            )}

          </div>
        </div>
      </main>
  );
}