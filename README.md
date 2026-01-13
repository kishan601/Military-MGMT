# Military Asset Management System (M.A.M.S.)

A tactical logistics platform for managing military assets across multiple bases with Role-Based Access Control (RBAC).

## Features Implemented

### 1. Tactical Dashboard
- **Key Metrics**: Real-time tracking of Opening Balance, Closing Balance, Net Movement, Assigned, and Expended assets.
- **Visual Analytics**: 
  - Movement Analysis (Bar Chart) for Purchases vs. Transfers.
  - Asset Status Distribution (Pie Chart).
- **Deep Dive**: "Net Movement" pop-up breakdown showing (Purchases + Transfer In - Transfer Out).
- **Filtering**: Base-level data isolation.

### 2. Asset Management
- **Centralized Inventory**: Detailed tracking of vehicles, weapons, ammunition, and communication equipment.
- **Asset Lifecycle**: Status tracking from AVAILABLE to ASSIGNED, MAINTENANCE, TRANSIT, or EXPENDED.

### 3. Logistics & Transfers
- **Inter-Base Transfers**: Facilitates movement of assets between installations with a clear audit trail.
- **Purchase Recording**: Logging of new asset acquisitions and initial deployments.

### 4. Operations Tracking
- **Assignments**: Track assets assigned to specific personnel or units.
- **Expenditures**: Record usage and consumption of ammunition or other expendable assets.

### 5. Role-Based Access Control (RBAC)
- **ADMIN**: Full system oversight, user management, and base configuration.
- **COMMANDER**: Operational control over assigned base assets and movements.
- **LOGISTICS**: Focused access for recording purchases and executing transfers.

## Technical Architecture
- **Frontend**: React 18, Tailwind CSS (Military Theme), Shadcn UI, Recharts.
- **Backend**: Node.js, Express, Passport.js (Auth).
- **Database**: PostgreSQL with Drizzle ORM.
- **Validation**: Zod (Full-stack schema safety).
