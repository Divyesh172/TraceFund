"use client";

import { useEffect, useRef } from "react";

interface DonationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    campaignName: string;
}

export default function DonationSuccessModal({
                                                 isOpen,
                                                 onClose,
                                                 amount,
                                                 campaignName
                                             }: DonationSuccessModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // 1. Background
            ctx.fillStyle = '#111827';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Green Waves
            const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
            g.addColorStop(0, '#16a34a'); // Green 600
            g.addColorStop(1, '#22c55e'); // Green 500

            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(canvas.width, 0);
            ctx.lineTo(canvas.width, 60);
            ctx.bezierCurveTo(canvas.width * 0.75, 40, canvas.width * 0.25, 80, 0, 60);
            ctx.fill();

            // Bottom Wave
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(canvas.width, canvas.height - 40);
            ctx.bezierCurveTo(canvas.width * 0.75, canvas.height - 60, canvas.width * 0.25, canvas.height - 20, 0, canvas.height - 40);
            ctx.fill();

            // 3. Text
            ctx.textAlign = 'center';

            // Brand
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 24px monospace';
            ctx.fillText('TRACEFUND 🔍', canvas.width / 2, 110);

            // Title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 42px sans-serif';
            ctx.fillText('Certificate of Impact', canvas.width / 2, 170);

            // Details
            ctx.font = 'italic 28px serif';
            ctx.fillStyle = '#9ca3af';
            ctx.fillText(`Presented for supporting`, canvas.width / 2, 230);

            ctx.font = 'bold 32px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`"${campaignName}"`, canvas.width / 2, 270);

            // Amount
            ctx.font = 'bold 48px monospace';
            ctx.fillStyle = '#4ade80';
            ctx.fillText(`${amount} SOL`, canvas.width / 2, 340);

            // Footer
            ctx.font = '14px monospace';
            ctx.fillStyle = '#4b5563';
            const date = new Date().toLocaleDateString();
            ctx.fillText(`Verified on Solana • ${date}`, canvas.width / 2, 420);
        }
    }, [isOpen, amount, campaignName]);

    const downloadCertificate = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = `TraceFund_Proof_${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL();
        link.click();
    };

    // If not open, return nothing (Standard React pattern)
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Overlay */}
            <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-xl rounded-2xl bg-black border border-green-500/30 p-6 shadow-2xl shadow-green-900/20 animate-in fade-in zoom-in duration-200">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        🎉 Contribution Verified
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none">
                        &times;
                    </button>
                </div>

                <canvas
                    ref={canvasRef}
                    width={600}
                    height={450}
                    className="w-full rounded-xl shadow-lg mb-6 border border-gray-800"
                />

                <button
                    onClick={downloadCertificate}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    📥 Download Proof
                </button>
            </div>
        </div>
    );
}