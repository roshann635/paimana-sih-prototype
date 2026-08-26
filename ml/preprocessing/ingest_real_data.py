"""
MoSPI / OCMS Real Data Ingestion Pipeline (ml/preprocessing/ingest_real_data.py)
Extracts tabular project records from MoSPI Flash Report PDFs, Excel spreadsheets, or CSVs.
"""

import os
import sys
import re
import pandas as pd
import numpy as np

# Base directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

def parse_pdf_flash_report(pdf_path: str) -> pd.DataFrame:
    """
    Extracts tabular project rows from MoSPI Flash Report PDF using pdfplumber / pypdf.
    """
    import pdfplumber
    print(f"📖 Parsing MoSPI Flash Report PDF: {pdf_path}")
    
    extracted_rows = []
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"📄 Total PDF Pages: {total_pages}")
        
        for p_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for table in tables:
                if not table or len(table) < 2:
                    continue
                for row in table:
                    clean_row = [str(c).strip() if c is not None else "" for c in row]
                    if any(clean_row):
                        extracted_rows.append(clean_row)
                        
    print(f"✅ Extracted {len(extracted_rows)} raw table rows from PDF.")
    return pd.DataFrame(extracted_rows)

def ingest_from_file(file_path: str):
    """
    Ingests and normalizes any MoSPI data file (PDF, XLSX, XLS, CSV).
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    ext = os.path.splitext(file_path)[1].lower()
    print(f"🚀 Ingesting file ({ext}): {file_path}")
    
    if ext == ".pdf":
        df_raw = parse_pdf_flash_report(file_path)
    elif ext in [".xlsx", ".xls"]:
        df_raw = pd.read_excel(file_path)
    elif ext == ".csv":
        df_raw = pd.read_csv(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")
        
    print(f"📊 Raw Data Shape: {df_raw.shape}")
    return df_raw

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_file = sys.argv[1]
        df = ingest_from_file(target_file)
        print("Preview:")
        print(df.head())
    else:
        print("Usage: python ml/preprocessing/ingest_real_data.py <path-to-pdf-or-excel-or-csv>")

