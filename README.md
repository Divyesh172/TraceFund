TraceFund 🚀
TraceFund is a transparent, blockchain-powered crowdfunding platform built on Solana. It ensures that every cent of a donation can be tracked, providing donors with 100% transparency while allowing campaigns to receive funds instantly with near-zero fees.
+1

✨ Key Features

100% Transparency: Every transaction is recorded on the Solana blockchain and publicly accessible via an on-chain audit trail.
+1


Near-Instant Finality: Leveraging Solana's high speed, transactions achieve finality in approximately 400ms.


0% Platform Fees: TraceFund operates with no platform fees, ensuring maximum impact for every donation.


Real-Time Impact Dashboard: A comprehensive suite of platform insights including "Total Funds Tracked," "Global Donors," and "Active Projects".
+3


On-Chain Audit Trail: A live-syncing record of smart contract verifications, new campaigns, and successful donations.
+1

Hybrid Demo Mode: The application features a robust demo mode that allows for UI walkthroughs even when the blockchain backend is offline.

🛠️ Tech Stack
Frontend: Next.js, Tailwind CSS, TypeScript.

Blockchain: Solana, Anchor Framework (Rust).

Wallet Integration: Solana Wallet Adapter (Support for Phantom, etc.).

📂 Project Structure
This repository is organized as a monorepo containing both the frontend application and the Solana smart contract:

Plaintext
/
├── frontend/             # Next.js web application
├── backend/              # Anchor/Solana smart contract
└── TraceFund.pdf         # Project overview and design documentation [cite: 1]
🚀 Getting Started
Prerequisites
Node.js (v18+)

Solana CLI

Anchor Framework

Backend Setup (Smart Contract)
Navigate to the backend directory:

Bash
cd backend/trace_fund_backend
Install dependencies:

npm install
Build the Anchor program:

anchor build
Deploy to Solana Devnet:

anchor deploy
Frontend Setup (Web App)
Navigate to the frontend directory:

cd frontend/trace_fund_frontend/trace-fund-frontend
Install dependencies:

npm install
Run the development server:

npm run dev
Open http://localhost:3000 in your browser.

📝 Smart Contract Logic
The core logic of TraceFund is handled by the trace_fund smart contract, which manages:

Campaign Initialization: Users can launch new campaigns with a name, description, target amount, and image.

Donations: Donors can send SOL directly to specific campaign accounts.

Withdrawals: Authorized campaign admins can safely withdraw collected funds while maintaining a minimum rent balance.

🛡️ Security
This project utilizes Program Derived Addresses (PDAs) for secure, scalable campaign account management. A robust .gitignore is in place to ensure sensitive data like private keypairs are never uploaded to version control.
