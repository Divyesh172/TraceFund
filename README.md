# 🔍 TraceFund: Radical Transparency in Crowdfunding

> *"Donations with Zero Secrets."*

TraceFund is a decentralized crowdfunding platform built on the **Solana Blockchain**. Unlike traditional platforms (GoFundMe, Kickstarter) where money disappears into a black box, TraceFund tracks every single lamport from the donor's wallet to the final withdrawal.

---

## 🛑 The Problem
Traditional charity has a **trust crisis**.
* Donors don't know if their money actually reached the cause.
* "Admin costs" are often opaque.
* Scams and rug-pulls are common in crypto fundraising.

## ✅ The Solution
**TraceFund** enforces transparency via smart contracts.
1.  **Immutable History:** Every donation and withdrawal is permanently recorded on-chain.
2.  **Contextual Spending:** Admins *must* provide a public reason (e.g., "Buying Medical Supplies") to withdraw funds.
3.  **Public Audit:** Anyone can verify the cash flow in real-time without needing an account.

---

## 🌟 Key Features (Live on Devnet)

### 1. ⚡ Live Audit Trail
A persistent, real-time ledger that syncs across the platform. Every action—from campaign creation to donation—is logged and stored locally, ensuring donors never lose track of the platform's activity.

### 2. 📜 Proof of Impact Certificates
Donors receive an instant, generated "Certificate of Impact" upon contribution. This isn't just a receipt; it's a shareable digital asset that proves their on-chain philanthropy.

### 3. 💧 Built-in Devnet Faucet
We solved the "Empty Wallet" problem. Users can fund their Devnet wallets directly from our Navbar with a single click, removing barriers for testing and demos.

### 4. 🛡️ Trustless Smart Contracts
* **Solvency Checks:** The contract prevents over-withdrawal.
* **Admin Locks:** Only the campaign creator can access funds.
* **Zero Secrets:** All data is fetched directly from the Solana blockchain (PDA accounts).

---

## 🛠️ Tech Stack

* **Blockchain:** Solana (Devnet)
* **Smart Contract:** Anchor Framework 0.30+ (Rust)
* **Frontend:** Next.js 16 (App Router), React 19, TypeScript
* **Styling:** Tailwind CSS (Custom "Matrix Green" Theme)
* **Wallet:** Solana Wallet Adapter (Phantom, Solflare)
* **AI Tooling:** Noah AI (Generated comprehensive test suites for contract verification)

---

## 🤖 AI Implementation
We utilized **Noah AI** to enhance the reliability of our smart contract.
* **Automated Testing:** Noah AI generated the TypeScript test suite (`tests/trace_fund.ts`) used to verify edge cases in our `initialize`, `donate`, and `withdraw` instructions.
* **Benefit:** This allowed us to focus on frontend UX while ensuring backend security.

---

## 🚀 How to Run Locally

### Prerequisites
* Node.js (v18+)
* Rust & Cargo
* Solana CLI
* Anchor CLI

### 1. Clone the Repo
```bash
git clone [https://github.com/Divyesh172/TraceFund.git](https://github.com/Divyesh172/TraceFund.git)
cd TraceFund

Thirumalainambi was here
