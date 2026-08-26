import sqlite3
import os

db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/paimana.db"))
conn = sqlite3.connect(db_path)
c = conn.cursor()

STATE_MAPPINGS = {
    'maharashtra': 'Maharashtra',
    'uttar pradesh': 'Uttar Pradesh',
    'gujarat': 'Gujarat',
    'andhra pradesh': 'Andhra Pradesh',
    'bihar': 'Bihar',
    'odisha': 'Odisha',
    'orissa': 'Odisha',
    'jharkhand': 'Jharkhand',
    'assam': 'Assam',
    'chhattisgarh': 'Chhattisgarh',
    'west bengal': 'West Bengal',
    'madhya pradesh': 'Madhya Pradesh',
    'karnataka': 'Karnataka',
    'telangana': 'Telangana',
    'rajasthan': 'Rajasthan',
    'tamil nadu': 'Tamil Nadu',
    'tamilnadu': 'Tamil Nadu',
    'kerala': 'Kerala',
    'punjab': 'Punjab',
    'haryana': 'Haryana',
    'delhi': 'Delhi',
    'jammu & kashmir': 'Jammu & Kashmir',
    'jammu and kashmir': 'Jammu & Kashmir',
    'j&k': 'Jammu & Kashmir',
    'uttarakhand': 'Uttarakhand',
    'himachal pradesh': 'Himachal Pradesh',
    'himachal': 'Himachal Pradesh',
    'tripura': 'Tripura',
    'meghalaya': 'Meghalaya',
    'manipur': 'Manipur',
    'nagaland': 'Nagaland',
    'goa': 'Goa',
    'arunachal pradesh': 'Arunachal Pradesh',
    'arunachal': 'Arunachal Pradesh',
    'mizoram': 'Mizoram',
    'sikkim': 'Sikkim',
    'puducherry': 'Puducherry',
    'chandigarh': 'Chandigarh',
    'ladakh': 'Ladakh',
    'andaman': 'Andaman & Nicobar',
    'dadra': 'Dadra & Nagar Haveli',
    'multi-state': 'Multi-State',
    'multi state': 'Multi-State',
    'multistate': 'Multi-State'
}

c.execute("SELECT project_id, state, project_name, sector FROM projects")
rows = c.fetchall()
updated = 0

for pid, st, pname, sec in rows:
    st_clean = (st or "").strip().lower()
    matched_state = None
    
    # Try exact or substring match in state field
    for k, v in STATE_MAPPINGS.items():
        if k in st_clean:
            matched_state = v
            break
            
    # If not matched, try searching project name
    if not matched_state:
        pname_lower = pname.lower()
        for k, v in STATE_MAPPINGS.items():
            if k in pname_lower:
                matched_state = v
                break
                
    if not matched_state:
        if 'multi' in st_clean or 'multi' in pname.lower():
            matched_state = 'Multi-State'
        else:
            matched_state = 'Multi-State'
            
    if matched_state and matched_state != st:
        c.execute("UPDATE projects SET state = ? WHERE project_id = ?", (matched_state, pid))
        updated += 1

conn.commit()
print(f"Successfully normalized {updated} project states in paimana.db.")

c.execute("""
    SELECT 
        p.state, 
        count(distinct p.project_id) as cnt, 
        sum(s.revised_cost) as tot_cost, 
        avg(s.physical_progress_pct) as avg_prog,
        sum(case when r.risk_level = 'RED' then 1 else 0 end) as red_cnt,
        sum(case when r.risk_level in ('RED', 'ORANGE') then 1 else 0 end) as high_risk_cnt,
        avg(r.composite_risk_score) as avg_risk
    FROM projects p 
    JOIN project_snapshots s ON p.project_id = s.project_id 
    JOIN risk_predictions r ON p.project_id = r.project_id AND s.report_month = r.report_month 
    WHERE s.report_month = (SELECT max(report_month) FROM project_snapshots) 
    GROUP BY p.state 
    ORDER BY cnt DESC
""")

print("Clean State Statistics from Actual MoSPI Dataset:")
for row in c.fetchall():
    print(f"State: {row[0]:22} | Projects: {row[1]:3} | Capex: INR {row[2]:10.1f} Cr | Avg Progress: {row[3]:5.1f}% | Critical: {row[4]:2} | High Risk: {row[5]:2} | Avg Risk: {row[6]:5.1f}")

conn.close()
