"use client";
import { useEffect, useRef } from "react";
import { X, Download, Share2 } from "lucide-react";
import confetti from "canvas-confetti";

interface CertificateModalProps {
  donorName: string;
  amount: number;
  campaignName: string;
  onClose: () => void;
}

export default function CertificateModal({ donorName, amount, campaignName, onClose }: CertificateModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Trigger Confetti on Mount
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#9333ea', '#4f46e5', '#fbbf24'] // Purple, Indigo, Gold
    });
  }, []);

  // 2. Draw the Certificate
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high resolution
    const scale = 2; 
    canvas.width = 800 * scale;
    canvas.height = 600 * scale;
    ctx.scale(scale, scale);

    // --- DRAWING LOGIC (Adapted from your certificate-scripts.js) ---
    
    // Background
    ctx.fillStyle = "#F5F1E3"; // Cream background
    ctx.fillRect(0, 0, 800, 600);
    
    // Border
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#1e293b";
    ctx.strokeRect(20, 20, 760, 560);

    // Decorative Waves (Simplified for React)
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(200, 100, 400, 0, 800, 100);
    ctx.lineTo(800, 0);
    ctx.fill();

    // Text: Organization
    ctx.fillStyle = "#000000";
    ctx.font = "bold 24px Serif";
    ctx.textAlign = "center";
    ctx.fillText("TRACEFUND VERIFIED", 400, 80);

    // Text: Title
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 50px Sans-Serif";
    ctx.fillText("Certificate of Donation", 400, 180);

    // Text: Presented To
    ctx.font = "20px Sans-Serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("This certificate is presented to", 400, 230);

    // Text: Donor Name
    ctx.font = "italic bold 60px Serif";
    ctx.fillStyle = "#9333ea"; // Purple
    ctx.fillText(donorName || "Anonymous Hero", 400, 300);

    // Underline
    ctx.beginPath();
    ctx.moveTo(250, 310);
    ctx.lineTo(550, 310);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#cbd5e1";
    ctx.stroke();

    // Text: Details
    ctx.font = "24px Sans-Serif";
    ctx.fillStyle = "#334155";
    ctx.fillText(`For generously donating ${amount} SOL`, 400, 380);
    ctx.fillText(`to support "${campaignName}"`, 400, 420);

    // Text: Date
    const date = new Date().toLocaleDateString();
    ctx.font = "16px Sans-Serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`Issued on ${date}`, 400, 520);
    
    // Medal (Gold Circle)
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(400, 520, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "30px Serif";
    ctx.fillText("★", 400, 530);

  }, [donorName, amount, campaignName]);

  // 3. Download Function
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `TraceFund-Certificate-${donorName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // 4. Social Share Function
  const handleShareX = () => {
    // Note: We cannot auto-upload images to X without an API key.
    // Strategy: Download image -> Open Tweet Intent -> User attaches image.
    handleDownload();
    
    const text = `I just donated ${amount} SOL to "${campaignName}" on TraceFund! 🌍✨ Verifiable on Solana Blockchain. #TraceFund #Solana`;
    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: The Certificate Preview */}
        <div className="flex-1 bg-neutral-100 p-6 flex items-center justify-center relative">
            <canvas 
                ref={canvasRef} 
                className="w-full h-auto shadow-lg bg-white rounded-lg"
                style={{ maxWidth: '600px' }}
            />
        </div>

        {/* Right: Actions */}
        <div className="w-full md:w-80 bg-white p-8 flex flex-col justify-center space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    🎉
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Donation Successful!</h2>
                <p className="text-gray-500 mt-2 text-sm">Thank you for making a difference, {donorName}.</p>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
                >
                    <Download size={20} />
                    Download Certificate
                </button>
                
                <button 
                    onClick={handleShareX}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-bold hover:bg-neutral-800 transition border border-gray-200"
                >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                    Post on X
                </button>
            </div>

            <button onClick={onClose} className="text-gray-400 text-sm hover:text-gray-600">
                Close
            </button>
        </div>
      </div>
    </div>
  );
}