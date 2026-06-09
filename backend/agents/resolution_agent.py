from datetime import datetime, timezone

def validate_resolution(sla_deadline_str: str):

    if not sla_deadline_str:
        return {
            "sla_status": "unknown",
            "completed_within_sla": False
        }

    sla_deadline = datetime.fromisoformat(sla_deadline_str)

    now = datetime.now(timezone.utc)

    completed_within_sla = now <= sla_deadline

    return {
        "sla_status": "met" if completed_within_sla else "breached",
        "completed_within_sla": completed_within_sla,
        "completed_at": now.isoformat()
    }
