# 🏛️ PAIMANA — National Infrastructure Intelligence Command Centre

> **Predictive Early Warning, Risk Forecasting, and Intervention Priority Decision-Support System for Central Sector Infrastructure Projects (MoSPI — Infrastructure and Project Monitoring Division)**

---

## 📌 Executive Summary

**PAIMANA** transforms monthly infrastructure reporting data into continuous, explainable, and actionable foresight. Built on longitudinal **MoSPI Central Sector Flash Reports** ($\ge$ ₹150 Crore sanctioned cost), PAIMANA continuously digests project-month snapshots to predict cost overrun probability, schedule slippage drift, and compute the **Intervention Priority Index (IPI)** for executive review.

```
PAIMANA / OCMS DATA ──► DATA QUALITY ENGINE (DQE) ──► LONGITUDINAL DATABASE (6,090 Snapshots)
                                                                 │
      ┌──────────────────────────────────────────────────────────┴────────────────────────┐
      ▼                                                                                   ▼
COST OVERRUN MODEL (XGBoost)                                                SCHEDULE SLIPPAGE MODEL (XGBoost)
(ROC-AUC: 0.8656, PR-AUC: 0.4462)                                           (ROC-AUC: 0.8470, PR-AUC: 0.3689)
      │                                                                                   │
      └──────────────────────────┬────────────────────────────────────────────────────────┘
                                 ▼
                     COMPOSITE RISK ENGINE & IPI
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
TreeSHAP EXPLANATIONS    EARLY WARNING ALERTS       ADMINISTRATIVE INTERVENTIONS
(Local Attributions)     (101 Active Bulletins)     (Longitudinal Feedback Loop)
                                 │
                                 ▼
              COMMAND CENTRE FRONTEND & GROUNDED AI ASSISTANT
```

---

## 🚀 Key System Capabilities

### 1. 📊 Monitored Portfolio Command Centre (`/`)
- **1,630 Central Infrastructure Projects** across 25 sectors.
- **₹75.76 Lakh Crore** Revised Cost Baseline (+6.4% escalation vs. sanctioned).
- **₹19.10 Lakh Crore** Cumulative Capex Drawdown (25.2% financial progress).
- **Portfolio Health Index (72.4 / 100)** with 5-month longitudinal trajectory and dynamic risk tier distribution:
  - **High Risk (`ORANGE`)**: 33 Projects (2.0%)
  - **Moderate Risk (`AMBER`)**: 492 Projects (30.2%)
  - **Stable / Low Risk (`GREEN`)**: 1,105 Projects (67.8%)

### 2. 🗺️ Spatial Infrastructure Risk Observatory (`/map`)
- Full SVG India geographic heatmap bound to **live SQL database aggregations** for all 35 States and Union Territories.
- Multi-mode telemetry toggle: **Risk**, **Density**, **Exposure (Capex)**, and **Project Volume**.
- Floating top-right HUD dossier displaying state-level metrics (e.g. Maharashtra: 147 projects, ₹6,07,703 Cr exposure, 53.5% avg progress).

### 3. 🎯 Intervention Priority Queue (`/priority-queue`)
- Multi-factor ranking algorithm prioritizing projects by **Intervention Priority Index (IPI)**:
  $$\text{IPI} = w_1 \cdot P(\text{Cost Overrun}) + w_2 \cdot P(\text{Schedule Delay}) + w_3 \cdot \log(\text{Capex Exposure}) + w_4 \cdot \text{Trajectory Deterioration}$$
- Eliminates cognitive overload by sorting hundreds of projects into an ordered action queue.

### 4. 🔍 Deep Dive & Explainable ML (`/projects/:id`)
- **Physical Progress S-Curves vs. Capex Drawdowns**.
- **Longitudinal Risk Trajectory** with tier escalation reference lines.
- **TreeSHAP Impact Decomposition Spectrum**: Isolates the exact contribution of milestone velocity deceleration, expenditure ratios, and schedule drift.
- **Simulated Administrative Action Memorandum Modal**: Records administrative directives into the audit trail.

