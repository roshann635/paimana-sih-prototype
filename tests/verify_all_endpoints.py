import sys
import os
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

endpoints_to_test = [
    ("GET", "/", None),
    ("GET", "/api/v1/dashboard/summary", None),
    ("GET", "/api/v1/analytics/states", None),
    ("GET", "/api/v1/projects?limit=10", None),
    ("GET", "/api/v1/projects?limit=1630", None),
    ("GET", "/api/v1/risk/priority-queue?limit=10", None),
    ("GET", "/api/v1/alerts?limit=50", None),
    ("GET", "/api/v1/benchmarks", None),
    ("GET", "/api/v1/model/health", None),
    ("GET", "/api/v1/data-quality", None),
    ("GET", "/api/v1/interventions", None),
]

print("=== VERIFYING ALL BACKEND API ENDPOINTS ===")
all_passed = True

for method, path, payload in endpoints_to_test:
    try:
        if method == "GET":
            res = client.get(path)
        else:
            res = client.post(path, json=payload)
            
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list):
                count = len(data)
                print(f"[PASS] {method:4} {path:35} -> 200 OK | Records: {count}")
            elif isinstance(data, dict):
                keys_count = len(data.keys())
                print(f"[PASS] {method:4} {path:35} -> 200 OK | Keys: {keys_count}")
            else:
                print(f"[PASS] {method:4} {path:35} -> 200 OK")
        else:
            print(f"[FAIL] {method:4} {path:35} -> {res.status_code} | {res.text}")
            all_passed = False
    except Exception as e:
        print(f"[FAIL] {method:4} {path:35} -> EXCEPTION: {e}")
        all_passed = False

# Test Project Deep Dive endpoints with a real project ID
pq_res = client.get("/api/v1/risk/priority-queue?limit=1")
if pq_res.status_code == 200 and len(pq_res.json()) > 0:
    pid = pq_res.json()[0]["project_id"]
    print(f"\nTesting Deep Dive Endpoints for Real Project: {pid}")
    for sub in ["", "/risk", "/trajectory", "/explanation", "/recommendations"]:
        sub_path = f"/api/v1/projects/{pid}{sub}"
        r = client.get(sub_path)
        if r.status_code == 200:
            print(f"[PASS] GET  {sub_path:40} -> 200 OK")
        else:
            print(f"[FAIL] GET  {sub_path:40} -> {r.status_code} | {r.text}")
            all_passed = False

# Test Assistant Query
r_ai = client.post("/api/v1/assistant/query", json={"query": "Why is project at risk?"})
if r_ai.status_code == 200:
    print(f"[PASS] POST {'/api/v1/assistant/query':40} -> 200 OK | Evidence: {len(r_ai.json().get('evidence_sources', []))} sources")
else:
    print(f"[FAIL] POST {'/api/v1/assistant/query':40} -> {r_ai.status_code}")
    all_passed = False

print("\nFINAL STATUS:", "ALL TESTS PASSED [PASS]" if all_passed else "FAILURES DETECTED [FAIL]")

sys.exit(0 if all_passed else 1)
