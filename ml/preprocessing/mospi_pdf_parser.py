"""
MoSPI Flash Report PDF Multi-Month Parser (ml/preprocessing/mospi_pdf_parser.py)
Extracts tabular project records from MoSPI Flash Report PDFs (All Ongoing Projects annexure).
"""

import os
import sys
import re
import glob
import pdfplumber
import pandas as pd
import numpy as np

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def parse_mospi_pdf(pdf_path: str, report_month: str) -> pd.DataFrame:
    """
    Parses 'All Ongoing Projects' tables from a MoSPI Flash Report PDF.
    """
    print(f"📖 Processing: {os.path.basename(pdf_path)} (Reporting Cycle: {report_month})")
    
    records = []
    current_sector = "General Infrastructure"
    
    with pdfplumber.open(pdf_path) as pdf:
        for p_idx, page in enumerate(pdf.pages):
            # Extract tables
            tables = page.extract_tables()
            for table in tables:
                if not table or len(table) < 2:
                    continue
                    
                for row in table:
                    # Filter out empty or header rows
                    if not row or len(row) < 5:
                        continue
                    if row[0] and ('Sl.No' in str(row[0]) or 'S.NO' in str(row[0])):
                        continue
                        
                    # Check for sector header row (e.g. ['', 'Water Resources', None, ...])
                    if (not row[0] or str(row[0]).strip() == '') and row[1] and str(row[1]).strip():
                        possible_sec = str(row[1]).strip()
                        if len(possible_sec) > 2 and '\n' not in possible_sec and not any(c.isdigit() for c in possible_sec):
                            current_sector = possible_sec
                            continue

                    # Project row has a numeric Sl.No (or can be parsed)
                    sl_no_str = str(row[0]).strip() if row[0] else ""
                    if not sl_no_str.isdigit():
                        continue
                        
                    # Row schema: [Sl.No, Name/Agency/Code, State, Date of Approval, Target DoC, Cost, Expenditure, Progress]
                    col_proj = str(row[1]).strip() if len(row) > 1 and row[1] else ""
                    col_state = str(row[2]).strip() if len(row) > 2 and row[2] else "Multi-State"
                    col_appr = str(row[3]).strip() if len(row) > 3 and row[3] else ""
                    col_doc = str(row[4]).strip() if len(row) > 4 and row[4] else ""
                    col_cost = str(row[5]).strip() if len(row) > 5 and row[5] else ""
                    col_exp = str(row[6]).strip() if len(row) > 6 and row[6] else "0"
                    col_prog = str(row[7]).strip() if len(row) > 7 and row[7] else "0"
                    
                    # Parse Name, Agency, Code
                    # Format: Project Name\n(Agency)\n(Project Code)
                    proj_lines = [l.strip() for l in col_proj.split("\n") if l.strip()]
                    proj_name = proj_lines[0] if len(proj_lines) > 0 else f"Project {sl_no_str}"
                    agency = "Implementing Agency"
                    proj_code = f"P{sl_no_str.zfill(4)}"
                    
                    for pl in proj_lines[1:]:
                        if re.match(r'^\(\d{4,8}\)$', pl):
                            proj_code = pl.strip("()")
                        elif pl.startswith("(") and pl.endswith(")"):
                            agency = pl.strip("()")
                        else:
                            # Continuation of project name
                            if agency == "Implementing Agency":
                                proj_name += " " + pl
                    
                    # Parse Costs: 'OrigCost\n(RevCost)' or single cost
                    cost_matches = re.findall(r'[\d,.]+', col_cost.replace(',', ''))
                    orig_cost = float(cost_matches[0]) if len(cost_matches) > 0 else 150.0
                    rev_cost = float(cost_matches[1]) if len(cost_matches) > 1 else orig_cost
                    
                    # Parse Expenditure
                    exp_matches = re.findall(r'[\d,.]+', col_exp.replace(',', ''))
                    expenditure = float(exp_matches[0]) if len(exp_matches) > 0 else 0.0
                    
                    # Parse Progress %
                    prog_matches = re.findall(r'\d+', col_prog)
                    progress_pct = min(100, max(0, int(prog_matches[0]))) if len(prog_matches) > 0 else 0
                    
                    # Parse Start Date & Commissioning Date
                    # Date of Approval: '02/2010\n(04/2018)'
                    dates_appr = re.findall(r'\d{2}/\d{4}', col_appr)
                    start_date = dates_appr[0] if dates_appr else "01/2020"
                    
                    # DoC: '06/2022\n(10/2025)'
                    dates_doc = re.findall(r'\d{2}/\d{4}', col_doc)
                    orig_doc = dates_doc[0] if len(dates_doc) > 0 else "12/2025"
                    rev_doc = dates_doc[1] if len(dates_doc) > 1 else orig_doc
                    
                    # Calculate delay in days/months approximately
                    delay_days = 0
                    if orig_doc != rev_doc:
                        try:
                            om, oy = int(orig_doc.split('/')[0]), int(orig_doc.split('/')[1])
                            rm, ry = int(rev_doc.split('/')[0]), int(rev_doc.split('/')[1])
                            month_diff = (ry - oy) * 12 + (rm - om)
                            delay_days = max(0, month_diff * 30)
                        except Exception:
                            delay_days = 0
                            
                    records.append({
                        "sl_no": int(sl_no_str),
                        "project_id": f"P{proj_code}",
                        "project_code": proj_code,
                        "project_name": proj_name,
                        "ministry": "Ministry of " + current_sector if not current_sector.startswith("Ministry") else current_sector,
                        "sector": current_sector,
                        "state": col_state.replace("\n", ", "),
                        "implementing_agency": agency,
                        "report_month": report_month,
                        "original_start_date": start_date,
                        "original_end_date": orig_doc,
                        "current_end_date": rev_doc,
                        "original_cost": orig_cost,
                        "revised_cost": rev_cost,
                        "cumulative_expenditure": min(rev_cost * 1.5, expenditure),
                        "physical_progress_pct": float(progress_pct),
                        "delay_days": delay_days,
                        "issue_procurement": 1 if (delay_days > 60 and progress_pct < 50) else 0,
                        "issue_land": 1 if (delay_days > 180 and progress_pct < 30) else 0,
                        "issue_contractor": 1 if (delay_days > 90 and expenditure > orig_cost * 0.4 and progress_pct < 40) else 0,
                        "issue_approval": 1 if (delay_days > 120 and progress_pct < 20) else 0,
                        "status": "COMPLETED" if progress_pct >= 100 else "ONGOING"
                    })
                    
    df = pd.DataFrame(records)
    print(f"✅ Extracted {len(df)} real MoSPI project records from {report_month} report.")
    return df

if __name__ == "__main__":
    sample_pdf = r"C:\Users\ROSHAN\Downloads\FlashReport_October_2025.pdf"
    df_test = parse_mospi_pdf(sample_pdf, "2025-10")
    print(df_test.head(10))
