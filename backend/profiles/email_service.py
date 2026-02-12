import json
import requests
from django.conf import settings
from .ollama_service import collect_user_data

OLLAMA_URL = getattr(settings, 'OLLAMA_API_URL', 'http://localhost:11434/api/generate')
OLLAMA_MODEL = getattr(settings, 'OLLAMA_MODEL', 'llama3.2')


def generate_cold_email(user, job_description, company_name='', recipient_name='', tone='professional', email_type='application'):
    """Generate a cold email based on user data and job description."""

    user_data = collect_user_data(user)

    prompt = f"""You are an expert career coach and professional email writer.

TASK: Write a compelling cold email for a job opportunity.

CANDIDATE INFORMATION:
{json.dumps(user_data, indent=2)}

JOB DESCRIPTION:
{job_description}

EMAIL DETAILS:
- Company: {company_name or 'the company from job description'}
- Recipient: {recipient_name or 'Hiring Manager'}
- Tone: {tone}
- Type: {email_type}

EMAIL TYPE DESCRIPTIONS:
- application: Direct job application email
- networking: Networking/informational interview request
- referral: Asking for a referral
- followup: Follow-up after application/interview

INSTRUCTIONS:
1. Write a concise, impactful email (150-250 words body)
2. Include a compelling subject line
3. Open with a hook that grabs attention
4. Highlight 2-3 most relevant achievements matching the job
5. Show genuine interest in the company
6. Include a clear call-to-action
7. Keep it professional but personable
8. Make it ATS-keyword rich naturally

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{{
    "subject_line": "Compelling subject line",
    "greeting": "Dear [Name/Hiring Manager],",
    "body_paragraphs": [
        "Opening paragraph with hook...",
        "Middle paragraph highlighting relevant skills/experience...",
        "Closing paragraph with call-to-action..."
    ],
    "sign_off": "Best regards,",
    "sender_name": "Candidate Name",
    "alternative_subjects": [
        "Alternative subject 1",
        "Alternative subject 2"
    ],
    "tips": [
        "Tip for personalizing this email further",
        "Another tip"
    ]
}}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                'model': OLLAMA_MODEL,
                'prompt': prompt,
                'stream': False,
                'options': {'temperature': 0.4, 'num_predict': 2048},
            },
            timeout=120,
        )
        response.raise_for_status()
        raw = response.json().get('response', '')
        return _parse_json_response(raw)
    except requests.exceptions.ConnectionError:
        raise Exception('Cannot connect to Ollama. Make sure Ollama is running.')
    except requests.exceptions.Timeout:
        raise Exception('Request timed out.')
    except Exception as e:
        raise Exception(f'Generation error: {str(e)}')


def _parse_json_response(raw_text):
    """Parse JSON from AI response."""
    import re
    text = raw_text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    for pattern in [r'```json\s*(.*?)\s*```', r'```\s*(.*?)\s*```', r'\{.*\}']:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                json_str = match.group(1) if '```' in pattern else match.group(0)
                return json.loads(json_str)
            except (json.JSONDecodeError, IndexError):
                continue

    return {
        'subject_line': 'Application for Position',
        'greeting': 'Dear Hiring Manager,',
        'body_paragraphs': [text[:500]],
        'sign_off': 'Best regards,',
        'sender_name': '',
        'alternative_subjects': [],
        'tips': [],
        'raw_response': text,
    }