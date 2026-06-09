from supabase_client import supabase
from datetime import datetime
import uuid

def log_action(entity_type: str, entity_id: str, action: str):

    data = {
        "id": str(uuid.uuid4()),
        "entity_type": entity_type,
        "entity_id": entity_id,
        "action": action,
        "performed_by": None,
        "timestamp": datetime.utcnow().isoformat()
    }

    supabase.table("audit_logs").insert(data).execute()
