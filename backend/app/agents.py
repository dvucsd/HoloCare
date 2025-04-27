import os
import requests

API_URL = "https://api.asi1.ai/v1/chat/completions"
API_KEY = os.getenv("ASI1_MINI_API_KEY", "sk_9ef9e636205049d9957cdfe809b3d0dbcd95121f39984b939b47eb0dd7b17bbf")  # set this in your env

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

def call_asi1mini(system_prompt: str, user_content: str) -> str:
    payload = {
        "model": "asi1-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        "temperature": 0.0,
        "max_tokens": 500,
    }
    resp = requests.post(API_URL, headers=HEADERS, json=payload)
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]

def interpret_request(text: str) -> str:
    return call_asi1mini(
        "You are the Interpretation Agent. Extract procedure, patient name, DOB, insurance.",
        text
    )

def fetch_medical_records(parsed: str) -> str:
    return call_asi1mini(
        "You are the Medical Records Agent. List the referral notes and documents needed.",
        parsed
    )

def generate_insurance_form(parsed: str, records: str) -> str:
    prompt = (
        "You are the Form Generator Agent. Fill a prior-authorization form "
        "for Blue Shield PPO given this request and records."
    )
    return call_asi1mini(prompt, f"{parsed}\n\nRecords needed:\n{records}")

def submit_to_insurance(form: str) -> str:
    return call_asi1mini(
        "You are the Submission Agent. Simulate submitting to the insurer and return an ID + ETA.",
        form
    )

def notify_doctor(status: str) -> str:
    return call_asi1mini(
        "You are the Notification Agent. Craft a concise status update for doctor & patient.",
        status
    )
