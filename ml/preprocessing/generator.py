"""
PARAKH Dataset Generator (ml/preprocessing/generator.py)
Generates high-fidelity national infrastructure projects with realistic monthly trajectories
(healthy, deteriorating, severely delayed, cost escalating, recovered) adhering to MoSPI / OCMS data schemas.
"""

import os
import random
import math
import datetime
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any

# Reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

MINISTRIES_SECTORS = {
    "Ministry of Road Transport and Highways": [
        ("National Highways", ["NHAI", "NHIDCL", "MoRTH"]),
        ("Expressways", ["NHAI"]),
        ("Bridges & Tunnels", ["NHAI", "NHIDCL"])
    ],
    "Ministry of Railways": [
        ("Railways", ["Railway Board", "RVNL", "IRCON", "DFCCIL", "CORE", "MRVC"]),
        ("Dedicated Freight Corridors", ["DFCCIL"]),
        ("High Speed Rail", ["NHSRCL"])
    ],
    "Ministry of Power": [
        ("Power Transmission", ["POWERGRID"]),
        ("Thermal Power", ["NTPC"]),
        ("Hydro Power", ["NHPC", "SJVN", "NEEPCO"]),
        ("Renewable Power", ["SECI", "NTPC-REL"])
    ],
    "Ministry of Petroleum and Natural Gas": [
        ("Petroleum Refining", ["IOCL", "BPCL", "HPCL"]),
        ("Oil & Gas Pipelines", ["GAIL", "IOCL", "ONGC"]),
        ("Exploration & Production", ["ONGC", "OIL"])
    ],
    "Ministry of Housing and Urban Affairs": [
        ("Metro Rail", ["DMRC", "MMRDA", "BMRCL", "CMRL", "UPMRC", "KMRL"]),
        ("Urban Infrastructure", ["NBCC", "Smart Cities Mission"])
    ],
    "Ministry of Ports, Shipping and Waterways": [
        ("Ports & Waterways", ["JNPA", "DPA", "Syama Prasad Mookerjee Port", "IWAI"]),
        ("Inland Waterways", ["IWAI"])
    ],
    "Ministry of Civil Aviation": [
        ("Airports", ["AAI", "MOPA", "Noida Intl Airport Auth"])
    ],
    "Ministry of Coal": [
        ("Coal Mining", ["CIL", "ECL", "BCCL", "CCL", "WCL", "SECL", "MCL", "NLCIL"])
    ],
    "Ministry of Jal Shakti": [
        ("Water Supply & Irrigation", ["WAPCOS", "NWDA", "CWC"])
    ],
    "Ministry of Steel": [
        ("Steel", ["SAIL", "RINL", "NMDC"])
    ],
    "Department of Atomic Energy": [
        ("Atomic Energy", ["NPCIL", "BHAVINI", "UCIL"])
    ],
    "Ministry of Communications": [
        ("Telecommunications", ["BSNL", "BBNL", "TCIL"])
    ],
    "Ministry of Mines": [
        ("Mining & Minerals", ["NALCO", "HCL", "MECL"])
    ],
    "Ministry of Defence": [
        ("Defence Infrastructure & Roads", ["BRO", "DRDO", "DGQA"])
    ],
    "Ministry of Chemicals and Petrochemicals": [
        ("Fertilizers & Chemicals", ["NFL", "RCF", "HURL", "BVFCL"])
    ],
    "Ministry of New and Renewable Energy": [
        ("Solar Parks & Green Hydrogen", ["SECI", "IREDA"])
    ],
    "Ministry of Heavy Industries": [
        ("Heavy Engineering", ["BHEL", "HMT"])
    ]
}

STATES = [
    "Maharashtra", "Uttar Pradesh", "Gujarat", "Tamil Nadu", "Karnataka",
    "Andhra Pradesh", "Rajasthan", "West Bengal", "Madhya Pradesh", "Bihar",
    "Odisha", "Telangana", "Kerala", "Assam", "Jharkhand", "Punjab",
    "Haryana", "Uttarakhand", "Himachal Pradesh", "Jammu and Kashmir",
    "Chhattisgarh", "Goa", "North East Multi-State", "Multi-State National"
]

