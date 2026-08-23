# 🏥 MedVault

> **Your health data. Your keys. Your control.**

MedVault is a patient-sovereign, blockchain-secured, ABHA-integrated medical records vault. It gives patients verifiable cryptographic ownership of their medical records while ensuring instant, audited accessibility in emergencies.

---

## ⚠️ The Problem

India's healthcare data is fragmented across thousands of hospital silos. Patients don't truly own their data—hospitals do. When an emergency strikes, critical data (allergies, ongoing medications, past surgeries) is often completely inaccessible. 

While centralized health lockers exist, they represent a single point of failure and lack cryptographic proof of access. The patient remains a passive participant in their own health data journey.

## 💡 Our Solution

MedVault decentralizes medical records, putting the patient in complete control.

1. **ABHA-Verified Identity:** Users verify via India's Ayushman Bharat Health Account (ABHA) system, ensuring all users are real individuals. Doctors are verified via their NMC license numbers.
2. **Encrypted Storage on IPFS:** All medical files are encrypted inside the browser using AES-256-GCM before ever leaving the device. The encrypted blob is stored on IPFS.
3. **On-Chain Access Control:** All encryption keys and permissions live as smart contracts on the Internet Computer (ICP) blockchain. Patients can grant or instantly revoke time-bound access.
4. **Emergency Access Protocol:** Doctors can trigger emergency access with a mandatory justification, creating an immutable on-chain audit entry.
5. **Complete Audit Trail:** Every action (access, revocation, emergency trigger, abuse report) is permanently logged on-chain.

---

## 🛠️ Technology Stack

- **Smart Contracts:** TypeScript via Azle v0.29, deployed to the Internet Computer (ICP)
- **Authentication:** Internet Identity (Web3-native) + ABHA & NMC APIs
- **Encryption:** AES-256-GCM (Browser Native Web Crypto API)
- **Storage:** IPFS via Pinata SDK
- **Frontend:** React 18, Vite, Tailwind CSS (Custom Sleek Medical Theme)
- **State Management:** Zustand + TanStack Query

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- `dfx` (DFINITY SDK)

### 1. Start the Local ICP Replica
Open a terminal and run the local Internet Computer replica in the background:
```bash
dfx start --clean --background
```

### 2. Deploy the Backend Canister
In the project root, deploy the `medvault_backend` canister:
```bash
dfx deploy medvault_backend
```
*Note: This will generate the necessary Candid types in the `.dfx` directory.*

### 3. Generate Declarations
If you ever change the backend interface, make sure to regenerate the types:
```bash
dfx generate
```

### 4. Run the Frontend Client
Open a new terminal window, navigate to the client folder, and start the Vite development server:
```bash
cd client
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🚧 Challenges Faced

1. **IPFS Retrieval Latency:** Fetching large files (like MRI scans) from IPFS can be slower than traditional cloud storage. We are actively exploring gateway caching and CDN strategies.
2. **Web3 Onboarding Friction:** Transitioning users to Principal IDs (via Internet Identity) can be a hurdle. We designed a guided onboarding flow to abstract as much complexity as possible.
3. **Sandbox ABHA Integration:** Our MVP currently utilizes a sandbox/mock ABHA service. Production integration requires official ABDM sandbox approval.

## 🔮 Future Scope

- **AI-Assisted Diagnostics:** On-device AI models that scan a patient's vault and flag potential drug interactions or anomalies *before* a new prescription is written.
- **Offline Emergency via NFC:** A physical smart card that paramedics can tap to securely pull critical emergency data even without an active internet connection.
- **Anonymous Health Data Contribution:** Using Zero-Knowledge Proofs, patients could optionally and anonymously contribute their health data to medical researchers.
- **Full ABDM Ecosystem Integration:** Production integration with the Health Facility Registry, Health Professional Registry, and the Consent Manager.
