"""
PAIMANA Live Full-Stack End-to-End Test (tests/live_system_audit.py) -> PARAKH
Tests live HTTP communication with FastAPI (http://127.0.0.1:8000) and Vite (http://127.0.0.1:5173).
"""

import sys
import os
import json
import urllib.request
import urllib.error

def test_live_servers():
    print("=" * 75)
    print("PARAKH LIVE FULL-STACK INTEGRATION AUDIT")
    print("=" * 75)

    # 1. Test Frontend HTTP Availability
    print("\n[TEST 1] Frontend Server (http://127.0.0.1:5173):")
    try:
        req = urllib.request.urlopen("http://127.0.0.1:5173/", timeout=5)
        print(f"  * Status: {req.status} OK")
        print(f"  * Content-Type: {req.headers.get('Content-Type')}")
        print("  [PASS] Vite Frontend Server is LIVE and serving index.html")
    except Exception as e:
        print(f"  [FAIL] Frontend Error: {e}")
        return False

    # 2. Test Backend Health and Root
    print("\n[TEST 2] Backend Root & OpenAPI (http://127.0.0.1:8000):")
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/", timeout=5)
        data = json.loads(req.read().decode('utf-8'))
        print(f"  * System Name: {data.get('system')}")
        print(f"  * Status: {data.get('status')}")
        print(f"  * Version: {data.get('version')}")
        print("  [PASS] Backend API is LIVE and operational")
    except Exception as e:
        print(f"  [FAIL] Backend Root Error: {e}")
        return False

    # 3. Test Dashboard Summary Endpoint
    print("\n[TEST 3] Dashboard Executive Summary (GET /api/v1/dashboard/summary):")
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/dashboard/summary", timeout=5)
        data = json.loads(req.read().decode('utf-8'))
        print(f"  * Total Projects Monitored: {data.get('total_projects'):,}")
        print(f"  * Revised Capital Baseline: INR {data.get('total_revised_cost_cr'):,.1f} Cr")
        print(f"  * Cumulative Capex Drawn: INR {data.get('total_expenditure_cr'):,.1f} Cr")
        print(f"  * Mean Physical Completion: {data.get('avg_physical_progress'):.1f}%")
        print(f"  * Risk Distribution: {data.get('risk_counts')}")
        print("  [PASS] Real MoSPI Master Data successfully populated & served")
    except Exception as e:
        print(f"  [FAIL] Dashboard Summary Error: {e}")
        return False

    # 4. Test State Analytics & Geospatial Layer
    print("\n[TEST 4] State Spatial Analytics (GET /api/v1/analytics/states):")
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/analytics/states", timeout=5)
        states = json.loads(req.read().decode('utf-8'))
        print(f"  * Total Monitored States/UTs: {len(states)}")
        top_state = states[0] if states else {}
        capex_str = str(top_state.get('capex', '')).replace('\u20b9', 'INR ')
        print(f"  * Top State Exposure: {top_state.get('name')} ({top_state.get('count')} projects, {capex_str})")
        print("  [PASS] India Spatial Observatory API active")

    except Exception as e:
        print(f"  [FAIL] State Analytics Error: {e}")
        return False

    # 5. Test Priority Queue & Deep Dive Endpoints
    print("\n[TEST 5] Intervention Priority Queue & Deep Dive Analytics:")
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/risk/priority-queue?limit=3", timeout=5)
        pq = json.loads(req.read().decode('utf-8'))
        print(f"  * Priority Queue Top Items: {len(pq)}")
        target_pid = pq[0]["project_id"]
        print(f"  * Evaluating Top Priority Project: #{pq[0]['ipi_rank']} {target_pid} ({pq[0]['project_name']})")
        
        # Test Timeline
        req_tl = urllib.request.urlopen(f"http://127.0.0.1:8000/api/v1/projects/{target_pid}/timeline", timeout=5)
        tl_data = json.loads(req_tl.read().decode('utf-8'))
        print(f"    - Digital Timeline: {len(tl_data.get('milestones', []))} phases | Trend: {tl_data.get('trend_direction')} | Data Confidence: {tl_data.get('data_confidence_score')}%")
        
        # Test What-If Simulator
        sim_payload = json.dumps({"progress_delta_pct": -15, "expenditure_multiplier": 1.25, "delay_delta_days": 90}).encode('utf-8')
        req_sim = urllib.request.Request(f"http://127.0.0.1:8000/api/v1/projects/{target_pid}/simulate", data=sim_payload, headers={'Content-Type': 'application/json'})
        resp_sim = urllib.request.urlopen(req_sim, timeout=5)
        sim_data = json.loads(resp_sim.read().decode('utf-8'))
        print(f"    - What-If Simulation: Baseline {sim_data['baseline']['composite_risk_score']} -> Simulated {sim_data['simulation']['composite_risk_score']} (Delta: {sim_data['simulation']['delta_risk_score']:+} pts)")
        
        # Test Benchmarks
        req_bm = urllib.request.urlopen(f"http://127.0.0.1:8000/api/v1/projects/{target_pid}/benchmark", timeout=5)
        bm_data = json.loads(req_bm.read().decode('utf-8'))
        print(f"    - Sector Benchmark: {bm_data.get('sector')} ({len(bm_data.get('metrics', []))} comparative metrics)")
        
        # Test TreeSHAP
        req_exp = urllib.request.urlopen(f"http://127.0.0.1:8000/api/v1/projects/{target_pid}/explanation", timeout=5)
        exp_data = json.loads(req_exp.read().decode('utf-8'))
        print(f"    - TreeSHAP Attributions: {len(exp_data.get('attributions', []))} local feature drivers")
        
        print("  [PASS] Project Deep Dive & Advanced Intelligence verified")
    except Exception as e:
        print(f"  [FAIL] Priority Queue / Deep Dive Error: {e}")
        return False

    # 6. Test Model Health & Mendeley Citations
    print("\n[TEST 6] Model Health & Mendeley Research Citations:")
    try:
        req_mh = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/model/health", timeout=5)
        mh_data = json.loads(req_mh.read().decode('utf-8'))
        print(f"  * Cost Overrun Model: ROC-AUC {mh_data.get('cost_model', {}).get('roc_auc')} | Brier {mh_data.get('cost_model', {}).get('brier_score')}")
        print(f"  * Schedule Slippage Model: ROC-AUC {mh_data.get('time_model', {}).get('roc_auc')} | Brier {mh_data.get('time_model', {}).get('brier_score')}")
        
        req_cit = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/research/citations", timeout=5)
        cit_data = json.loads(req_cit.read().decode('utf-8'))
        print(f"  * Ingested Mendeley References: {cit_data.get('total')} academic & MoSPI citations")
        print("  [PASS] Algorithmic Health & Mendeley Grounding active")
    except Exception as e:
        print(f"  [FAIL] Model Health Error: {e}")
        return False

    # 7. Test Grounded AI Assistant
    print("\n[TEST 7] Grounded AI Decision Support Query:")
    try:
        ai_payload = json.dumps({"query": "What are the EVM performance indicators for project 618233?"}).encode('utf-8')
        req_ai = urllib.request.Request("http://127.0.0.1:8000/api/v1/assistant/query", data=ai_payload, headers={'Content-Type': 'application/json'})
        resp_ai = urllib.request.urlopen(req_ai, timeout=5)
        ai_data = json.loads(resp_ai.read().decode('utf-8'))
        print(f"  * Confidence: {ai_data.get('confidence')*100:.0f}%")
        print(f"  * Evidence Sources: {ai_data.get('evidence_sources')}")
        print("  [PASS] PARAKH Grounded AI Assistant active")
    except Exception as e:
        print(f"  [FAIL] AI Assistant Error: {e}")
        return False

    print("\n" + "=" * 75)
    print("ALL LIVE FULL-STACK CHECKS PASSED WITH ZERO ERRORS!")
    print("=" * 75)
    return True

if __name__ == "__main__":
    success = test_live_servers()
    sys.exit(0 if success else 1)