TRAJECTORY_ARCHETYPES = ["healthy", "deteriorating", "severely_delayed", "cost_escalating", "recovered"]
ARCHETYPE_WEIGHTS = [0.44, 0.22, 0.14, 0.10, 0.10]

PROJECT_NAME_TEMPLATES = {
    "National Highways": [
        "Four Laning of {state} Economic Corridor Section {n}",
        "Widening & Upgradation of NH-{num} from Km {km1} to Km {km2}",
        "Construction of 6-Lane Access Controlled Ring Road around {city}",
        "Expansion of National Highway Corridor Phase-{phase} in {state}",
        "Greenfield Expressway Link connecting {city} to Industrial Hub"
    ],
    "Expressways": [
        "{state} Greenfield Express Corridor Package-{n}",
        "Economic Expressway Link Stage-{phase} ({city} Section)"
    ],
    "Railways": [
        "Doubling of {city} - {city2} Railway Line ({km} km)",
        "3rd Line Rail Corridor between {city} and {city2} Division",
        "Electrification & Signaling Modernization of {state} Mainline",
        "New Broad Gauge Railway Line connecting {city} to Mineral Belt"
    ],
    "Dedicated Freight Corridors": [
        "Dedicated Freight Corridor Feeder Link Section-{n} ({state})",
        "Heavy Haul Rail Freight Bypass around {city}"
    ],
    "Metro Rail": [
        "{city} Metro Rail Project Phase-{phase} Corridor {n}",
        "Extension of Metro Elevated Line to {city} Airport Terminal",
        "Underground Metro Transit System Package-{n} ({city})"
    ],
    "Power Transmission": [
        "765kV D/C Inter-Regional Transmission Line across {state}",
        "Substation Augmentation & Green Energy Corridor Package-{n} in {state}",
        "High Voltage Direct Current (HVDC) Bipole Link ({city} to {city2})"
    ],
    "Thermal Power": [
        "{city} Super Thermal Power Station Expansion Stage-{phase} (2x800 MW)",
        "Ultra Supercritical Thermal Power Project Unit {n} ({state})"
    ],
    "Hydro Power": [
        "{city} Hydroelectric Power Station Stage-{phase} ({n}00 MW) on River Basin",
        "Pumped Storage Hydro Project ({state}) Stage-{phase}"
    ],
    "Renewable Power": [
        "{n}00 MW Ultra Mega Solar Power Park at {city} ({state})",
        "Hybrid Wind-Solar Generation Facility Package-{n} ({state})"
    ],
    "Petroleum Refining": [
        "Modernization & Capacity Expansion of {city} Refinery to 15 MMTPA",
        "Petrochemical Complex & Polypropylene Unit at {city} Refinery"
    ],
    "Oil & Gas Pipelines": [
        "Natural Gas Grid Pipeline Network {city} - {city2} ({km} Km)",
        "Crude Oil Pipeline Augmentation & Terminal Facility in {state}"
    ],
    "Ports & Waterways": [
        "Development of Deep Draft Container Berth at {city} Port",
        "Capital Dredging & Multipurpose Cargo Terminal Phase-{phase} at {city}"
    ],
    "Airports": [
        "Development of New Greenfield International Airport at {city}",
        "Runway Extension & Terminal 2 Construction at {city} Airport"
    ],
    "Coal Mining": [
        "Open Cast Coal Mining Project ({n} MTPA Capacity) in {state}",
        "Coal Washery & Railway Siding Logistics Hub at {city}"
    ],
    "Water Supply & Irrigation": [
        "Multi-Village Piped Drinking Water Supply Scheme in {state} District {n}",
        "Major Lift Irrigation Project Canal Network Stage-{phase} in {state}"
    ],
    "Atomic Energy": [
        "Nuclear Power Station Units {n} & {n2} (2x700 MWe PHWR) at {city}"
    ],
    "Telecommunications": [
        "BharatNet Rural Optical Fibre Network Phase-{phase} in {state}",
        "NextGen 4G/5G Saturation Project in Border & Remote Districts of {state}"
    ],
    "Steel": [
        "Modernization & Capacity Expansion to 4.5 MTPA at {city} Steel Plant"
    ]
}

