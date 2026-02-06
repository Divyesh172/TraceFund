"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";

interface DonationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: string;
    campaignName: string;
    donorAddress: string;
    txSignature: string;
}

export default function DonationSuccessModal({
                                                 isOpen, onClose, amount, campaignName, donorAddress, txSignature
                                             }: DonationSuccessModalProps) {

    const certificateRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen) return null;

    const downloadCertificate = async () => {
        if (!certificateRef.current) return;
        setIsDownloading(true);

        try {
            // Magic: Convert the HTML div to an Image
            const canvas = await html2canvas(certificateRef.current, {
                backgroundColor: "#000000", // Ensure background is captured
                scale: 2, // High resolution for Retina displays
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `TraceFund-Certificate-${txSignature.slice(0, 8)}.png`;
            link.click();
        } catch (err) {
            console.error("Failed to generate image", err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6 max-w-2xl w-full">

                {/* --- THE CERTIFICATE (This is what gets downloaded) --- */}
                <div
                    ref={certificateRef}
                    className="bg-gray-900 border-4 border-double border-green-600/50 p-10 rounded-xl text-center shadow-2xl w-full relative overflow-hidden"
                    style={{ backgroundImage: "radial-gradient(circle at center, #111827 0%, #000000 100%)" }}
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-green-500/20 rounded-tl-3xl m-4"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-green-500/20 rounded-br-3xl m-4"></div>

                    <div className="mb-2 uppercase tracking-[0.3em] text-green-500 text-sm font-bold">TraceFund Blockchain Verified</div>

                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-8 mt-4 tracking-wide">Certificate of Impact</h1>

                    <p className="text-gray-400 text-lg mb-2">This is to certify that</p>
                    <h2 className="text-2xl font-mono text-green-400 font-bold mb-6 truncate max-w-md mx-auto">{donorAddress}</h2>

                    <p className="text-gray-400 text-lg mb-2">Has successfully donated</p>
                    <div className="text-5xl font-bold text-white mb-6 drop-shadow-lg">{amount} SOL</div>

                    <p className="text-gray-400 text-lg mb-6">To the campaign</p>
                    <h3 className="text-2xl text-white font-bold mb-8 italic">"{campaignName}"</h3>

                    <div className="border-t border-gray-700 pt-6 flex justify-between items-end text-xs text-gray-500 font-mono">
                        <div className="text-left">
                            <div>DATE: {new Date().toLocaleDateString()}</div>
                            <div>SIG: {txSignature.slice(0, 12)}...</div>
                        </div>
                        <div className="text-right">
                            <div className="text-green-600 font-bold text-lg">TraceFund ✅</div>
                            <div>Immutable Proof</div>
                        </div>
                    </div>
                </div>

                {/* --- ACTIONS --- */}
                <div className="flex gap-4">
                    <button
                        onClick={downloadCertificate}
                        disabled={isDownloading}
                        className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 transform hover:scale-105"
                    >
                        {isDownloading ? "Generating..." : "📸 Download & Share"}
                    </button>

                    <button
                        onClick={onClose}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-full transition-all"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}