import os
from openai import OpenAI
from dotenv import load_dotenv
import json
import re

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url=os.getenv("OPENROUTER_BASE_URL"),
)

def clean_ai_json(raw_text: str):
    cleaned = re.sub(r"`json|`", "", raw_text)
    return cleaned.strip()

def generate_work_order(category: str, description: str):

    prompt = f'''
You are an infrastructure operations planner.

Generate a structured work order checklist in JSON format.

Return JSON with:
- steps (array of step descriptions)
- required_team (string)
- estimated_cost (number)

Complaint Category: {category}
Description: {description}

Respond ONLY in valid JSON.
'''

    response = client.chat.completions.create(
        model="openrouter/auto",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    raw_output = response.choices[0].message.content
    cleaned = clean_ai_json(raw_output)

    return json.loads(cleaned)