### 5. 🚨 Early Warning Surveillance Center (`/early-warnings`)
- **101 Active Surveillance Bulletins** triggered automatically when a project's 3-month physical velocity diverges from its historical sector baseline or expenditure outpaces physical completion.

### 6. 📈 Sector & Ministry Analytics (`/analytics/sectors`, `/analytics/ministries`, `/analytics/benchmarking`)
- Comprehensive breakdown across Highways, Railways, Petroleum, Power, Coal, Urban Development, and Ports.
- Empirical median baselines for peer comparison.

### 7. 🤖 Grounded Decision Support AI Assistant
- Integrated conversational intelligence drawer powered by live SQLite database queries.
- Instant lookup for project codes, state portfolios, sector exposure, and out-of-time model benchmarks with grounded evidence citations.

### 8. 🛡️ Algorithmic Governance & Data Quality Engine (`/intelligence/model-health`, `/data-quality`)
- Out-of-time test evaluation benchmarks, Brier calibration scores, and false-negative suppression metrics.
- Automated DQE integrity checks across 6,787 audited monthly snapshots.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend API** | Python 3.11+, FastAPI, SQLAlchemy, SQLite, Pydantic v2, Uvicorn |
| **Machine Learning** | XGBoost Classifier, Scikit-learn (`CalibratedClassifierCV`), SHAP (`TreeExplainer`), Joblib |
| **Frontend UI** | React 18, Vite 6, Tailwind CSS, Lucide Icons, Recharts |
| **Theme & Aesthetic** | Institutional Command Centre Palette (`#07131F`, `#0D1E30`, `#00E5FF`, `#F59E0B`, `#EF4444`) |
| **Testing** | Pytest, FastAPI TestClient, Automated End-to-End Verification Suite |

---

## 📂 Repository Structure

```
paimana/
├── backend/
│   └── app/
│       ├── api/               # FastAPI endpoints & route handlers
│       ├── database/          # SQLite schema & session management
│       ├── schemas/           # Pydantic data schemas
│       ├── services/          # Business logic (Dashboard, Projects, Assistant)
│       └── main.py            # FastAPI application entrypoint
├── data/
│   └── paimana.db             # Normalized SQLite longitudinal database
├── database/
│   └── seed/                  # Seed scripts & data normalizers
├── frontend/
│   ├── src/
│   │   ├── components/        # KPICards, IndiaMap, TrajectoryCharts, DataTable
│   │   ├── pages/             # 12 Command Centre Page Views
│   │   ├── services/api/      # Axios / Fetch API client
│   │   ├── App.jsx            # Unified Route Resolver
│   │   └── index.css          # Command Centre Design System & Tokens
│   ├── package.json           # Frontend dependencies
│   ├── tailwind.config.js     # Dark Command Palette tokens
│   └── vite.config.js         # Vite configuration
├── ml/
│   └── artifacts/             # Trained XGBoost models & feature encoders
├── tests/
│   ├── test_api.py            # Pytest test suite
│   └── verify_all_endpoints.py# Comprehensive 16-endpoint verification script
├── README.md
└── .gitignore
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/roshann635/paimana-sih-prototype.git
cd paimana-sih-prototype

# Create & activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Start the FastAPI Backend Server (Runs on port 8000)
uvicorn backend.app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite Development Server (Runs on port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests

```bash
# Run backend pytest suite
pytest tests/test_api.py

# Run comprehensive all-endpoint verification script
python tests/verify_all_endpoints.py

# Run frontend production build test
cd frontend && npm run build
```

---

## 📜 Governance & Prototype Disclaimer

> **Disclaimer**: PAIMANA is an advanced decision-support research prototype developed for infrastructure project monitoring. Action memorandums, reference IDs, and predictive scores are generated for analytical decision-support and prototype demonstration purposes.
