# Military Asset Management System (M.A.M.S.)

[![System Status](https://img.shields.io/badge/System-Online-emerald?style=for-the-badge&logo=opsgenie)](/)
[![Security](https://img.shields.io/badge/Security-RBAC%20Enabled-blue?style=for-the-badge&logo=guardant)](/)
[![License](https://img.shields.io/badge/Classification-Restricted-red?style=for-the-badge)](/)

## 🎖️ Overview

M.A.M.S. (Military Asset Management System) is a high-integrity tactical logistics platform designed for military commanders and logistics personnel. It provides an unified command center for tracking the acquisition, movement, assignment, and expenditure of critical theater assets (vehicles, weaponry, ammunition, and communications gear) across multiple global installations.

The platform ensures 100% accountability through a cryptographically secure audit trail, streamlining the complex supply chain from procurement to field expenditure.

---

## 🚀 Core Capabilities

### 📊 Strategic Command Dashboard
*   **Tactical Metrics**: Real-time visualization of Opening Balance, Closing Balance, and Net Movements.
*   **Drill-Down Analytics**: Interactive "Net Movement" pop-up for granular auditing of (Purchases + Transfers In - Transfers Out).
*   **Asset Status Distribution**: High-level distribution views (Available, Assigned, Expended, Maintenance).
*   **Multi-Base Synchronization**: Filter intelligence by individual installations or global aggregate views.

### 🛡️ Asset Lifecycle Management
*   **Asset Catalog**: Comprehensive registry for all hardware with unique identification tracking.
*   **Operational States**: Dynamic state management (AVAILABLE ↔ ASSIGNED ↔ MAINTENANCE).
*   **Asset Integrity**: Condition tracking from EXCELLENT to NON-OPERATIONAL.

### 🚛 Logistics & Transfer Engine
*   **Inter-Base Transfers**: Securely transfer assets between bases with origin and destination logging.
*   **Procurement Ledger**: Dedicated tracking for all new asset acquisitions.
*   **Audit Trail**: Immutable history of every asset movement with user attribution and timestamps.

### 🔑 Security & RBAC (Role-Based Access Control)
*   **ADMIN**: Global oversight, system configuration, and user provisioning.
*   **COMMANDER**: Tactical control over assigned base assets and operational reports.
*   **LOGISTICS**: Specialized access for supply chain management and transfer execution.

---

## 🛠️ Technical Specification

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Wouter, TanStack Query |
| **UI Framework** | Shadcn UI, Tailwind CSS (Tactical Theme) |
| **Visualization** | Recharts (Tactical Analytics) |
| **Backend** | Node.js, Express, Passport.js (Secure Session Auth) |
| **Persistence** | PostgreSQL, Drizzle ORM |
| **Validation** | Zod (Full-stack Schema Integrity) |

---

## 📂 Project Structure

```text
├── client/           # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable tactical UI
│   │   ├── hooks/       # API & State hooks
│   │   └── pages/       # Functional modules (Dashboard, Transfers, etc.)
├── server/           # Express backend
│   ├── auth.ts       # Security & Passport configuration
│   └── storage.ts    # Database access layer
├── shared/           # Shared types and Zod schemas
└── README.md         # System documentation
```

---

## 📜 Deployment & Operations

The system is configured for high-availability deployment on Replit, leveraging PostgreSQL for persistence and session management.

1.  **Environment Setup**: Requires `DATABASE_URL` and `SESSION_SECRET`.
2.  **Schema Migration**: Managed via `drizzle-kit push`.
3.  **Authentication**: Supports local credentials and Replit OAuth.

---

> **CONFIDENTIALITY NOTICE**: This system and its data are restricted. Unauthorized access is strictly prohibited and subject to military regulation.
