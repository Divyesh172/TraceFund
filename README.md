# 🔍 TraceFund: Radical Transparency in Crowdfunding

> **"Donations with Zero Secrets."**

TraceFund is a decentralized crowdfunding platform built on the **Solana Blockchain**. Unlike traditional platforms (GoFundMe, Kickstarter) where money disappears into a black box, TraceFund tracks every single lamport from the donor's wallet to the final withdrawal.

**Built for the [Name of Hackathon] 2025.**

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

## 🌟 Key Features

### 1. 🛡️ On-Chain Audit Logs
A real-time, tamper-proof ledger displayed directly on the campaign page. Donors can see exactly when funds were withdrawn and why.

### 2. 🏆 Top Donors Leaderboard (Gamification)
We gamify philanthropy. A live leaderboard tracks the most generous contributors, creating social proof and encouraging larger donations.

### 3. 📜 Instant Impact Certificates
Upon donating, users receive a "Certificate of Impact" modal proving their contribution, designed for instant social sharing (Twitter/X).

### 4. ⚡ Powered by Solana
* **Near-Zero Fees:** Donating $10 costs fractions of a cent.
* **Instant Finality:** Transactions confirm in <400ms.

---

## 🛠️ Tech Stack

* **Blockchain:** Solana (Devnet)
* **Smart Contract Framework:** Anchor (Rust)
* **Frontend:** Next.js 14 (App Router), React, TypeScript
* **Styling:** Tailwind CSS
* **Wallet Connection:** Solana Wallet Adapter (Phantom support)

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
