
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase_client import supabase
from agents.complaint_agent import analyze_complaint
from agents.risk_agent import calculate_priority
from agents.workorder_agent import generate_work_order
from agents.crew_agent import assign_crew
from agents.resolution_agent import validate_resolution
from agents.audit_agent import log_action
from datetime import datetime
import uuid
import json
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class ComplaintCreate(BaseModel):
    description: str
    latitude: float
    longitude: float
    user_id: str

def clean_ai_json(raw_text: str):
    cleaned = re.sub(r"`json|`", "", raw_text)
    return cleaned.strip()

@app.get("/")
def root():
    return {"message": "City Digital Twin Backend Running ?"}

@app.post("/submit-complaint")
def submit_complaint(complaint: ComplaintCreate):

    ai_result_raw = analyze_complaint(complaint.description)
    cleaned_text = clean_ai_json(ai_result_raw)
    ai_result = json.loads(cleaned_text)

    priority_score, sla_deadline = calculate_priority(
        ai_result.get("urgency"),
        ai_result.get("category")
    )

    complaint_id = str(uuid.uuid4())

    data = {
        "id": complaint_id,
        "user_id": complaint.user_id,
        "description_raw": complaint.description,
        "description_refined": ai_result.get("refined_description"),
        "category": ai_result.get("category"),
        "urgency": ai_result.get("urgency"),
        "priority_score": priority_score,
        "sla_deadline": sla_deadline.isoformat(),
        "latitude": complaint.latitude,
        "longitude": complaint.longitude,
        "status": "submitted",
        "created_at": datetime.utcnow().isoformat()
    }

    supabase.table("complaints").insert(data).execute()

    log_action("complaint", complaint_id, "Complaint submitted")

    return {
        "message": "Complaint submitted successfully ?",
        "complaint_id": complaint_id
    }

@app.get("/admin/work-orders")
def get_work_orders():
    response = supabase.table("work_orders") \
        .select("*") \
        .order("created_at", desc=True) \
        .execute()

    return response.data

@app.post("/admin/generate-work-order/{complaint_id}")
def generate_work_order_endpoint(complaint_id: str):

    complaint_response = supabase.table("complaints") \
        .select("*") \
        .eq("id", complaint_id) \
        .execute()

    if not complaint_response.data:
        return {"error": "Complaint not found"}

    complaint = complaint_response.data[0]

    work_order_data = generate_work_order(
        complaint["category"],
        complaint["description_refined"]
    )

    crew_id = assign_crew(complaint["category"])
    work_order_id = str(uuid.uuid4())

    data = {
        "id": work_order_id,
        "complaint_id": complaint_id,
        "assigned_crew": crew_id,
        "checklist": work_order_data.get("steps"),
        "estimated_cost": work_order_data.get("estimated_cost"),
        "status": "assigned"
    }

    supabase.table("work_orders").insert(data).execute()

    supabase.table("complaints") \
        .update({"status": "in_progress"}) \
        .eq("id", complaint_id) \
        .execute()

    log_action("work_order", work_order_id, "Work order generated")

    return {
        "message": "Work order generated ?",
        "work_order_id": work_order_id
    }

@app.post("/crew/complete-work-order/{work_order_id}")
def complete_work_order(work_order_id: str):

    work_order_response = supabase.table("work_orders") \
        .select("*") \
        .eq("id", work_order_id) \
        .execute()

    if not work_order_response.data:
        return {"error": "Work order not found"}

    work_order = work_order_response.data[0]
    complaint_id = work_order["complaint_id"]

    complaint_response = supabase.table("complaints") \
        .select("*") \
        .eq("id", complaint_id) \
        .execute()

    if not complaint_response.data:
        return {"error": "Complaint not found"}

    complaint = complaint_response.data[0]

    validation_result = validate_resolution(
        complaint.get("sla_deadline")
    )

    supabase.table("work_orders") \
        .update({"status": "completed"}) \
        .eq("id", work_order_id) \
        .execute()

    supabase.table("complaints") \
        .update({"status": "resolved"}) \
        .eq("id", complaint_id) \
        .execute()

    log_action("work_order", work_order_id, "Work order completed")

    return {
        "message": "Work order completed ?",
        "resolution_details": validation_result
    }

@app.get("/admin/analytics")
def get_analytics():

    complaints = supabase.table("complaints").select("*").execute().data
    work_orders = supabase.table("work_orders").select("*").execute().data

    total_complaints = len(complaints)
    resolved_count = len([c for c in complaints if c["status"] == "resolved"])
    in_progress_count = len([c for c in complaints if c["status"] == "in_progress"])
    submitted_count = len([c for c in complaints if c["status"] == "submitted"])

    sla_met_count = 0
    sla_breached_count = 0

    for log in supabase.table("audit_logs").select("*").execute().data:
        if log["action"] == "Work order completed":
            # find complaint linked to this work order
            wo = next((w for w in work_orders if w["id"] == log["entity_id"]), None)
            if wo:
                comp = next((c for c in complaints if c["id"] == wo["complaint_id"]), None)
                if comp:
                    if comp.get("status") == "resolved":
                        # check SLA from resolution logs
                        # simplified logic: assume breached if sla_deadline < created_at
                        if comp.get("sla_deadline"):
                            from datetime import datetime
                            sla = datetime.fromisoformat(comp["sla_deadline"])
                            created = datetime.fromisoformat(comp["created_at"])
                            if created <= sla:
                                sla_met_count += 1
                            else:
                                sla_breached_count += 1

    category_distribution = {}
    for c in complaints:
        cat = c["category"]
        category_distribution[cat] = category_distribution.get(cat, 0) + 1

    avg_priority = (
        sum([c["priority_score"] for c in complaints if c["priority_score"]])
        / len([c for c in complaints if c["priority_score"]])
        if len([c for c in complaints if c["priority_score"]]) > 0
        else 0
    )

    return {
        "total_complaints": total_complaints,
        "resolved_count": resolved_count,
        "in_progress_count": in_progress_count,
        "submitted_count": submitted_count,
        "sla_met_count": sla_met_count,
        "sla_breached_count": sla_breached_count,
        "category_distribution": category_distribution,
        "average_priority_score": round(avg_priority, 2)
    }


@app.get("/admin/complaints")
def get_complaints():
    response = supabase.table("complaints") \
        .select("*") \
        .order("created_at", desc=True) \
        .execute()

    return response.data

