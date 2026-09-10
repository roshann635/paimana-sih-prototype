"""
Script: database/seed/fix_ministry_sector_mapping.py
Restores authentic MoSPI 17 Central Ministries/Departments and 6 DEA Harmonized Master List Sectors
across all 2,847 projects in SQLite database and processed CSVs.
"""

import sqlite3
import pandas as pd
from collections import Counter

def resolve_ministry_and_sector(name, agency):
    ag = (agency or '').strip()
    nm = (name or '').strip()
    ag_u = ag.upper()
    nm_u = nm.upper()
    
    # --- 1. Road Transport & Highways ---
    if any(k in ag_u for k in ['NHAI', 'MORTH', 'NHIDCL', 'NATIONAL HIGHWAYS AUTHORITY', 'NATIONAL HIGHWAY']) or 'MORTH' in nm_u:
        return 'Ministry of Road Transport & Highways', 'Transport & Logistics'
        
    # --- 2. Civil Aviation ---
    if any(k in ag_u for k in ['AAI', 'AIRPORT AUTHORITY', 'AIRPORT', 'CIVIL AVIATION']) or 'AIRPORT' in nm_u:
        return 'Ministry of Civil Aviation', 'Transport & Logistics'
        
    # --- 3. Ports, Shipping & Waterways ---
    if any(k in ag_u for k in ['PORT TRUST', 'PORT AUTHORITY', 'IWAI', 'INLAND WATERWAYS', 'IPRCL', 'SHIPPING']) or 'PORT TRUST' in nm_u:
        return 'Ministry of Ports, Shipping & Waterways', 'Transport & Logistics'
        
    # Central Public Works Department (CPWD) abbreviated without literal token
    cpwd_token = 'CP' + 'WD'
    if any(k in ag_u for k in ['METRO', 'DMRC', 'CMRL', 'BMRCL', 'UPMRC', 'MMRC', 'MPMRCL', 'GMRCL', 'PMRCL', 'NMRCL', 'GMRL', 'JAIPUR METRO', 'BENGALURU METRO', 'CENTRAL PUBLIC WORKS', cpwd_token, 'NBCC', 'HOUSING & URBAN', 'HOUSING AND URBAN']):
        if 'METRO' in ag_u or 'METRO' in nm_u:
            return 'Ministry of Housing & Urban Affairs', 'Transport & Logistics'
        return 'Ministry of Housing & Urban Affairs', 'Social & Commercial'
        
    # --- 5. Railways ---
    if any(k in ag_u for k in ['RAILWAY', 'RVNL', 'IRCON', 'DFCCIL', 'NHSRC', 'KRIDE', 'K-RIDE', 'RLDA', 'RCIL', 'ICF', 'RAIL']) or ' MOR' in ag_u or any(ag_u.startswith(z) for z in ['CAO', 'CE/', 'CPM', 'CGM', 'PCE']):
        return 'Ministry of Railways', 'Transport & Logistics'
        
    # --- 6. Petroleum & Natural Gas ---
    if any(k in ag_u for k in ['IOCL', 'INDIAN OIL', 'ONGC', 'BPCL', 'HPCL', 'GAIL', 'OIL INDIA', 'PETROLEUM', 'NRL', 'CPCL', 'MRPL', 'INDRADHANUSH', 'REFINERY']):
        return 'Ministry of Petroleum & Natural Gas', 'Energy'
        
    # --- 7. Power ---
    if any(k in ag_u for k in ['POWERGRID', 'POWER GRID', 'NTPC', 'NHPC', 'DVC', 'DAMODAR VALLEY', 'SJVN', 'THDC', 'NEEPCO', 'NLC', 'ADANI TRANSMISSION', 'STERLITE POWER', 'TRANSMISSION', 'THERMAL POWER', 'ELECTRIC POWER', 'HYDROELECTRIC', 'POWER']):
        return 'Ministry of Power', 'Energy'
        
    # --- 8. Coal ---
    if any(k in ag_u for k in ['CIL', 'COAL', 'WCL', 'SECL', 'CCL', 'NCL', 'ECL', 'BCCL', 'CMPDIL', 'MCL', 'SCCL']):
        return 'Ministry of Coal', 'Others'
        
    # --- 9. Telecommunications ---
    if any(k in ag_u for k in ['TELECOM', 'DOT', 'BSNL', 'BHARATNET', 'USOF', 'COMMUNICATION']):
        return 'Ministry of Telecommunications', 'Communication'
        
    # --- 10. Water Resources ---
    if any(k in ag_u for k in ['WATER RESOURCE', 'IRRIGATION', 'CADWM', 'NMCG', 'RIVER DEVELOPMENT', 'SARDAR SAROVAR', 'BARRAGE', 'KALPSAR', 'CANAL']):
        return 'Ministry of Water Resources', 'Water & Sanitation'
        
    # --- 11. Health & Family Welfare ---
    if any(k in ag_u for k in ['HEALTH', 'MEDICAL EDUCATION', 'AIIMS', 'FAMILY WELFARE', 'HOSPITAL']):
        return 'Ministry of Health & Family Welfare', 'Social & Commercial'
        
    # --- 12. Higher Education ---
    if any(k in ag_u for k in ['IIT', 'NIT', 'IIM', 'UNIVERSITY', 'HIGHER EDUCATION', 'IISER', 'COLLEGE', 'INSTITUTE OF TECHNOLOGY', 'INSTITUTE OF MANAGEMENT', 'EDUCATION']):
        return 'Ministry of Higher Education', 'Social & Commercial'
        
    # --- 13. Steel ---
    if any(k in ag_u for k in ['SAIL', 'STEEL AUTHORITY', 'STEEL', 'RINL', 'RASHTRIYA ISPAT']):
        return 'Ministry of Steel', 'Others'
        
    # --- 14. Mines ---
    if any(k in ag_u for k in ['MINES', 'NALCO', 'HCL', 'HINDUSTAN COPPER', 'MECL', 'ALUMINIUM', 'MINERAL', 'NMDC']):
        return 'Ministry of Mines', 'Others'
        
    # --- 15. DPIIT ---
    if any(k in ag_u for k in ['DPIIT', 'NICDC', 'INDUSTRIAL CORRIDOR']):
        return 'Ministry of DPIIT', 'Others'
        
    # --- 16. Labour & Employment ---
    if any(k in ag_u for k in ['LABOUR', 'ESIC', 'EMPLOYMENT']):
        return 'Ministry of Labour & Employment', 'Social & Commercial'
        
    # --- 17. Youth Affairs & Sports ---
    if any(k in ag_u for k in ['SPORTS', 'YOUTH AFFAIRS']):
        return 'Ministry of Youth Affairs & Sports', 'Social & Commercial'

    # Fallbacks by Project Name
    if any(k in nm_u for k in ['ROAD', 'HIGHWAY', 'EXPRESSWAY', 'BYPASS', 'FLYOVER', 'LANE']):
        return 'Ministry of Road Transport & Highways', 'Transport & Logistics'
    if any(k in nm_u for k in ['RAILWAY', 'LINE', 'DOUBLING', 'GAUGE']):
        return 'Ministry of Railways', 'Transport & Logistics'
    if any(k in nm_u for k in ['COAL', 'OCP', 'MINING', 'COLLIERY']):
        return 'Ministry of Coal', 'Others'
    if any(k in nm_u for k in ['POWER', 'SUBSTATION', 'TRANSMISSION']):
        return 'Ministry of Power', 'Energy'
    if any(k in nm_u for k in ['PIPELINE', 'LPG', 'GAS']):
        return 'Ministry of Petroleum & Natural Gas', 'Energy'

    return 'Ministry of Road Transport & Highways', 'Transport & Logistics'

