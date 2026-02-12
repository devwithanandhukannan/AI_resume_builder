import json
import requests
import re
from django.conf import settings
from .ollama_service import collect_user_data

OLLAMA_URL = getattr(settings, 'OLLAMA_API_URL', 'http://localhost:11434/api/generate')
OLLAMA_MODEL = getattr(settings, 'OLLAMA_MODEL', 'llama3.2')


def generate_interview_questions(user, job_description, question_type, count=10, difficulty='medium'):
    """Generate interview questions based on type."""

    user_data = collect_user_data(user)

    if question_type == 'aptitude':
        return _generate_aptitude_questions(job_description, count, difficulty)
    elif question_type == 'hr':
        return _generate_hr_questions(user_data, job_description, count)
    elif question_type == 'technical':
        return _generate_technical_questions(user_data, job_description, count, difficulty)
    elif question_type == 'behavioral':
        return _generate_behavioral_questions(user_data, job_description, count)
    elif question_type == 'mock':
        return _generate_mock_interview(user_data, job_description, count)
    else:
        raise ValueError(f'Unknown question type: {question_type}')


def _generate_aptitude_questions(job_description, count, difficulty):
    """Generate MCQ aptitude questions with correct answers."""

    prompt = f"""You are an aptitude test question generator for job interviews.

JOB CONTEXT:
{job_description}

TASK: Generate {count} multiple-choice aptitude questions.
Difficulty: {difficulty}

Include a mix of:
- Quantitative/Mathematical reasoning
- Logical reasoning
- Verbal reasoning
- Data interpretation
- Pattern recognition

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{{
    "questions": [
        {{
            "id": 1,
            "question": "Clear question text here?",
            "options": {{
                "A": "Option A text",
                "B": "Option B text",
                "C": "Option C text",
                "D": "Option D text"
            }},
            "correct_answer": "B",
            "explanation": "Detailed explanation of why B is correct...",
            "category": "Quantitative",
            "difficulty": "medium"
        }}
    ]
}}

RULES:
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE correct answer per question
- Include clear explanations
- Mix different aptitude categories
- Make distractors plausible but clearly wrong
"""

    return _call_ollama(prompt)


def _generate_hr_questions(user_data, job_description, count):
    """Generate HR interview questions with suggested answers."""

    prompt = f"""You are an HR interview preparation expert.

CANDIDATE:
{json.dumps(user_data, indent=2)}

JOB DESCRIPTION:
{job_description}

TASK: Generate {count} HR interview questions with ideal answers tailored to this candidate.

Include questions about:
- Self introduction
- Strengths and weaknesses
- Career goals
- Why this company/role
- Salary expectations
- Work culture fit
- Conflict resolution
- Leadership experience
- Team collaboration

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{{
    "questions": [
        {{
            "id": 1,
            "question": "Tell me about yourself",
            "category": "Introduction",
            "suggested_answer": "A detailed, personalized answer using the candidate's actual experience...",
            "tips": ["Tip 1 for answering this well", "Tip 2"],
            "what_they_look_for": "What the interviewer is really assessing",
            "common_mistakes": "What to avoid when answering"
        }}
    ]
}}
"""

    return _call_ollama(prompt)


def _generate_technical_questions(user_data, job_description, count, difficulty):
    """Generate technical interview questions based on skills."""

    prompt = f"""You are a senior technical interviewer.

CANDIDATE SKILLS:
{json.dumps(user_data.get('skills', []), indent=2)}

CANDIDATE EXPERIENCE:
{json.dumps(user_data.get('experience', []), indent=2)}

JOB DESCRIPTION:
{job_description}

TASK: Generate {count} technical interview questions.
Difficulty: {difficulty}

Include questions about:
- Core technical concepts related to the job
- Problem-solving scenarios
- System design (if senior role)
- Coding/logic questions
- Technology-specific questions matching candidate's skills

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{{
    "questions": [
        {{
            "id": 1,
            "question": "Technical question here?",
            "category": "Data Structures",
            "difficulty": "{difficulty}",
            "suggested_answer": "Detailed model answer...",
            "follow_up": "A likely follow-up question the interviewer might ask",
            "key_points": ["Key point 1 to mention", "Key point 2"]
        }}
    ]
}}
"""

    return _call_ollama(prompt)


