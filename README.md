# LexiMind Secure 🛡️

LexiMind Secure is a modern, enterprise-grade digital evidence and chain-of-custody management system. It is designed to ensure that digital files (like crime scene photos or audit logs) cannot be tampered with once uploaded, utilizing a true Microservices Architecture.

## 🏗️ Architecture & Technology Stack

### 1. The Frontend (User Interface)
* **React.js & Vite**: Provides an incredibly fast, dynamic user experience.
* **Tailwind CSS**: Used to design the modern, sleek security dashboards.
* **React Router**: Manages seamless navigation between the Command Center, Case Details, and Document Vault.

### 2. The Backend (Core Business Logic)
* **Python & Django**: A robust web framework handling core business logic, RBAC (Role-Based Access Control), and file storage.
* **Django REST Framework (DRF)**: Powers the API endpoints.
* **SQLite / PostgreSQL**: The standard relational database storing user profiles, cases, and general application state.

### 3. The Blockchain Ledger (Immutability & Trust)
* **Node.js**: A standalone microservice mimicking a Hyperledger Fabric peer.
* **Chaincode**: Enterprise smart contracts enforcing RBAC on the ledger.
* **SHA-256 Cryptography**: Generates a unique "digital fingerprint" for every piece of uploaded evidence to create a mathematically unalterable audit trail.

## 🚀 How to Run Locally

This project requires three servers to run simultaneously.

### 1. Start the Django Backend
\\\ash
cd leximind-backend
# Activate your virtual environment if you have one
pip install -r requirements.txt
python manage.py runserver
\\\
*Runs on http://localhost:8000*

### 2. Start the Simulated Hyperledger Fabric Node
\\\ash
cd leximind-fabric-node
npm install
node server.js
\\\
*Runs on http://localhost:4000*

### 3. Start the React Frontend
\\\ash
cd leximind-portal
npm install
npm run dev
\\\
*Runs on http://localhost:5173*
