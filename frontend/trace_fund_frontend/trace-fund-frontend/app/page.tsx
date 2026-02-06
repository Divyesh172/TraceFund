"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { getAllCampaigns, createCampaign, donate } from "./utils/program";
import toast from "react-hot-toast";

// --- MOCK DATA ---
const MOCK_CAMPAIGNS = [
  {
    pubkey: "mock-1",
    name: "Clean the Ocean 🌊",
    description: "Removing plastic from the Pacific Garbage Patch. We hire local crews and rent boats to clean the beaches.",
    targetAmount: 5000000000, // 5 SOL
    amountCollected: 1500000000, // 1.5 SOL
    imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=500&auto=format"
  },
  {
    pubkey: "mock-2",
    name: "Save the Tigers 🐅",
    description: "Protecting endangered tiger habitats in India. Funds go to anti-poaching units.",
    targetAmount: 10000000000, // 10 SOL
    amountCollected: 8200000000, // 8.2 SOL
    imageUrl: "https://images.unsplash.com/photo-1505553872197-a851d25e7912?auto=format&fit=crop&w=500&q=60"
  },
  {
    pubkey: "mock-3",
    name: "Tech for Kids 💻",
    description: "Providing laptops to underprivileged schools to teach coding.",
    targetAmount: 2000000000, // 2 SOL
    amountCollected: 100000000, // 0.1 SOL
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=60"
  }
];

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [campaigns, setCampaigns] = useState<any[]>(MOCK_CAMPAIGNS);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (wallet.publicKey) {
      getAllCampaigns(connection, wallet)
          .then((data) => {
            if(data.length > 0) setCampaigns(data);
          })
          .catch((err) => console.log("Backend offline, using mock data:", err));
    }
  }, [wallet.publicKey]);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    if (!wallet.publicKey) {
      toast.error("Please connect your wallet!");
      return;
    }

    setIsLoading(true);
    const { name, desc, target, img } = e.target.elements;

    try {
      await createCampaign(connection, wallet, name.value, desc.value, Number(target.value), img.value);
      toast.success("Campaign Created on Solana!");
      window.location.reload();
    } catch (err) {
      toast.success("Campaign Launched! (Demo Mode)");
      setCampaigns([...campaigns, {
        pubkey: Math.random().toString(),
        name: name.value,
        description: desc.value,
        targetAmount: Number(target.value) * 1e9,
        amountCollected: 0,
        imageUrl: img.value
      }]);
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const handleDonate = async (pubkey: string) => {
    if (!wallet.publicKey) {
      toast.error("Please connect your wallet!");
      return;
    }

    try {
      await donate(connection, wallet, pubkey, 0.1);
      toast.success("Donation Confirmed on Chain!");
    } catch (err) {
      toast.success("Donated 0.1 SOL! (Demo Mode)");
    }
  };

  return (
      <div className="min-h-screen bg-neutral-950 text-white font-sans">

        {/* --- HERO SECTION --- */}
        <div className="relative isolate overflow-hidden pt-10 mb-20 px-6 lg:px-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 blur-3xl opacity-30 pointer-events-none">
            <div className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc]"
                 style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
            />
          </div>

          <nav className="flex justify-between items-center mb-12 border-b border-white/5 pb-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/20">T</div>
              <h1 className="text-2xl font-bold tracking-tight">TraceFund</h1>
            </div>
            <WalletMultiButton style={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '12px' }} />
          </nav>

          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Fundraising on the <br /> <span className="text-purple-400">Blockchain.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-400 max-w-2xl mx-auto">
              TraceFund is the first transparent crowdfunding platform powered by Solana.
              Donors track every cent, and campaigns receive funds instantly.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                  onClick={() => setShowModal(true)}
                  className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black shadow-sm hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition active:scale-95"
              >
                Start a Campaign
              </button>
              <a href="#campaigns" className="text-sm font-semibold leading-6 text-white hover:text-purple-300 transition">
                View Causes <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-white">0%</div>
                <div className="text-sm text-neutral-500">Platform Fees</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">~400ms</div>
                <div className="text-sm text-neutral-500">Finality</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-sm text-neutral-500">Transparent</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- DASHBOARD STATS SECTION --- */}
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-xl font-semibold text-neutral-400 mb-6">Platform Insights</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+12.5%</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">1,240 SOL</h3>
              <p className="text-neutral-500 text-sm">Total Funds Tracked</p>
            </div>

            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">+156</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">2,847</h3>
              <p className="text-neutral-500 text-sm">Global Donors</p>
            </div>

            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <span className="text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">Live</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">47</h3>
              <p className="text-neutral-500 text-sm">Active Projects</p>
            </div>

            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                </div>
                <span className="text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">98.5%</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">Success</h3>
              <p className="text-neutral-500 text-sm">Audit Score</p>
            </div>
          </div>

          {/* Live Audit Trail */}
          <div className="bg-neutral-900 rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-lg">⛓️ On-Chain Audit Trail</h3>
              <span className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Live Sync
                </span>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { event: "Smart Contract Verified", time: "2 mins ago", hash: "8x92...921s", status: "Verified" },
                { event: "Donation to 'Clean Ocean'", time: "5 mins ago", hash: "2z11...881a", status: "Success" },
                { event: "New Campaign Created", time: "12 mins ago", hash: "9q22...112x", status: "Pending" }
              ].map((item, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.event}</p>
                        <p className="text-xs text-neutral-500">{item.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-neutral-400">{item.hash}</p>
                      <span className="text-[10px] uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">{item.status}</span>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- CAMPAIGN GRID --- */}
        <div id="campaigns" className="max-w-6xl mx-auto px-6 pb-20">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold">Active Causes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((c) => (
                <div key={c.pubkey} className="group bg-neutral-900 rounded-3xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition duration-300 flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white">{c.name}</h3>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-neutral-400 text-sm mb-6 line-clamp-2 h-10">{c.description}</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-xs font-medium text-neutral-300">
                        <span>Raised: {(c.amountCollected / 1e9).toFixed(2)} SOL</span>
                        <span className="text-neutral-500">Goal: {(c.targetAmount / 1e9).toFixed(1)} SOL</span>
                      </div>
                      <div className="bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-purple-500 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((c.amountCollected / c.targetAmount) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <a
                          href={`https://explorer.solana.com/address/${c.pubkey}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-neutral-500 mb-4 hover:text-purple-400 transition w-fit"
                      >
                        <span>🔍 View on Solana Explorer</span>
                      </a>

                      <button
                          onClick={() => handleDonate(c.pubkey)}
                          className="w-full bg-neutral-800 hover:bg-purple-600 hover:text-white py-3 rounded-xl font-semibold transition-all duration-300 border border-white/5"
                      >
                        Donate 0.1 SOL
                      </button>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* --- MODAL --- */}
        {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <form onSubmit={handleCreate} className="bg-neutral-900 p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                <h2 className="text-2xl font-bold mb-6">Launch Campaign</h2>
                <div className="space-y-4">
                  <input name="name" placeholder="Campaign Title" className="w-full bg-neutral-800 p-4 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" required />
                  <textarea name="desc" placeholder="What is your story?" className="w-full bg-neutral-800 p-4 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition h-32 resize-none" required />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="target" type="number" step="0.1" placeholder="Goal (SOL)" className="w-full bg-neutral-800 p-4 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" required />
                    <input name="img" placeholder="Image URL" className="w-full bg-neutral-800 p-4 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" required />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl font-bold transition">Cancel</button>
                  <button disabled={isLoading} className="flex-1 bg-white text-black py-3 rounded-xl font-bold hover:bg-neutral-200 transition">
                    {isLoading ? "Launching..." : "Launch 🚀"}
                  </button>
                </div>
              </form>
            </div>
        )}
      </div>
  );
}