INDIAN_CITIES = [
    "Nagpur", "Varanasi", "Ahmedabad", "Bhopal", "Visakhapatnam",
    "Indore", "Coimbatore", "Surat", "Jaipur", "Lucknow", "Kochi",
    "Patna", "Ranchi", "Guwahati", "Bhubaneswar", "Gwalior", "Jodhpur",
    "Raipur", "Madurai", "Vadodara", "Agra", "Kanpur", "Prayagraj",
    "Mangaluru", "Hubballi", "Vijayawada", "Kozhikode", "Siliguri"
]

def generate_project_name(sector: str, state: str, idx: int) -> str:
    templates = PROJECT_NAME_TEMPLATES.get(sector, [
        "Infrastructure Development Package-{n} in {state}",
        "Capacity Enhancement Project Phase-{phase} at {city}"
    ])
    tmpl = random.choice(templates)
    city1 = random.choice(INDIAN_CITIES)
    city2 = random.choice([c for c in INDIAN_CITIES if c != city1])
    n = (idx % 8) + 1
    n2 = n + 1
    num = random.choice([7, 16, 27, 44, 48, 52, 65, 66])
    km = random.randint(35, 240)
    km1 = random.randint(10, 150)
    km2 = km1 + km
    phase = ["I", "II", "III", "IV", "V"][idx % 5]
    
    return tmpl.format(
        state=state, city=city1, city2=city2, n=n, n2=n2,
        num=num, km=km, km1=km1, km2=km2, phase=phase
    )

def s_curve_progress(t: float, steepness: float = 6.0, midpoint: float = 0.5) -> float:
    """Logistic S-curve function mapping normalized time [0, 1] to progress [0, 100]."""
    x = (t - midpoint) * steepness
    val = 1.0 / (1.0 + math.exp(-x))
    val_0 = 1.0 / (1.0 + math.exp(midpoint * steepness))
    val_1 = 1.0 / (1.0 + math.exp(-(1.0 - midpoint) * steepness))
    norm = (val - val_0) / (val_1 - val_0)
    return max(0.0, min(100.0, norm * 100.0))

