#!/usr/bin/env python3
"""
SiteSync Synthetic Dataset Generator (Python CLI)
Smart India Hackathon 2026 — SIH26122 (Oil India Limited)

Generates:
- schedule.json (Activities & Dependencies)
- field_reports/ (DPRs across Civil, Piping, Mechanical, Electrical, HSE)
- benchmark.json & ground_truth.json (L1-L7 Difficulty Benchmark)
"""

import os
import json
from datetime import datetime, timedelta

def generate_data():
    project_id = "PROJ-OIL-2026-01"
    
    project = {
        "id": project_id,
        "projectCode": "OIL-CSE-2026",
        "name": "Compressor Station Expansion Project",
        "client": "Oil India Limited",
        "location": "Duliajan Gas Processing Terminal, Assam",
        "plannedStart": "2026-08-01",
        "plannedFinish": "2027-04-30",
        "status": "ACTIVE"
    }

    disciplines = ["CIVIL", "PIPING", "MECHANICAL", "ELECTRICAL", "INSTRUMENTATION", "HSE"]

    activities = [
        {
            "activityCode": "CIV-EXC-042",
            "name": "Compressor Foundation Excavation",
            "discipline": "CIVIL",
            "location": "Compressor Area - North",
            "plannedStart": "2026-09-10",
            "plannedFinish": "2026-09-18",
            "plannedDuration": 8,
            "criticalPath": True,
            "aliases": [
                "Comp foundation excavation",
                "Excavation for compressor foundation",
                "Compressor foundation digging",
                "Comp. Fdn. Exctn"
            ]
        },
        {
            "activityCode": "CIV-PCC-043",
            "name": "Plain Cement Concrete (PCC) Sub-base Pouring",
            "discipline": "CIVIL",
            "location": "Compressor Area - North",
            "plannedStart": "2026-09-19",
            "plannedFinish": "2026-09-22",
            "plannedDuration": 3,
            "criticalPath": True,
            "aliases": ["PCC preparation", "PCC pouring under compressor"]
        },
        {
            "activityCode": "PIP-WLD-102",
            "name": "Header Spool 12 Tie-in Joint Welding",
            "discipline": "PIPING",
            "location": "Interconnecting Pipe Rack - Bay 3",
            "plannedStart": "2026-09-12",
            "plannedFinish": "2026-09-17",
            "plannedDuration": 5,
            "criticalPath": True,
            "aliases": ["Tie-in joint welding at Header Spool 12", "Header spool welding"]
        },
        {
            "activityCode": "ELE-CAB-302",
            "name": "Medium Voltage 6.6kV Power Cable Pulling in Tray",
            "discipline": "ELECTRICAL",
            "location": "Substation Yard",
            "plannedStart": "2026-09-12",
            "plannedFinish": "2026-09-18",
            "plannedDuration": 6,
            "criticalPath": False,
            "aliases": ["MV cable pulling in tray at Substation Yard", "6.6kV cable laying"]
        }
    ]

    benchmark_events = [
        {
            "id": "BENCH-01",
            "rawText": "Compressor Foundation Excavation is 80% complete.",
            "groundTruthActivityId": "CIV-EXC-042",
            "difficulty": "LEVEL_1_EXACT"
        },
        {
            "id": "BENCH-02",
            "rawText": "Excavation work at compressor foundation has reached 80%.",
            "groundTruthActivityId": "CIV-EXC-042",
            "difficulty": "LEVEL_2_PARAPHRASE"
        },
        {
            "id": "BENCH-03",
            "rawText": "Comp. fdn. exctn approx 80%.",
            "groundTruthActivityId": "CIV-EXC-042",
            "difficulty": "LEVEL_3_NOISY"
        },
        {
            "id": "BENCH-04",
            "rawText": "Temporary drainage channel completed near compressor area.",
            "groundTruthActivityId": "UNMATCHED",
            "difficulty": "LEVEL_7_UNMATCHED"
        }
    ]

    os.makedirs("data", exist_ok=True)
    with open("data/schedule.json", "w") as f:
        json.dump({"project": project, "activities": activities}, f, indent=2)

    with open("data/benchmark.json", "w") as f:
        json.dump(benchmark_events, f, indent=2)

    print(f"Generated synthetic dataset with {len(activities)} core activities and {len(benchmark_events)} benchmark test cases.")

if __name__ == "__main__":
    generate_data()
