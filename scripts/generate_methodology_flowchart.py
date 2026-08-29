"""
High-Resolution Engineering Flowchart Generator for PAIMANA Platform
Renders a crisp, 300 DPI, modern architecture & methodology flowchart diagram.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, PathPatch
import matplotlib.patheffects as path_effects
import numpy as np

def create_flowchart():
    # Set up ultra-high-definition figure (16:9 widescreen)
    fig, ax = plt.subplots(figsize=(24, 13.5), dpi=300)
    fig.patch.set_facecolor('#0B132B')  # Premium dark command-center slate background
    ax.set_facecolor('#0B132B')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Color Palette
    PRIMARY_BLUE = '#1C64F2'
    CYAN_ACCENT = '#06B6D4'
    EMERALD_GREEN = '#10B981'
    AMBER_WARN = '#F59E0B'
    RED_ALERT = '#EF4444'
    CARD_BG_DARK = '#1C2541'
    CARD_BG_SUB = '#253256'
    TEXT_LIGHT = '#F8FAFC'
    TEXT_MUTED = '#94A3B8'
    BORDER_COLOR = '#3B82F6'

    # Title Header
    ax.text(50, 96.5, "PAIMANA: AI & EARTH OBSERVATION INFRASTRUCTURE MONITORING PLATFORM", 
            fontsize=22, fontweight='black', color='#FFFFFF', ha='center', va='center',
            family='sans-serif')
    ax.text(50, 94.0, "END-TO-END METHODOLOGY, DATA FLOW & DECISION ARCHITECTURE", 
            fontsize=13, fontweight='bold', color=CYAN_ACCENT, ha='center', va='center',
            family='sans-serif')

    # Helper function for drawing rounded cards
    def draw_card(x, y, w, h, title, subtitle="", bg_color=CARD_BG_DARK, border_color=BORDER_COLOR, title_color='#FFFFFF', border_width=1.5):
        box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=1.2",
                             facecolor=bg_color, edgecolor=border_color, linewidth=border_width, zorder=2)
        ax.add_patch(box)
        if title:
            ax.text(x + w/2, y + h - 2.2, title, fontsize=10.5, fontweight='black', color=title_color, ha='center', va='center', zorder=3)
        if subtitle:
            ax.text(x + w/2, y + h - 4.0, subtitle, fontsize=8.0, fontweight='bold', color=TEXT_MUTED, ha='center', va='center', zorder=3)
        return box

    # Helper function for drawing clear arrows
    def draw_arrow(x1, y1, x2, y2, color=CYAN_ACCENT, lw=2.5, style='->', label='', label_pos=(0.5, 0.5), label_color='#FFFFFF', label_bg=None):
        arrow = FancyArrowPatch((x1, y1), (x2, y2),
                                arrowstyle='-|>', mutation_scale=18,
                                color=color, linewidth=lw, zorder=4)
        ax.add_patch(arrow)
        if label:
            lx = x1 + (x2 - x1) * label_pos[0]
            ly = y1 + (y2 - y1) * label_pos[1]
            bbox_props = dict(boxstyle="round,pad=0.3", fc=label_bg if label_bg else CARD_BG_DARK, ec=color, lw=1)
            ax.text(lx, ly, label, fontsize=8, fontweight='bold', color=label_color, ha='center', va='center', bbox=bbox_props, zorder=5)

    # 5 Major Column Containers
    col_w = 17.0
    col_gap = 2.5
    cols_x = [2.5 + i*(col_w + col_gap) for i in range(5)]
    stage_y = 88.5
    stage_h = 80.0

    column_titles = [
        ("STAGE 1: DATA INGESTION", "Multi-Source Raw Inputs", PRIMARY_BLUE),
        ("STAGE 2: QUALITY & GATING", "Validation & Spatial Filtering", CYAN_ACCENT),
        ("STAGE 3: ANALYTIC ENGINES", "Dual-Track ML & EO Processing", '#8B5CF6'),
        ("STAGE 4: SIMULATION & ALERTS", "What-If & Early Warnings", AMBER_WARN),
        ("STAGE 5: ACTION & OUTPUTS", "Executive Decision Governance", EMERALD_GREEN)
    ]

    for i, (title, sub, accent) in enumerate(column_titles):
        x = cols_x[i]
        # Column background zone
        zone = FancyBboxPatch((x, 8.0), col_w, stage_h, boxstyle="round,pad=0.4,rounding_size=1.5",
                              facecolor='#131D3B', edgecolor=accent, linewidth=1.2, alpha=0.9, zorder=1)
        ax.add_patch(zone)
        # Column Header Badge
        hdr = FancyBboxPatch((x + 0.5, stage_y - 2.5), col_w - 1.0, 4.0, boxstyle="round,pad=0.2,rounding_size=0.8",
                             facecolor=accent, edgecolor='#FFFFFF', linewidth=1.0, zorder=2)
        ax.add_patch(hdr)
        ax.text(x + col_w/2, stage_y - 0.7, title, fontsize=9.5, fontweight='black', color='#FFFFFF', ha='center', va='center', zorder=3)
        ax.text(x + col_w/2, stage_y - 1.8, sub, fontsize=7.5, fontweight='bold', color='#E2E8F0', ha='center', va='center', zorder=3)

    # ==================== COLUMN 1: DATA INGESTION ====================
    c1_x = cols_x[0] + 1.2
    c1_w = col_w - 2.4

    # 1.1 MoSPI OCMS
    draw_card(c1_x, 72.0, c1_w, 10.5, "1.1 MoSPI OCMS Data", "Monthly EVM Reports (>= ₹150 Cr)", border_color=PRIMARY_BLUE)
    ax.text(c1_x + c1_w/2, 75.2, "• Planned vs Actual Cost\n• Milestone Delay Days\n• Physical % Reported (P)", 
            fontsize=7.5, color='#CBD5E1', ha='center', va='center', zorder=3)

    # 1.2 PM GatiShakti GIS
    draw_card(c1_x, 56.0, c1_w, 10.5, "1.2 PM GatiShakti GIS", "Geospatial RoW & Boundaries", border_color=PRIMARY_BLUE)
    ax.text(c1_x + c1_w/2, 59.2, "• Project Alignment Polylines\n• Site GeoJSON Boundaries\n• State & District Geometries", 
            fontsize=7.5, color='#CBD5E1', ha='center', va='center', zorder=3)

    # 1.3 Copernicus Constellation
    draw_card(c1_x, 40.0, c1_w, 10.5, "1.3 Copernicus Constellation", "Earth Observation Feeds", border_color=PRIMARY_BLUE)
    ax.text(c1_x + c1_w/2, 43.2, "• Sentinel-2 L2A (10m Optical)\n• Sentinel-1 C-SAR (GRD Radar)\n• 5-day Global Revisit", 
            fontsize=7.5, color='#CBD5E1', ha='center', va='center', zorder=3)

    # 1.4 Geo-Tagged Ground Audit
    draw_card(c1_x, 24.0, c1_w, 10.5, "1.4 Ground & Field Logs", "In-situ Verification Feeds", border_color=PRIMARY_BLUE)
    ax.text(c1_x + c1_w/2, 27.2, "• Contractor MB Measurement\n• Geo-tagged Site Photos\n• Statutory Clearance Status", 
            fontsize=7.5, color='#CBD5E1', ha='center', va='center', zorder=3)

    # ==================== COLUMN 2: QUALITY & GATING ====================
    c2_x = cols_x[1] + 1.2
    c2_w = col_w - 2.4

    # 2.1 Anti-Lookahead Gate
    draw_card(c2_x, 72.0, c2_w, 10.5, "2.1 Temporal Boundary Gate", "Strict Anti-Lookahead Filter", border_color=CYAN_ACCENT)
    ax.text(c2_x + c2_w/2, 75.2, "• Query constraint: t_acq <= T\n• Prevents future data leakage\n• Maintains audit fidelity", 
            fontsize=7.5, color='#CBD5E1', ha='center', va='center', zorder=3)

    # 2.2 Spatial Suitability Gate (Diamond style)
    draw_card(c2_x, 54.0, c2_w, 13.0, "2.2 Spatial Suitability Gate", "10m GSD Resolution Gate", border_color=AMBER_WARN)
    ax.text(c2_x + c2_w/2, 59.5, "Criteria Check:\n• Corridor Width >= 15m\n• Footprint Area >= 0.5 km²", 
            fontsize=7.5, fontweight='bold', color='#FEF08A', ha='center', va='center', zorder=3)
    ax.text(c2_x + c2_w/2, 55.5, "[PASS -> EO Track | FAIL -> NOT_OBSERVABLE]", 
            fontsize=6.8, fontweight='black', color=CYAN_ACCENT, ha='center', va='center', zorder=3)

    # 2.3 Data Quality & Imputation
    draw_card(c2_x, 34.0, c2_w, 14.5, "2.3 Data Integrity Engine", "Cleanse & Quality Scoring", border_color=CYAN_ACCENT)
    ax.text(c2_x + c2_w/2, 40.0, "• Missing value imputation\n• Outlier statistical filtering\n• Data Quality Score (DQS 0-100)\n• Temporal continuity check", 
            fontsize=7.5, color='#CBD5E1', ha='center', va='center', zorder=3)

    # ==================== COLUMN 3: CORE ANALYTIC ENGINES ====================
    c3_x = cols_x[2] + 1.2
    c3_w = col_w - 2.4

    # 3.1 ML Predictive Risk Engine (Top Half)
    draw_card(c3_x, 53.0, c3_w, 29.5, "3.1 ML Predictive Risk Engine", "AI Cost & Schedule Forecasting", border_color='#A855F7', bg_color='#231B42')
    ax.text(c3_x + c3_w/2, 75.5, "XGBoost & Random Forest Models\n• Probability of Severe Delay (>90d)\n• Cost Overrun Magnitude (₹ Cr)\n• Composite Risk Score (0-100)", 
            fontsize=7.5, color='#E9D5FF', ha='center', va='center', zorder=3)
    # SHAP Box
    draw_card(c3_x + 0.8, 55.0, c3_w - 1.6, 9.5, "SHAP Explainability Module", "Root-Cause Attribution", border_color='#C084FC', bg_color='#2E1065')
    ax.text(c3_x + c3_w/2, 58.5, "• Land Acquisition Lag (38%)\n• Contractor Capacity Gap (24%)\n• Fund Flow Friction (18%)", 
            fontsize=7.0, color='#F3E8FF', ha='center', va='center', zorder=3)

    # 3.2 Satellite Cross-Verification Engine (Bottom Half)
    draw_card(c3_x, 12.0, c3_w, 36.5, "3.2 Satellite EO Engine", "Physical Surface Transformation", border_color=CYAN_ACCENT, bg_color='#0F2E4A')
    ax.text(c3_x + c3_w/2, 42.0, "Multi-Sensor Spectral & Radar:\n• Optical: NDVI, NDBI, BSI, NDWI\n• SAR: Calibrated Gamma0 (VV, VH)", 
            fontsize=7.2, color='#BAE6FD', ha='center', va='center', zorder=3)
    
    # Evidence Quality & Fusion Box
    draw_card(c3_x + 0.8, 23.0, c3_w - 1.6, 12.0, "Evidence Quality Gate", "Adaptive Dynamic Weighting", border_color='#38BDF8', bg_color='#0C4A6E')
    ax.text(c3_x + c3_w/2, 27.5, "• SCL Cloud Masking applied\n• Monsoon: SAR weight -> 65%\n• Observed Change Index (OSC_100)\n• Discrepancy: D_pp = OSC_100 - P", 
            fontsize=7.0, color='#E0F2FE', ha='center', va='center', zorder=3)

    # Discrepancy Classification
    draw_card(c3_x + 0.8, 14.0, c3_w - 1.6, 7.5, "Status Classifier", "D_pp Gap Mapping", border_color='#38BDF8', bg_color='#0C4A6E')
    ax.text(c3_x + c3_w/2, 16.5, "CONSISTENT | REVIEW | SIGNIFICANT", 
            fontsize=6.8, fontweight='black', color='#7DD3FC', ha='center', va='center', zorder=3)

    # ==================== COLUMN 4: SIMULATION & ALERTS ====================
    c4_x = cols_x[3] + 1.2
    c4_w = col_w - 2.4

    # 4.1 What-If Counterfactual Simulator
    draw_card(c4_x, 63.0, c4_w, 19.5, "4.1 What-If Simulator", "Policy & Budget Interventions", border_color=AMBER_WARN, bg_color='#3B2D12')
    ax.text(c4_x + c4_w/2, 74.5, "Counterfactual Testing:\n• 'What if RoW cleared +45 days?'\n• 'What if ₹50 Cr injected?'\n• Delay reduction simulation\n• Cost-benefit optimization", 
            fontsize=7.5, color='#FEF08A', ha='center', va='center', zorder=3)

    # 4.2 Monte Carlo Schedule Forecaster
    draw_card(c4_x, 40.0, c4_w, 18.5, "4.2 Monte Carlo Engine", "Probabilistic Delay Curves", border_color=AMBER_WARN, bg_color='#3B2D12')
    ax.text(c4_x + c4_w/2, 50.5, "10,000 Iteration Simulations:\n• P50, P80, P95 completion dates\n• Critical path risk variance\n• Sensitivity analysis", 
            fontsize=7.5, color='#FEF08A', ha='center', va='center', zorder=3)

    # 4.3 Early Warning System
    draw_card(c4_x, 17.0, c4_w, 18.5, "4.3 Early Warning System", "Proactive Triggers & Alerts", border_color=RED_ALERT, bg_color='#3D131A')
    ax.text(c4_x + c4_w/2, 27.5, "Automated Threat Triggers:\n• Red: Critical Delay/Discrepancy\n• Amber: Schedule Slippage Watch\n• Green: On-Track Milestones\n• Multi-tier escalation queues", 
            fontsize=7.5, color='#FECDD3', ha='center', va='center', zorder=3)

    # ==================== COLUMN 5: ACTIONABLE OUTPUTS ====================
    c5_x = cols_x[4] + 1.2
    c5_w = col_w - 2.4

    # 5.1 National Command Center
    draw_card(c5_x, 67.0, c5_w, 15.5, "5.1 National Command Center", "Macro Portfolio Intelligence", border_color=EMERALD_GREEN, bg_color='#064E3B')
    ax.text(c5_x + c5_w/2, 75.5, "• National Infrastructure Map\n• Sector Risk Heatmaps\n• Critical Project Priority Queue\n• Ministry Performance Scorecards", 
            fontsize=7.5, color='#A7F3D0', ha='center', va='center', zorder=3)

    # 5.2 Project Deep Dive Studio
    draw_card(c5_x, 48.0, c5_w, 15.5, "5.2 Project Deep Dive Studio", "Micro Milestone Diagnostics", border_color=EMERALD_GREEN, bg_color='#064E3B')
    ax.text(c5_x + c5_w/2, 56.5, "• Multi-band Satellite Studio\n• S-Curve EVM Diagnostic Curves\n• SHAP Factor Waterfalls\n• Temporal Divergence History", 
            fontsize=7.5, color='#A7F3D0', ha='center', va='center', zorder=3)

    # 5.3 Automated Action Memorandums & Audit Trail
    draw_card(c5_x, 14.0, c5_w, 30.5, "5.3 Executive Action Stack", "Enforceable Governance", border_color=EMERALD_GREEN, bg_color='#064E3B')
    ax.text(c5_x + c5_w/2, 33.5, "Automated Legal & Admin Outputs:\n• Site Inspection Directives\n• Milestone Fund Freeze Alerts\n• Contractor Dispute Evidence\n• Executive Action Memorandums", 
            fontsize=7.5, color='#A7F3D0', ha='center', va='center', zorder=3)
    # SHA-256 Badge
    draw_card(c5_x + 0.8, 16.0, c5_w - 1.6, 8.5, "SHA-256 Audit Packet", "SAT-2026-XXXXXX", border_color='#34D399', bg_color='#047857')
    ax.text(c5_x + c5_w/2, 19.0, "Cryptographic Evidence Hash\nTamper-Proof Verification", 
            fontsize=6.8, fontweight='black', color='#FFFFFF', ha='center', va='center', zorder=3)


    # ==================== CONNECTING FLOW ARROWS ====================
    # 1. Col 1 -> Col 2
    draw_arrow(c1_x + c1_w, 77.25, c2_x, 77.25, color=PRIMARY_BLUE, lw=2.5)
    draw_arrow(c1_x + c1_w, 61.25, c2_x, 60.5, color=PRIMARY_BLUE, lw=2.5)
    draw_arrow(c1_x + c1_w, 45.25, c2_x, 41.25, color=PRIMARY_BLUE, lw=2.5)
    draw_arrow(c1_x + c1_w, 29.25, c2_x, 38.0, color=PRIMARY_BLUE, lw=2.5)

    # 2. Col 2 Internal Flow
    draw_arrow(c2_x + c2_w/2, 72.0, c2_x + c2_w/2, 67.0, color=CYAN_ACCENT, lw=2.0)
    draw_arrow(c2_x + c2_w/2, 54.0, c2_x + c2_w/2, 48.5, color=CYAN_ACCENT, lw=2.0)

    # 3. Col 2 -> Col 3 (Parallel ML & EO Tracks)
    draw_arrow(c2_x + c2_w, 75.0, c3_x, 72.0, color='#A855F7', lw=3.0, label="Clean EVM", label_pos=(0.4, 0.5), label_color='#E9D5FF', label_bg='#231B42')
    draw_arrow(c2_x + c2_w, 58.0, c3_x, 30.0, color=CYAN_ACCENT, lw=3.0, label="Observable AOI", label_pos=(0.4, 0.5), label_color='#BAE6FD', label_bg='#0F2E4A')
    draw_arrow(c2_x + c2_w, 39.0, c3_x, 62.0, color='#A855F7', lw=2.0)

    # 4. Col 3 -> Col 4 (Simulations & Early Warnings)
    draw_arrow(c3_x + c3_w, 70.0, c4_x, 73.0, color=AMBER_WARN, lw=2.8)
    draw_arrow(c3_x + c3_w, 60.0, c4_x, 49.0, color=AMBER_WARN, lw=2.8)
    draw_arrow(c3_x + c3_w, 22.0, c4_x, 26.0, color=RED_ALERT, lw=3.0, label="Discrepancy Gap", label_pos=(0.4, 0.5), label_color='#FECDD3', label_bg='#3D131A')

    # 5. Col 4 Internal flow
    draw_arrow(c4_x + c4_w/2, 63.0, c4_x + c4_w/2, 58.5, color=AMBER_WARN, lw=2.0)
    draw_arrow(c4_x + c4_w/2, 40.0, c4_x + c4_w/2, 35.5, color=AMBER_WARN, lw=2.0)

    # 6. Col 4 -> Col 5 (Outputs & Governance)
    draw_arrow(c4_x + c4_w, 73.0, c5_x, 75.0, color=EMERALD_GREEN, lw=2.8)
    draw_arrow(c4_x + c4_w, 49.0, c5_x, 56.0, color=EMERALD_GREEN, lw=2.8)
    draw_arrow(c4_x + c4_w, 26.0, c5_x, 28.0, color=EMERALD_GREEN, lw=3.0, label="Intervention Directive", label_pos=(0.4, 0.5), label_color='#A7F3D0', label_bg='#064E3B')

    # Bottom Legend Banner
    leg_box = FancyBboxPatch((2.5, 1.5), 95.0, 4.5, boxstyle="round,pad=0.3,rounding_size=0.8",
                             facecolor='#1E293B', edgecolor='#475569', linewidth=1.0, zorder=2)
    ax.add_patch(leg_box)
    ax.text(5.0, 3.75, "LEGEND & ARCHITECTURAL STANDARDS:", fontsize=8.5, fontweight='black', color='#F8FAFC', va='center', zorder=3)
    ax.text(28.0, 3.75, "■ Ingestion & Boundary Gating", fontsize=8.0, fontweight='bold', color=PRIMARY_BLUE, va='center', zorder=3)
    ax.text(46.0, 3.75, "■ Data Quality & Spatial Gate", fontsize=8.0, fontweight='bold', color=CYAN_ACCENT, va='center', zorder=3)
    ax.text(64.0, 3.75, "■ ML Forecasting & SHAP", fontsize=8.0, fontweight='bold', color='#A855F7', va='center', zorder=3)
    ax.text(79.0, 3.75, "■ Satellite EO & Change Index", fontsize=8.0, fontweight='bold', color='#38BDF8', va='center', zorder=3)
    ax.text(93.0, 3.75, "■ Enforceable Action Stack", fontsize=8.0, fontweight='bold', color=EMERALD_GREEN, va='center', zorder=3)

    plt.tight_layout(pad=0.5)
    
    # Save high-res images
    png_path = "d:/paimana/PAIMANA_COMPLETE_METHODOLOGY_FLOWCHART.png"
    jpg_path = "d:/paimana/PAIMANA_COMPLETE_METHODOLOGY_FLOWCHART.jpg"
    docs_png = "d:/paimana/docs/assets/PAIMANA_COMPLETE_METHODOLOGY_FLOWCHART.png"
    docs_jpg = "d:/paimana/docs/assets/PAIMANA_COMPLETE_METHODOLOGY_FLOWCHART.jpg"
    public_png = "d:/paimana/frontend/public/assets/PAIMANA_COMPLETE_METHODOLOGY_FLOWCHART.png"
    public_jpg = "d:/paimana/frontend/public/assets/PAIMANA_COMPLETE_METHODOLOGY_FLOWCHART.jpg"

    plt.savefig(png_path, format='png', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.savefig(jpg_path, format='jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.savefig(docs_png, format='png', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.savefig(docs_jpg, format='jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.savefig(public_png, format='png', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.savefig(public_jpg, format='jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    
    print(f"Successfully generated 4K Flowchart: {png_path} and {jpg_path}")

if __name__ == "__main__":
    create_flowchart()
