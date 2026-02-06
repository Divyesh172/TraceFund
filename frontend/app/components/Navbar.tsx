"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
    async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center p-6 bg-gray-900 text-white shadow-lg border-b border-gray-800">
            <Link href="/" className="text-2xl font-bold text-green-400 font-mono tracking-tighter hover:text-green-300 transition-colors">
                TraceFund 🔍
            </Link>

            {/* The Magic Button: Handles connection, disconnection, and wallet switching automatically */}
            <div className="rounded-xl overflow-hidden border border-green-600/50 hover:border-green-500 transition-all">
                <WalletMultiButton style={{ backgroundColor: "#16a34a" }} />
            </div>
        </nav>
    );
}