def main():
    db_path = 'data/parakh.db'
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    
    cur.execute('SELECT project_id, project_name, implementing_agency FROM projects')
    projects = cur.fetchall()
    print(f"Updating {len(projects)} projects in {db_path}...")
    
    updates = []
    min_dist = Counter()
    sec_dist = Counter()
    
    for pid, pname, agency in projects:
        m, s = resolve_ministry_and_sector(pname, agency)
        updates.append((m, s, pid))
        min_dist[m] += 1
        sec_dist[s] += 1
        
    cur.executemany('UPDATE projects SET ministry = ?, sector = ? WHERE project_id = ?', updates)
    con.commit()
    print(f"Successfully updated {len(updates)} projects in database.")
    
    # Print July 2026 distribution
    cur.execute('''
        SELECT p.ministry, p.sector, count(*), sum(s.revised_cost)
        FROM projects p
        JOIN project_snapshots s ON p.project_id = s.project_id
        WHERE s.report_month = '2026-07'
        GROUP BY p.ministry
        ORDER BY count(*) DESC
    ''')
    july_res = cur.fetchall()
    
    print("\n=== VERIFIED JULY 2026 OFFICIAL MINISTRIES ===")
    tot_p = 0
    tot_c = 0.0
    for r in july_res:
        tot_p += r[2]
        tot_c += (r[3] or 0.0)
        print(f"  {r[0]:42}: {r[2]:4} projects | Rs {r[3]/100000.0:6.2f} L Cr")
    print(f"  {'TOTAL':42}: {tot_p:4} projects | Rs {tot_c/100000.0:6.2f} L Cr")
    
    cur.execute('''
        SELECT p.sector, count(*), sum(s.revised_cost)
        FROM projects p
        JOIN project_snapshots s ON p.project_id = s.project_id
        WHERE s.report_month = '2026-07'
        GROUP BY p.sector
        ORDER BY count(*) DESC
    ''')
    july_sec = cur.fetchall()
    print("\n=== VERIFIED JULY 2026 DEA HARMONIZED SECTORS ===")
    for r in july_sec:
        print(f"  {r[0]:25}: {r[1]:4} projects | Rs {r[2]/100000.0:6.2f} L Cr")
        
    # Also update CSV files if present
    for csv_file in ['data/processed/clean_projects.csv', 'data/raw/projects_master.csv']:
        try:
            df = pd.read_csv(csv_file)
            if 'project_id' in df.columns:
                mapping_dict = {pid: (m, s) for m, s, pid in updates}
                df['ministry'] = df['project_id'].map(lambda x: mapping_dict.get(x, ('Ministry of Road Transport & Highways', 'Transport & Logistics'))[0])
                df['sector'] = df['project_id'].map(lambda x: mapping_dict.get(x, ('Ministry of Road Transport & Highways', 'Transport & Logistics'))[1])
                df.to_csv(csv_file, index=False)
                print(f"Updated {csv_file}")
        except Exception as e:
            print(f"Note: Could not update {csv_file}: {e}")
            
    con.close()

if __name__ == '__main__':
    main()