def _generate_behavioral_questions(user_data, job_description, count):
    """Generate behavioral (STAR method) questions."""

    prompt = f"""You are a behavioral interview expert using the STAR method.

CANDIDATE:
{json.dumps(user_data, indent=2)}

JOB DESCRIPTION:
{job_description}

TASK: Generate {count} behavioral interview questions with STAR-method answers.

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{{
    "questions": [
        {{
            "id": 1,
            "question": "Tell me about a time when you...",
            "category": "Leadership",
            "star_answer": {{
                "situation": "Describe the context using candidate's actual experience...",
                "task": "What was the specific challenge...",
                "action": "What steps were taken...",
                "result": "What was the measurable outcome..."
            }},
            "tips": ["Tip 1", "Tip 2"],
            "variations": ["Similar question phrased differently"]
        }}
    ]
}}
"""

    return _call_ollama(prompt)


def _generate_mock_interview(user_data, job_description, count):
    """Generate a full mock interview simulation."""

    prompt = f"""You are a senior hiring manager conducting a mock interview.

CANDIDATE:
{json.dumps(user_data, indent=2)}

JOB DESCRIPTION:
{job_description}

TASK: Create a {count}-question mock interview simulation with a mix of HR, technical, and behavioral questions in the order they'd typically appear in a real interview.

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{{
    "interview_flow": [
        {{
            "id": 1,
            "phase": "Opening",
            "question": "Question text",
            "type": "HR",
            "ideal_answer": "Model answer personalized to candidate...",
            "scoring_criteria": "What makes a great vs good vs poor answer",
            "time_suggested": "2-3 minutes"
        }}
    ],
    "overall_tips": [
        "General interview tip 1",
        "General interview tip 2"
    ]
}}
"""

    return _call_ollama(prompt)


def check_aptitude_answers(questions_data, user_answers):
    """Check user's aptitude answers against correct answers."""
    results = []
    correct_count = 0
    total = len(questions_data)

    for q in questions_data:
        qid = q['id']
        correct = q['correct_answer']
        user_ans = user_answers.get(str(qid), '')
        is_correct = user_ans.upper() == correct.upper()

        if is_correct:
            correct_count += 1

        results.append({
            'id': qid,
            'question': q['question'],
            'your_answer': user_ans,
            'correct_answer': correct,
            'is_correct': is_correct,
            'explanation': q.get('explanation', ''),
            'category': q.get('category', ''),
        })

    return {
        'results': results,
        'score': correct_count,
        'total': total,
        'percentage': round((correct_count / total) * 100, 1) if total > 0 else 0,
        'grade': _get_grade(correct_count, total),
    }


def _get_grade(correct, total):
    if total == 0:
        return 'N/A'
    pct = (correct / total) * 100
    if pct >= 90:
        return 'Excellent'
    elif pct >= 75:
        return 'Good'
    elif pct >= 60:
        return 'Average'
    elif pct >= 40:
        return 'Below Average'
    else:
        return 'Needs Improvement'


def _call_ollama(prompt):
    """Call Ollama API and parse response."""
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                'model': OLLAMA_MODEL,
                'prompt': prompt,
                'stream': False,
                'options': {'temperature': 0.4, 'num_predict': 4096},
            },
            timeout=180,
        )
        response.raise_for_status()
        raw = response.json().get('response', '')
        return _parse_response(raw)
    except requests.exceptions.ConnectionError:
        raise Exception('Cannot connect to Ollama. Run: ollama serve')
    except requests.exceptions.Timeout:
        raise Exception('Request timed out. Try fewer questions.')
    except Exception as e:
        raise Exception(f'AI generation error: {str(e)}')


def _parse_response(raw_text):
    """Extract JSON from AI response."""
    text = raw_text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    for pattern in [r'```json\s*(.*?)\s*```', r'```\s*(.*?)\s*```']:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                continue

    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    return {'raw_response': text, 'parse_error': True}