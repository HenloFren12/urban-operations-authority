from supabase_client import supabase

def assign_crew(category: str):

    response = supabase.table("profiles") \
        .select("*") \
        .eq("role", "crew") \
        .eq("department", category) \
        .limit(1) \
        .execute()

    if response.data:
        return response.data[0]["id"]

    fallback = supabase.table("profiles") \
        .select("*") \
        .eq("role", "crew") \
        .limit(1) \
        .execute()

    if fallback.data:
        return fallback.data[0]["id"]

    return None