def generate_synthetic_dataset(
    n_projects: int = 2000,
    start_month_str: str = "2024-01",
    end_month_str: str = "2026-04",
    output_dir: str = "data/raw"
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Generates a master projects dataframe and monthly snapshots dataframe.
    """
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs("data/processed", exist_ok=True)
    
    start_date = datetime.datetime.strptime(start_month_str, "%Y-%m")
    end_date = datetime.datetime.strptime(end_month_str, "%Y-%m")
    
    months = []
    curr = start_date
    while curr <= end_date:
        months.append(curr.strftime("%Y-%m"))
        year = curr.year + (curr.month // 12)
        month = (curr.month % 12) + 1
        curr = datetime.datetime(year, month, 1)
        
    num_snapshot_months = len(months)
    
    projects_list = []
    snapshots_list = []
    
    ministry_keys = list(MINISTRIES_SECTORS.keys())
    
    for i in range(1, n_projects + 1):
        project_id = f"P{i:04d}"
        project_code = f"PRJ-{2020 + (i % 6)}-{1000 + i}"
        
        ministry = random.choice(ministry_keys)
        sector_tuples = MINISTRIES_SECTORS[ministry]
        sector_tuple = random.choice(sector_tuples)
        sector = sector_tuple[0]
        agency = random.choice(sector_tuple[1])
        state = random.choice(STATES)
        
        project_name = generate_project_name(sector, state, i)
        
        log_mean = 6.8
        log_std = 1.05
        cost_val = math.exp(np.random.normal(log_mean, log_std))
        original_cost = round(max(50.0, min(65000.0, cost_val)), 2)
        
        orig_duration_months = random.randint(24, 60)
        start_year = random.randint(2021, 2023)
        start_m = random.randint(1, 12)
        orig_start_dt = datetime.date(start_year, start_m, 1)
        
        end_year = start_year + ((start_m + orig_duration_months) // 12)
        end_m = ((start_m + orig_duration_months) % 12) + 1
        orig_end_dt = datetime.date(end_year, end_m, 1)
        
        archetype = np.random.choice(TRAJECTORY_ARCHETYPES, p=ARCHETYPE_WEIGHTS)
        snapshot_count = random.randint(14, num_snapshot_months)
        selected_months = months[-snapshot_count:]
        
        curr_revised_cost = original_cost
        curr_delay_days = 0
        
        months_since_start = max(1, (datetime.datetime.strptime(selected_months[0], "%Y-%m").date().year - orig_start_dt.year) * 12 + (datetime.datetime.strptime(selected_months[0], "%Y-%m").date().month - orig_start_dt.month))
        base_t = min(0.9, months_since_start / max(1, orig_duration_months))
        curr_progress = round(s_curve_progress(base_t) * random.uniform(0.7, 1.05), 1)
        curr_expenditure = round(original_cost * (curr_progress / 100.0) * random.uniform(0.85, 1.15), 2)
        
        project_record = {
            "project_id": project_id,
            "project_code": project_code,
            "project_name": project_name,
            "ministry": ministry,
            "sector": sector,
            "state": state,
            "implementing_agency": agency,
            "original_cost": original_cost,
            "original_start_date": orig_start_dt.strftime("%Y-%m-%d"),
            "original_end_date": orig_end_dt.strftime("%Y-%m-%d"),
            "archetype": archetype
        }
        projects_list.append(project_record)
        
        for m_idx, m_str in enumerate(selected_months):
            snap_dt = datetime.datetime.strptime(m_str, "%Y-%m").date()
            total_elapsed_m = (snap_dt.year - orig_start_dt.year) * 12 + (snap_dt.month - orig_start_dt.month)
            norm_elapsed = min(1.3, total_elapsed_m / max(1, orig_duration_months))
            
            if archetype == "healthy":
                target_prog = s_curve_progress(norm_elapsed, steepness=5.5)
                delta_prog = max(0.4, (target_prog - curr_progress) * random.uniform(0.8, 1.1))
                curr_progress = min(99.0, curr_progress + delta_prog)
                exp_ratio = curr_progress / 100.0
                curr_expenditure = round(min(curr_revised_cost * 0.98, curr_revised_cost * exp_ratio * random.uniform(0.92, 1.05)), 2)
                curr_delay_days = max(0, int(curr_delay_days + random.choice([0, 0, 0, 1, 2])))
                procurement_issue = 1 if random.random() < 0.05 else 0
                land_issue = 1 if random.random() < 0.04 else 0
                contractor_issue = 0
                approval_issue = 0
                
            elif archetype == "deteriorating":
                if m_idx < 4:
                    curr_progress += random.uniform(1.2, 2.5)
                    curr_delay_days += random.choice([0, 5, 10])
                elif m_idx < 10:
                    curr_progress += random.uniform(0.1, 0.7)
                    curr_delay_days += random.randint(15, 30)
                    curr_revised_cost = round(curr_revised_cost * (1.0 + random.uniform(0.005, 0.018)), 2)
                else:
                    curr_progress += random.uniform(0.0, 0.3)
                    curr_delay_days += random.randint(25, 45)
                    curr_revised_cost = round(curr_revised_cost * (1.0 + random.uniform(0.008, 0.025)), 2)
                    
                curr_progress = min(95.0, curr_progress)
                curr_expenditure = round(min(curr_revised_cost, curr_expenditure + (original_cost * random.uniform(0.015, 0.035))), 2)
                procurement_issue = 1 if m_idx >= 4 and random.random() < 0.75 else 0
                land_issue = 1 if m_idx >= 6 and random.random() < 0.85 else 0
                contractor_issue = 1 if m_idx >= 7 and random.random() < 0.80 else 0
                approval_issue = 1 if m_idx >= 8 and random.random() < 0.70 else 0
                
            elif archetype == "severely_delayed":
                if random.random() < 0.4:
                    curr_progress += random.uniform(0.0, 0.2)
                curr_delay_days += random.randint(25, 60)
                curr_revised_cost = round(curr_revised_cost * (1.0 + random.uniform(0.01, 0.03)), 2)
                curr_expenditure = round(min(curr_revised_cost, curr_expenditure + (original_cost * random.uniform(0.01, 0.025))), 2)
                procurement_issue = 1 if random.random() < 0.85 else 0
                land_issue = 1 if random.random() < 0.90 else 0
                contractor_issue = 1 if random.random() < 0.88 else 0
                approval_issue = 1 if random.random() < 0.80 else 0
                
            elif archetype == "cost_escalating":
                curr_progress += random.uniform(0.8, 1.8)
                curr_delay_days += random.randint(5, 20)
                curr_revised_cost = round(curr_revised_cost * (1.0 + random.uniform(0.02, 0.045)), 2)
                curr_expenditure = round(min(curr_revised_cost, curr_expenditure + (original_cost * random.uniform(0.03, 0.06))), 2)
                procurement_issue = 1 if random.random() < 0.50 else 0
                land_issue = 1 if random.random() < 0.40 else 0
                contractor_issue = 1 if random.random() < 0.60 else 0
                approval_issue = 1 if random.random() < 0.55 else 0
                
            elif archetype == "recovered":
                if m_idx < 6:
                    curr_progress += random.uniform(0.1, 0.5)
                    curr_delay_days += random.randint(15, 30)
                    procurement_issue = 1
                    land_issue = 1
                    contractor_issue = 1
                    approval_issue = 0
                else:
                    curr_progress += random.uniform(2.5, 4.5)
                    curr_delay_days += random.choice([0, 0, 1])
                    procurement_issue = 0
                    land_issue = 0
                    contractor_issue = 0
                    approval_issue = 0
                curr_progress = min(98.0, curr_progress)
                curr_expenditure = round(min(curr_revised_cost, curr_expenditure + (original_cost * random.uniform(0.02, 0.04))), 2)
            
            revised_end_dt = orig_end_dt + datetime.timedelta(days=int(curr_delay_days))
            
            snap_record = {
                "project_id": project_id,
                "report_month": m_str,
                "revised_cost": round(curr_revised_cost, 2),
                "cumulative_expenditure": round(curr_expenditure, 2),
                "physical_progress_pct": round(min(100.0, max(0.0, curr_progress)), 2),
                "delay_days": int(curr_delay_days),
                "current_end_date": revised_end_dt.strftime("%Y-%m-%d"),
                "issue_procurement": procurement_issue,
                "issue_land": land_issue,
                "issue_contractor": contractor_issue,
                "issue_approval": approval_issue,
                "status": "Ongoing" if curr_progress < 95.0 else "Nearing Completion"
            }
            
            # Subtle raw noise for DQE demonstration
            anomaly_rand = random.random()
            if anomaly_rand < 0.002:
                snap_record["cumulative_expenditure"] = None
            elif anomaly_rand < 0.004:
                snap_record["physical_progress_pct"] = 103.5
            elif anomaly_rand < 0.006:
                snap_record["revised_cost"] = -120.0
                
            snapshots_list.append(snap_record)
            
    df_projects = pd.DataFrame(projects_list)
    df_snapshots = pd.DataFrame(snapshots_list)
    
    raw_projects_path = os.path.join(output_dir, "projects_master.csv")
    raw_snapshots_path = os.path.join(output_dir, "project_snapshots.csv")
    
    df_projects.to_csv(raw_projects_path, index=False)
    df_snapshots.to_csv(raw_snapshots_path, index=False)
    
    print(f"Generated {len(df_projects)} projects and {len(df_snapshots)} snapshots.")
    print(f"Saved to: {raw_projects_path} and {raw_snapshots_path}")
    
    return df_projects, df_snapshots

if __name__ == "__main__":
    generate_synthetic_dataset(n_projects=2000)
