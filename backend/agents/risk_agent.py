from datetime import datetime, timedelta

def calculate_priority(urgency: str, category: str):
    
    urgency_scores = {
        "low": 1,
        "medium": 5,
        "high": 10
    }

    category_scores = {
        "water": 8,
        "electricity": 9,
        "road": 6,
        "drainage": 7,
        "other": 4
    }

    urgency_score = urgency_scores.get(urgency.lower(), 3)
    category_score = category_scores.get(category.lower(), 5)

    # Weighted score
    priority_score = (urgency_score * 0.6) + (category_score * 0.4)

    # SLA logic
    if priority_score >= 8:
        sla_hours = 4
    elif priority_score >= 5:
        sla_hours = 12
    else:
        sla_hours = 48

    sla_deadline = datetime.utcnow() + timedelta(hours=sla_hours)

    return priority_score, sla_deadline
