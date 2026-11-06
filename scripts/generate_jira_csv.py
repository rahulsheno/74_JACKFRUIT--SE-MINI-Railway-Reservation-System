import csv
from backend.src.database.seed_data import TRAINS

# Standard Jira CSV Import format
JIRA_CSV_HEADER = [
    "Issue Type", "Issue key", "Summary", "Description", "Assignee",
    "Reporter", "Story Points", "Status", "Resolution", "Epic Name"
]

ISSUES = [
    # Sabbir (RRS-1 to RRS-4)
    {
        "type": "Story", "key": "RRS-1",
        "summary": "Train search by station and travel date with directional check",
        "desc": "Implement station-to-station route search with directional traversal validation and day-of-run calendar filtering.",
        "assignee": "fakesabm@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "3", "status": "Done", "resolution": "Done", "epic": "Train Catalog"
    },
    {
        "type": "Story", "key": "RRS-2",
        "summary": "Station graph, intermediate halt schedule and distance query",
        "desc": "Build railway station directory graph, inter-station distance calculation, and timetable inspection.",
        "assignee": "fakesabm@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "3", "status": "Done", "resolution": "Done", "epic": "Train Catalog"
    },
    {
        "type": "Story", "key": "RRS-3",
        "summary": "External Railway API live status simulation and caching",
        "desc": "Simulate CRIS/NTES live GPS train status with in-memory caching and error handling.",
        "assignee": "fakesabm@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "3", "status": "Done", "resolution": "Done", "epic": "Train Catalog"
    },
    {
        "type": "Story", "key": "RRS-4",
        "summary": "Unit tests for train catalog and route search (10/10)",
        "desc": "Automated pytest suite TC_SABBIR_01 to TC_SABBIR_10 achieving 100% pass rate.",
        "assignee": "fakesabm@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "2", "status": "Done", "resolution": "Done", "epic": "Testing"
    },

    # Samvit (RRS-5 to RRS-8)
    {
        "type": "Story", "key": "RRS-5",
        "summary": "Interactive 2D coach visualizer (1A, 2A, 3A, SL)",
        "desc": "Generate real-time 2D berth layouts with Lower, Middle, Upper, Side Lower, and Side Upper indicators.",
        "assignee": "samvitaturbtw@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "3", "status": "Done", "resolution": "Done", "epic": "Seat Engine"
    },
    {
        "type": "Story", "key": "RRS-6",
        "summary": "Berth preference auto-allocation (Lower/Upper/Middle)",
        "desc": "Implement auto-allocation logic prioritizing Lower berths for senior citizens with fallback.",
        "assignee": "samvitaturbtw@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "3", "status": "Done", "resolution": "Done", "epic": "Seat Engine"
    },
    {
        "type": "Story", "key": "RRS-7",
        "summary": "5-minute atomic concurrency seat locking mechanism",
        "desc": "Prevent race conditions and double-bookings with 300s atomic checkout locks and timeout cleanup.",
        "assignee": "samvitaturbtw@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "5", "status": "Done", "resolution": "Done", "epic": "Seat Engine"
    },
    {
        "type": "Story", "key": "RRS-8",
        "summary": "Unit tests for coach layout and seat locking (10/10)",
        "desc": "Automated pytest suite TC_SAMVIT_01 to TC_SAMVIT_10 testing concurrency locks and allocation.",
        "assignee": "samvitaturbtw@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "2", "status": "Done", "resolution": "Done", "epic": "Testing"
    },

    # Vinayak (RRS-9 to RRS-12)
    {
        "type": "Story", "key": "RRS-9",
        "summary": "Dynamic distance-based base fare computation + 5% GST",
        "desc": "Compute base fare using distance and class rate per km with minimum thresholds and 5% GST.",
        "assignee": "kalalvinayak23@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "3", "status": "Done", "resolution": "Done", "epic": "Fare Engine"
    },
    {
        "type": "Story", "key": "RRS-10",
        "summary": "Concession policies (Senior Citizen, Student, Divyangjan)",
        "desc": "Statutory concession rules: Senior Citizen (40-50%), Student (50%), Divyangjan (75%).",
        "assignee": "kalalvinayak23@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "3", "status": "Done", "resolution": "Done", "epic": "Fare Engine"
    },
    {
        "type": "Story", "key": "RRS-11",
        "summary": "IRCTC tiered cancellation refund matrix and payment simulation",
        "desc": "Compute cancellation deductions based on time before departure (>48h, 48-12h, 12-4h, <4h).",
        "assignee": "kalalvinayak23@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "3", "status": "Done", "resolution": "Done", "epic": "Fare Engine"
    },
    {
        "type": "Story", "key": "RRS-12",
        "summary": "Unit tests for fare calculations and concessions (10/10)",
        "desc": "Automated pytest suite TC_VINAYAK_01 to TC_VINAYAK_10 covering refunds, fares, and boundaries.",
        "assignee": "kalalvinayak23@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "2", "status": "Done", "resolution": "Done", "epic": "Testing"
    },

    # Rahul (RRS-13 to RRS-16)
    {
        "type": "Story", "key": "RRS-13",
        "summary": "10-digit CRIS-compliant PNR generation and status tracker",
        "desc": "Generate unique 10-digit PNRs and provide real-time status tracking.",
        "assignee": "rahulshenoy0000@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "5", "status": "Done", "resolution": "Done", "epic": "Booking Lifecycle"
    },
    {
        "type": "Story", "key": "RRS-14",
        "summary": "Cascade auto-promotion engine (WL -> RAC -> Confirmed)",
        "desc": "Automatically promote RAC passengers to Confirmed and WL passengers to RAC upon cancellation.",
        "assignee": "rahulshenoy0000@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "5", "status": "Done", "resolution": "Done", "epic": "Booking Lifecycle"
    },
    {
        "type": "Story", "key": "RRS-15",
        "summary": "Unified FastAPI server and interactive web frontend",
        "desc": "FastAPI REST API layer connecting all 4 domain services with responsive web UI.",
        "assignee": "rahulshenoy0000@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "3", "status": "Done", "resolution": "Done", "epic": "Core Architecture"
    },
    {
        "type": "Story", "key": "RRS-16",
        "summary": "CI/CD GitHub Actions, Docker container, and SDLC docs",
        "desc": "GitHub Actions automated test pipeline, Docker configuration, and IEEE standard SDLC documentation.",
        "assignee": "rahulshenoy0000@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "3", "status": "Done", "resolution": "Done", "epic": "DevOps & SDLC"
    }
]

with open("docs/jira_import_ready.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(JIRA_CSV_HEADER)
    for issue in ISSUES:
        writer.writerow([
            issue["type"], issue["key"], issue["summary"], issue["desc"],
            issue["assignee"], issue["reporter"], issue["points"],
            issue["status"], issue["resolution"], issue["epic"]
        ])

print("Jira CSV file generated successfully: docs/jira_import_ready.csv")

