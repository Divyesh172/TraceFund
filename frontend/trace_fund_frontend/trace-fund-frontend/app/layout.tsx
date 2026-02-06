import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "./providers"; // <--- THIS IS THE KEY IMPORT
import { Toaster } from "react-hot-toast";
import "@solana/wallet-adapter-react-ui/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "TraceFund",
    description: "Solana Crowdfunding",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        {/* We wrap everything here so the Wallet works everywhere */}
        <SolanaProvider>
            {children}
            <Toaster position="bottom-center" />
        </SolanaProvider>
        </body>
        </html>
    );
}