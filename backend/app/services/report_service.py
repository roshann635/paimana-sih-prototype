"""
PDF Report Generation Service (backend/app/services/report_service.py)
Generates structured PDF reports for individual projects and portfolio-level summaries
using Python's built-in capabilities (no external PDF library required for basic text reports).

For production: replace with reportlab or weasyprint for richer formatting.
This implementation generates clean, structured text-based PDF files using FPDF-style
manual binary construction that works without any additional dependencies.
"""

import io
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from backend.app.database.schema import (
    Project, ProjectSnapshot, RiskPrediction, RiskExplanation,
    EarlyWarningAlert, Benchmark
)


class ReportService:
    """Generates PDF reports for PARAKH Decision Support System."""

    def generate_project_pdf(self, db: Session, project_id: str) -> Optional[bytes]:
        """Generates a comprehensive single-project PDF report."""
        proj = db.query(Project).filter(
            (Project.project_id == project_id) | (Project.project_code == project_id)
        ).first()
        if not proj:
            return None

        snap = db.query(ProjectSnapshot).filter(
            ProjectSnapshot.project_id == proj.project_id
        ).order_by(desc(ProjectSnapshot.report_month)).first()

        pred = db.query(RiskPrediction).filter(
            RiskPrediction.project_id == proj.project_id
        ).order_by(desc(RiskPrediction.report_month)).first()

        explanations = db.query(RiskExplanation).filter(
            RiskExplanation.project_id == proj.project_id
        ).order_by(RiskExplanation.rank).limit(5).all()

        alerts = db.query(EarlyWarningAlert).filter(
            EarlyWarningAlert.project_id == proj.project_id,
            EarlyWarningAlert.is_active == True
        ).all()

        benchmark = db.query(Benchmark).filter(
            Benchmark.sector == proj.sector
        ).first()

        # Build report content
        lines = []
        lines.append("=" * 72)
        lines.append("PARAKH AI INFRASTRUCTURE DECISION SUPPORT SYSTEM")
        lines.append("Project Risk Assessment Report")
        lines.append("=" * 72)
        lines.append("")
        lines.append(f"Generated:  {datetime.now().strftime('%d %B %Y, %H:%M IST')}")
        lines.append(f"Report ID:  RPT-{proj.project_id}-{datetime.now().strftime('%Y%m%d')}")
        lines.append("")

        # Section 1: Project Identity
        lines.append("-" * 72)
        lines.append("1. PROJECT IDENTITY")
        lines.append("-" * 72)
        lines.append(f"  Project ID:            {proj.project_id}")
        lines.append(f"  Project Code:          {proj.project_code}")
        lines.append(f"  Project Name:          {proj.project_name}")
        lines.append(f"  Ministry:              {proj.ministry}")
        lines.append(f"  Sector:                {proj.sector}")
        lines.append(f"  State:                 {proj.state}")
        lines.append(f"  Implementing Agency:   {proj.implementing_agency}")
        lines.append(f"  Original Cost:         Rs. {proj.original_cost:,.1f} Crore")
        lines.append(f"  Original Start Date:   {proj.original_start_date}")
        lines.append(f"  Original End Date:     {proj.original_end_date}")
        lines.append("")

        # Section 2: Latest Status
        if snap:
            lines.append("-" * 72)
            lines.append("2. LATEST STATUS (as of {})".format(snap.report_month))
            lines.append("-" * 72)
            lines.append(f"  Revised Cost:          Rs. {snap.revised_cost:,.1f} Crore")
            cost_growth = ((snap.revised_cost - proj.original_cost) / proj.original_cost) * 100
            lines.append(f"  Cost Escalation:       {cost_growth:+.1f}%")
            lines.append(f"  Expenditure:           Rs. {snap.cumulative_expenditure:,.1f} Crore")
            lines.append(f"  Physical Progress:     {snap.physical_progress_pct:.1f}%")
            lines.append(f"  Planned Progress:      {(snap.planned_progress_pct or 0):.1f}%")
            lines.append(f"  Schedule Delay:        {snap.delay_days} days ({snap.delay_days / 30.4:.1f} months)")
            lines.append(f"  Current End Date:      {snap.current_end_date}")
            lines.append("")

        # Section 3: EVM Indicators
        if snap:
            lines.append("-" * 72)
            lines.append("3. EARNED VALUE MANAGEMENT (EVM) INDICATORS")
            lines.append("-" * 72)
            lines.append(f"  Planned Value (PV):    Rs. {(snap.pv or 0):.1f} Crore")
            lines.append(f"  Earned Value (EV):     Rs. {(snap.ev or 0):.1f} Crore")
            lines.append(f"  Actual Cost (AC):      Rs. {(snap.ac or snap.cumulative_expenditure):.1f} Crore")
            lines.append(f"  Schedule Variance:     Rs. {(snap.sv or 0):.1f} Crore")
            lines.append(f"  Cost Variance:         Rs. {(snap.cv or 0):.1f} Crore")
            spi = snap.spi or 1.0
            cpi = snap.cpi or 1.0
            lines.append(f"  SPI:                   {spi:.2f} {'(Behind Schedule)' if spi < 1.0 else '(On/Ahead)'}")
            lines.append(f"  CPI:                   {cpi:.2f} {'(Cost Inefficient)' if cpi < 1.0 else '(Cost Efficient)'}")
            lines.append(f"  Critical Ratio:        {(snap.critical_ratio or spi * cpi):.2f}")
            lines.append("")

        # Section 4: Risk Assessment
        if pred:
            lines.append("-" * 72)
            lines.append("4. AI RISK ASSESSMENT")
            lines.append("-" * 72)
            lines.append(f"  Cost Overrun Risk:     {pred.cost_risk_probability * 100:.1f}%")
            lines.append(f"  Time Overrun Risk:     {pred.time_risk_probability * 100:.1f}%")
            lines.append(f"  Composite Risk Score:  {pred.composite_risk_score:.1f}/100")
            lines.append(f"  Risk Level:            {pred.risk_level}")
            lines.append(f"  IPI Score:             {pred.ipi_score:.1f}")
            lines.append(f"  IPI Rank:              #{pred.ipi_rank}")
            lines.append(f"  Trend Direction:       {pred.trend_direction.upper()}")
            lines.append(f"  Model Version:         {pred.model_version}")
            lines.append("")

        # Section 5: SHAP Explanation
        if explanations:
            lines.append("-" * 72)
            lines.append("5. ROOT CAUSE ANALYSIS (SHAP Feature Attribution)")
            lines.append("-" * 72)
            lines.append(f"  Diagnosis: {explanations[0].explanation_text}")
            lines.append("")
            lines.append(f"  {'Rank':<6}{'Feature':<45}{'Value':<12}{'SHAP':<10}{'Impact'}")
            lines.append(f"  {'-'*5:<6}{'-'*44:<45}{'-'*11:<12}{'-'*9:<10}{'-'*15}")
            for e in explanations:
                impact = "Increases Risk" if e.direction == "+" else "Mitigates Risk"
                lines.append(f"  {e.rank:<6}{e.feature_display_name[:44]:<45}{e.feature_value:<12.2f}{e.shap_value:<+10.4f}{impact}")
            lines.append("")

        # Section 6: Active Alerts
        if alerts:
            lines.append("-" * 72)
            lines.append("6. ACTIVE EARLY WARNING ALERTS")
            lines.append("-" * 72)
            for a in alerts:
                lines.append(f"  [{a.severity}] {a.title}")
                lines.append(f"           {a.description}")
                lines.append("")

        # Section 7: Sector Benchmark
        if benchmark:
            lines.append("-" * 72)
            lines.append(f"7. SECTOR BENCHMARK ({proj.sector})")
            lines.append("-" * 72)
            lines.append(f"  Peer Sample Size:       {benchmark.sample_size} projects")
            lines.append(f"  Median Cost Escalation: {benchmark.median_cost_escalation_pct:.1f}%")
            lines.append(f"  Median Delay:           {benchmark.median_delay_months:.1f} months")
            lines.append(f"  Median Risk Score:      {benchmark.median_risk_score:.1f}/100")
            lines.append("")

        # Footer
        lines.append("=" * 72)
        lines.append("DISCLAIMER: This report is generated by the PARAKH AI Decision")
        lines.append("Support System for advisory purposes. Risk predictions are model-")
        lines.append("based estimates and should be validated by domain experts before")
        lines.append("administrative action.")
        lines.append("=" * 72)

        content = "\n".join(lines)
        return self._text_to_pdf(content, f"PARAKH Report — {proj.project_id}")

    def generate_portfolio_pdf(self, db: Session) -> Optional[bytes]:
        """Generates a national portfolio summary PDF report."""
        # Gather data
        max_month = db.query(func.max(ProjectSnapshot.report_month)).scalar() or "2026-07"
        total_projects = db.query(func.count(Project.project_id)).scalar() or 0

        results = db.query(
            Project, ProjectSnapshot, RiskPrediction
        ).join(
            ProjectSnapshot, Project.project_id == ProjectSnapshot.project_id
        ).join(
            RiskPrediction,
            (RiskPrediction.project_id == ProjectSnapshot.project_id) &
            (RiskPrediction.report_month == ProjectSnapshot.report_month)
        ).filter(
            ProjectSnapshot.report_month == max_month
        ).all()

        if not results:
            return None

        # Calculate stats
        total = len(results)
        tot_cost = sum(s.revised_cost for _, s, _ in results)
        tot_exp = sum(s.cumulative_expenditure for _, s, _ in results)
        avg_prog = sum(s.physical_progress_pct for _, s, _ in results) / max(1, total)
        avg_delay = sum(s.delay_days for _, s, _ in results) / max(1, total)

        risk_counts = {"RED": 0, "ORANGE": 0, "AMBER": 0, "GREEN": 0}
        for _, _, r in results:
            risk_counts[r.risk_level] = risk_counts.get(r.risk_level, 0) + 1

        critical_projects = sorted(results, key=lambda x: x[2].composite_risk_score, reverse=True)[:15]

        active_alerts = db.query(func.count(EarlyWarningAlert.id)).filter(
            EarlyWarningAlert.is_active == True
        ).scalar() or 0

        lines = []
        lines.append("=" * 72)
        lines.append("PARAKH AI INFRASTRUCTURE DECISION SUPPORT SYSTEM")
        lines.append("National Portfolio Summary Report")
        lines.append("=" * 72)
        lines.append("")
        lines.append(f"Generated:       {datetime.now().strftime('%d %B %Y, %H:%M IST')}")
        lines.append(f"Reporting Month: {max_month}")
        lines.append("")

        # Portfolio Overview
        lines.append("-" * 72)
        lines.append("1. PORTFOLIO OVERVIEW")
        lines.append("-" * 72)
        lines.append(f"  Total Projects:         {total_projects}")
        lines.append(f"  Active in Latest Month: {total}")
        lines.append(f"  Total Revised Cost:     Rs. {tot_cost:,.0f} Crore")
        lines.append(f"  Total Expenditure:      Rs. {tot_exp:,.0f} Crore")
        lines.append(f"  Avg Physical Progress:  {avg_prog:.1f}%")
        lines.append(f"  Avg Schedule Delay:     {avg_delay:.0f} days ({avg_delay/30.4:.1f} months)")
        lines.append(f"  Active Alerts:          {active_alerts}")
        lines.append("")

        # Risk Distribution
        lines.append("-" * 72)
        lines.append("2. RISK DISTRIBUTION")
        lines.append("-" * 72)
        lines.append(f"  CRITICAL (RED):    {risk_counts['RED']:>5} projects")
        lines.append(f"  HIGH (ORANGE):     {risk_counts['ORANGE']:>5} projects")
        lines.append(f"  MODERATE (AMBER):  {risk_counts['AMBER']:>5} projects")
        lines.append(f"  LOW (GREEN):       {risk_counts['GREEN']:>5} projects")
        lines.append("")

        # Top Critical Projects
        lines.append("-" * 72)
        lines.append("3. TOP 15 CRITICAL PROJECTS (by Composite Risk Score)")
        lines.append("-" * 72)
        lines.append(f"  {'#':<4}{'Project ID':<12}{'Risk':<8}{'IPI':<8}{'SPI':<8}{'Delay':<10}{'Project Name'}")
        lines.append(f"  {'-'*3:<4}{'-'*11:<12}{'-'*7:<8}{'-'*7:<8}{'-'*7:<8}{'-'*9:<10}{'-'*30}")
        for i, (p, s, r) in enumerate(critical_projects, 1):
            spi_val = s.spi if s.spi else 1.0
            lines.append(
                f"  {i:<4}{p.project_id:<12}{r.composite_risk_score:<8.1f}"
                f"{r.ipi_score:<8.1f}{spi_val:<8.2f}{s.delay_days:<10}"
                f"{p.project_name[:40]}"
            )
        lines.append("")

        # Footer
        lines.append("=" * 72)
        lines.append("Generated by PARAKH AI Decision Support System")
        lines.append("Model Version: v2.0-temporal-hardened")
        lines.append("=" * 72)

        content = "\n".join(lines)
        return self._text_to_pdf(content, "PARAKH National Portfolio Report")

    def _text_to_pdf(self, text: str, title: str) -> bytes:
        """
        Converts structured text to a valid PDF binary using raw PDF construction.
        No external PDF library required.
        """
        # Use Courier font for tabular alignment
        font_name = "Courier"
        font_size = 9
        page_width = 612  # Letter width in points
        page_height = 792  # Letter height in points
        margin = 50
        line_height = 12
        max_chars_per_line = 85

        lines = text.split("\n")
        usable_height = page_height - 2 * margin
        lines_per_page = int(usable_height / line_height) - 2

        # Build pages
        pages = []
        current_page_lines = []
        for line in lines:
            # Word-wrap long lines
            while len(line) > max_chars_per_line:
                current_page_lines.append(line[:max_chars_per_line])
                line = "  " + line[max_chars_per_line:]
                if len(current_page_lines) >= lines_per_page:
                    pages.append(current_page_lines)
                    current_page_lines = []
            current_page_lines.append(line)
            if len(current_page_lines) >= lines_per_page:
                pages.append(current_page_lines)
                current_page_lines = []
        if current_page_lines:
            pages.append(current_page_lines)

        # Raw PDF construction
        buf = io.BytesIO()
        offsets = []

        def write(s):
            if isinstance(s, str):
                s = s.encode("latin-1", errors="replace")
            offsets.append(buf.tell())
            buf.write(s)

        # Header
        buf.write(b"%PDF-1.4\n")

        # Object 1: Catalog
        offsets.append(buf.tell())
        buf.write(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")

        # Object 2: Pages (written after page objects)
        pages_obj_offset = buf.tell()
        offsets.append(pages_obj_offset)
        page_refs = " ".join(f"{3 + i*2} 0 R" for i in range(len(pages)))
        buf.write(f"2 0 obj\n<< /Type /Pages /Kids [{page_refs}] /Count {len(pages)} >>\nendobj\n".encode())

        # Font object
        font_obj_num = 3 + len(pages) * 2
        offsets_map = {}

        for pi, page_lines in enumerate(pages):
            page_obj_num = 3 + pi * 2
            content_obj_num = 4 + pi * 2

            # Build text stream
            text_stream = f"BT\n/F1 {font_size} Tf\n"
            y = page_height - margin
            for pline in page_lines:
                safe = pline.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
                text_stream += f"1 0 0 1 {margin} {y} Tm\n({safe}) Tj\n"
                y -= line_height
            text_stream += "ET\n"

            stream_bytes = text_stream.encode("latin-1", errors="replace")

            # Content stream object
            offsets_map[content_obj_num] = buf.tell()
            buf.write(f"{content_obj_num} 0 obj\n<< /Length {len(stream_bytes)} >>\nstream\n".encode())
            buf.write(stream_bytes)
            buf.write(b"\nendstream\nendobj\n")

            # Page object
            offsets_map[page_obj_num] = buf.tell()
            buf.write(
                f"{page_obj_num} 0 obj\n"
                f"<< /Type /Page /Parent 2 0 R "
                f"/MediaBox [0 0 {page_width} {page_height}] "
                f"/Contents {content_obj_num} 0 R "
                f"/Resources << /Font << /F1 {font_obj_num} 0 R >> >> "
                f">>\nendobj\n".encode()
            )

        # Font object
        offsets_map[font_obj_num] = buf.tell()
        buf.write(
            f"{font_obj_num} 0 obj\n"
            f"<< /Type /Font /Subtype /Type1 /BaseFont /{font_name} >>\n"
            f"endobj\n".encode()
        )

        # Build xref table
        total_objects = font_obj_num
        xref_offset = buf.tell()
        buf.write(f"xref\n0 {total_objects + 1}\n".encode())
        buf.write(b"0000000000 65535 f \n")

        # Collect all object offsets in order
        all_offsets = {}
        all_offsets[1] = offsets[0]
        all_offsets[2] = offsets[1]
        all_offsets.update(offsets_map)

        for obj_num in range(1, total_objects + 1):
            off = all_offsets.get(obj_num, 0)
            buf.write(f"{off:010d} 00000 n \n".encode())

        # Trailer
        buf.write(
            f"trailer\n<< /Size {total_objects + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n".encode()
        )

        return buf.getvalue()


# Singleton instance
report_service = ReportService()
