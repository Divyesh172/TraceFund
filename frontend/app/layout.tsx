import React from "react"; // Fixed the namespace error
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "./components/WalletContextProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "TraceFund",
    description: "Transparent NGO Donations on Solana",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <WalletContextProvider>
            {children}
        </WalletContextProvider>
        </body>
        </html>
    );
}