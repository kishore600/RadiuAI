# cultural_intelligence_system.py
import os
import sys
import json
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load API key
env_path = Path(__file__).resolve().parents[2] / "Backend" / ".env"
load_dotenv(dotenv_path=env_path)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("❌ OPENAI_API_KEY not found in .env")

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"


def get_business_recommendations_openai(user_input: dict) -> dict:
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    # Construct prompt with lat/lon instead of textual location
    prompt = f"""
    You are a business intelligence advisor.
    Based on the input below, provide recommendations in JSON format only.

    Input: {json.dumps(user_input, ensure_ascii=False)}

    Output JSON must include:
    {{
      "menu_recommendations": [...],
      "marketing_ideas": [...],
      "local_festivals_or_events": [...],
      "cultural_tips": [...]
    }}
    """

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "Respond in valid JSON only, no explanations."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    resp = requests.post(OPENAI_API_URL, headers=headers, json=payload)

    if resp.status_code != 200:
        return {"error": f"OpenAI API returned {resp.status_code}: {resp.text}"}

    raw_output = resp.json()["choices"][0]["message"]["content"].strip()

    try:
        return json.loads(raw_output)
    except json.JSONDecodeError:
        return {"error": f"Invalid JSON from model: {raw_output}"}


if __name__ == "__main__":
    # Read input JSON from stdin
    input_data = sys.stdin.read()
    user_input = json.loads(input_data)

    # Expect lat/lon instead of textual location
    if "lat" not in user_input or "lon" not in user_input:
        print(json.dumps({"error": "lat and lon are required"}))
        sys.exit(1)

    # Remove language_preference if present
    user_input.pop("language_preference", None)

    result = get_business_recommendations_openai(user_input)
    print(json.dumps(result, ensure_ascii=False))
