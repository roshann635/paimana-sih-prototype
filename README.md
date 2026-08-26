# PAIMANA AI Decision Support & Early Warning System

> **Predictive Risk Modeling, SHAP Root Cause Attribution, and Intervention Prioritization for National Infrastructure Projects.**

Built for **Smart India Hackathon (SIH)** and aligned with Ministry of Statistics and Programme Implementation (MoSPI) & Online Computerized Monitoring System (OCMS) standards.

---

## 🚀 Key Highlights & Differentiators

1. **Project-Month Snapshot Trajectory Store**: Preserves historical project evolution across 12–24 months rather than overwriting current state.
2. **Data Quality Engine (DQE)**: Validates incoming data, detects missingness, progress inversions, and cost bounds.
3. **Dual ML Risk Models with Strict Temporal Validation**:
   - **Cost Overrun Model (XGBoost)**: Predicts material budget expansion over 6 reporting months.
   - **Time Overrun Model (XGBoost)**: Predicts schedule slippage (>45 days) over 6 reporting months.
   - Evaluated using **Out-of-Time Temporal Split** (Trained on $\le$ June 2025, Evaluated on unseen subsequent snapshots).
4. **TreeSHAP Explainable AI**: Mathematically breaks down positive and negative risk contributors for every project.
5. **Intervention Priority Index (IPI)**:
   $$\text{IPI} = \text{Composite Risk} \times \text{Capital Exposure} \times \text{Schedule Criticality} \times \text{Deterioration Multiplier}$$
   Ranks top intervention candidates by administrative urgency.
6. **Prescriptive Actionable Review Layer**: Generates customized review checklists and tracks intervention outcomes over time.
7. **Grounded AI Assistant**: Combines structured database queries with SHAP explainability insights.

---

## 🏗️ System Architecture

```
                  PAIMANA / OGD / Flash Reports Data
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ Data Ingestion Engine │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │  Data Quality Engine  │
                     └───────────┬───────────┘
                                 │
                                 ▼
                  ┌─────────────────────────────┐
                  │ Project-Month Store (SQLite)│
                  └──────────────┬──────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │  Trajectory Features  │
                     └───────────┬───────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
         Cost Overrun Model              Time Overrun Model
          (XGBoost / LogReg)              (XGBoost / LogReg)
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                     ┌───────────────────────┐
                     │  Composite Risk (0-100)│
                     └───────────┬───────────┘
                                 │
             ┌───────────────────┼───────────────────┐
             ▼                   ▼                   ▼
     TreeSHAP Explain      Early Warnings      Priority Index (IPI)
             │                   │                   │
             └───────────────────┼───────────────────┘
                                 ▼
                     ┌───────────────────────┐
                     │  FastAPI REST Backend │
                     └───────────┬───────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
         React + Vite UI                 Grounded AI Assistant
        (6 Core Dashboards)              (SQL + SHAP Synthesis)
```

---

## 📊 Dashboard Views

- **1. National Portfolio Overview**: Capex at risk, executive KPIs, RAGB distribution, sector capex heatmap, and active alerts.
- **2. Priority Queue (The Killer Screen)**: Ranked IPI table with trajectory sparklines, filters, and one-click review actions.
- **3. Project Deep Dive**: S-curve progress vs. timeline, cumulative capex vs. expenditure area charts, and multi-month risk trends.
- **4. "Why is this Project High Risk?" (SHAP)**: Waterfall feature contribution chart and plain-English diagnosis.
- **5. Sector & Peer Benchmarking**: Project vs. sector median metrics across 22 national sectors.
- **6. Model Health & Auditability**: Out-of-time PR-AUC, Brier score calibration curve, baseline comparison, and DQE audit stats.

---

## ⚡ Quickstart & Running Locally

### 1. Backend & ML Pipeline
```bash
# Set up Python virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run the Master Seeding & ML Pipeline (Generates data, trains models, seeds SQLite)
python database/seed/seed_data.py

# Start FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```
Backend API will run at `http://127.0.0.1:8000` (Docs at `http://127.0.0.1:8000/docs`).

### 2. React Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will run at `http://localhost:5173`.

---

## 🧪 Running Automated Tests
```bash
pytest tests/test_api.py -v
```

