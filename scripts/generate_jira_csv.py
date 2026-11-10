import csv

# Jira CSV format for Sprint 2 Backlog
JIRA_CSV_HEADER = [
    "Issue Type", "Issue key", "Summary", "Description", "Assignee",
    "Reporter", "Story Points", "Status", "Resolution", "Sprint", "Epic Name"
]

ISSUES_SPRINT_2 = [
    # Sabbir Mondal (Train Catalog & Live Services)
    {
        "type": "Story", "key": "RRS-17",
        "summary": "Local timezone scheduling and Indian Standard Time date handler",
        "desc": "Implement timezone-aware local date utility (getLocalDateString) across train search, departure dates, and timetable queries, resolving UTC midnight shift anomalies.",
        "assignee": "fakesabm@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "3", "status": "To Do", "resolution": "", "sprint": "Sprint 2", "epic": "Train Catalog"
    },
    {
        "type": "Story", "key": "RRS-18",
        "summary": "Live GPS train radar telemetry and real-time delay tracking integration",
        "desc": "Integrate real-time Indian Railways satellite telemetry via RailRadar API, displaying live train speed, geographical coordinates, approaching halts, and delay indicators.",
        "assignee": "fakesabm@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "5", "status": "To Do", "resolution": "", "sprint": "Sprint 2", "epic": "Train Catalog"
    },

    # Samvit Atur (Seat Engine & Concurrency)
    {
        "type": "Story", "key": "RRS-19",
        "summary": "Interactive 2D coach visualizer with authentic IRCTC berth layouts",
        "desc": "Develop visual 2D interactive coach visualizer for AC Executive, 1A, 2A, 3A, and Sleeper coaches with Lower, Middle, Upper, Side Lower, and Window berth selectors.",
        "assignee": "samvitaturbtw@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "5", "status": "To Do", "resolution": "", "sprint": "Sprint 2", "epic": "Seat Engine"
    },
    {
        "type": "Story", "key": "RRS-20",
        "summary": "Lower berth priority allocation for senior citizens and onboard meal selector",
        "desc": "Implement auto-prioritization of lower berths for senior citizens (60+) and female passengers along with onboard IRCTC catering choices (Veg, Non-Veg, Jain).",
        "assignee": "samvitaturbtw@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "3", "status": "To Do", "resolution": "", "sprint": "Sprint 2", "epic": "Seat Engine"
    },

    # Vinayak Kalal (CRIS Dynamic Fare Engine)
    {
        "type": "Story", "key": "RRS-21",
        "summary": "Automated live departure countdown timer and IRCTC tiered refund engine",
        "desc": "Implement live PRS departure countdown timer automatically determining IRCTC cancellation deduction tiers (>48h flat clerkage, 48-12h 25%, 12-4h 50%, <4h 100%) with instant net refund computation.",
        "assignee": "kalalvinayak23@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "5", "status": "To Do", "resolution": "", "sprint": "Sprint 2", "epic": "Fare Engine"
    },
    {
        "type": "Story", "key": "RRS-22",
        "summary": "Cryptographic cancellation audit logging and refund reference generation",
        "desc": "Build backend cancellation transaction handler generating unique refund tracking references (CRIS-RFND-XXXXXX) and logging cancellation deductions into the SQLite ledger.",
        "assignee": "kalalvinayak23@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "5", "status": "To Do", "resolution": "", "sprint": "Sprint 2", "epic": "Fare Engine"
    },

    # Rahul Shenoy (Booking Lifecycle & Full-Stack Lead)
    {
        "type": "Story", "key": "RRS-23",
        "summary": "ACID-compliant SQLite 3 relational database and dual-layer backend persistence",
        "desc": "Engineer relational SQLite 3 database (railway.db) with SQLAlchemy declarative models (StationModel, TrainModel, BookingModel, CancellationModel) and native Node.js 22 SQLite driver.",
        "assignee": "rahulshenoy0000@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "5", "status": "To Do", "resolution": "", "sprint": "Sprint 2", "epic": "Core Architecture"
    },
    {
        "type": "Story", "key": "RRS-24",
        "summary": "Client-server dual-layer persistence and browser refresh state synchronization",
        "desc": "Implement dual-layer persistence combining browser localStorage with backend SQLite sync (/api/db/tickets), ensuring booked tickets and cancellation statuses persist across page reloads.",
        "assignee": "rahulshenoy0000@gmail.com", "reporter": "rahulshenoy0000@gmail.com",
        "points": "5", "status": "To Do", "resolution": "", "sprint": "Sprint 2", "epic": "Core Architecture"
    }
]

with open("docs/jira_import_ready.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(JIRA_CSV_HEADER)
    for issue in ISSUES_SPRINT_2:
        writer.writerow([
            issue["type"], issue["key"], issue["summary"], issue["desc"],
            issue["assignee"], issue["reporter"], issue["points"],
            issue["status"], issue["resolution"], issue["sprint"], issue["epic"]
        ])

print("Sprint 2 Jira CSV successfully generated: docs/jira_import_ready.csv")
