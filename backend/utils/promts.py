parse_resume_prompt = """
You are a strict resume parser. 

Your ONLY task:
- Read the given resume text.
- Extract the required fields exactly as specified.
- Return a single valid JSON object, with no extra text, comments, or explanations.

Required JSON schema:
{{
    "name": "string",
    "experience_years": "string",
    "skills": ["string", "string", ...],
    "roles": ["string", "string", ...],
    "education": ["string", "string", ...],
    "email": "string",
    "summary": "string",
    "projects": [
        {{  
            "name": "string",
            "technology": "string",
            "description": "string"
        }},
        ...
    ]
}}

Rules:
1. Do not add any keys other than those in the schema.
2. Do not include text outside the JSON object.
3. If a field is missing in the resume, output an empty string "" for strings, an empty array [] for lists.
4. Do not explain your reasoning — output only the JSON.

Resume Text:
{resume_text}
"""


questions_promt  = """
You are an interview question generator.
Given the candidate's parsed resume text, generate exactly {num_questions} multiple-choice  {difficulty_level} level interview questions.

Return the result strictly in this Python dictionary format:
{{
    "questions": [
        {{
            "question": "<question 1>",
            "options": ["<option A>", "<option B>", "<option C>", "<option D>"]
            "correct_option": "index of correct option"
            "explanation: "<explanation>"
        }},
        {{
            "question": "<question 2>",
            "options": ["<option A>", "<option B>", "<option C>", "<option D>"]
            "correct_option": "index of correct option"
            "explanation": "<explanation>"
        }},
        ...
    ],
}}

Rules:
- The "answers" list must contain only the exact text of the correct option (must match one option exactly).
- Do not include any text outside the dictionary.
- Ensure the dictionary is valid Python syntax and can be parsed with ast.literal_eval().
Resume:
{resume_text}
"""
