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

questions_prompt = """
You are an interview question generator.

Inputs you receive:
- Candidate's resume text
- Target company
- Job description
- Test type (e.g., technical, behavioral, case study, coding)
- Difficulty level (easy, medium, hard)
- Number of questions

Your task:
Generate exactly {num_questions} {difficulty_level}-level multiple-choice interview questions
tailored to the candidate, the company, and the job description.

Rules for question generation:
- Mix questions from **skills, projects, and core concepts** (don’t only focus on projects).
- Ensure questions match the **test-type**:
  - "technical": focus on algorithms, ML/DL/NLP, databases, or system design (based on resume & JD).
  - "behavioral": focus on teamwork, problem-solving, leadership.
  - "case study": focus on scenario-based problem solving.
- Company-specific twist: If the target company is known for something (e.g., FAANG → scalability, startups → hands-on ML), reflect that in the questions.
- Skills mentioned in the resume **must appear in at least 40% of the questions**.
- The "answers" list must contain only the exact text of the correct option (must match one option exactly).
- Do not include any text outside the dictionary.
- Ensure the dictionary is valid Python syntax and can be parsed with ast.literal_eval().

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

Candidate Resume:
{resume_text}

Target Company:
{target_companies}

Job Description:
{interview_description}

Test Type:
{interview_type}
"""
