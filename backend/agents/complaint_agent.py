import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url=os.getenv("OPENROUTER_BASE_URL"),
)

def analyze_complaint(description: str):
    prompt = f'''
You are an AI infrastructure complaint classifier.

Analyze the complaint below and return JSON with:
- category (water, road, electricity, drainage, other)
- urgency (low, medium, high)
- refined_description (cleaned and professional version)

Complaint:
"{description}"

Respond ONLY in valid JSON format.
'''

    response = client.chat.completions.create(
        model="openrouter/auto",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    return response.choices[0].message.content
