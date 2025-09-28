parse_resume_prompt = """
You are a strict resume parser. 

Your ONLY task:
- Read the given resume text.
- Extract the required fields exactly as specified.

### Output Format (JSON):
{format_instructions}

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
  - "Appitude": focus on general knowledge and aptitude.
   ....
- Company-specific twist: If the target company is known for something (e.g., FAANG → scalability, startups → hands-on ML), reflect that in the questions.
- Skills mentioned in the resume **must appear in at least 40% of the questions if test type is "technical"**.
- The "answers" list must contain only the exact text of the correct option (must match one option exactly).
- Do not include any text outside the dictionary.
- Ensure the dictionary is valid Python syntax and can be parsed with ast.literal_eval().

### Output Format (JSON):
{format_instructions}

Candidate Resume:
{resume_text}

Target Company:
{target_companies}

Job Description:
{interview_description}

Test Type:
{interview_type}
"""



mock_question_prompt = """
You are an expert interview coach and professional interviewer.  
Your task is to generate a set of mock interview questions and their ideal answers.  
The questions must be tailored to the candidate’s resume, the job description, and the interview type.

### Input Details:
- Number of questions: {num_questions}
- Difficulty level: {difficulty_level}   # easy, medium, hard
- Job description: {job_description}
- Interview type: {interview_type}       # behavioral, technical, coding, system design, HR, etc.
- Candidate resume text: {resume_text}   # includes skills, projects, experience

### Instructions:
1. Generate exactly {num_questions} interview questions.  
2. Questions must be relevant to the candidate’s resume and the job description.  
3. Ensure the tone and complexity of the questions match the given difficulty level.  
4. Each question must include:  
   - **Question:** (what the interviewer asks)  
   - **Expected Answer:** (a model/guideline of what a good answer should include, not a word-for-word response)  
5. For **behavioral interviews**, focus on STAR format (Situation, Task, Action, Result).  
6. For **technical/coding interviews**, include problem statements and concise solution explanations (not full code unless necessary).  
7. Keep answers clear, structured, and suitable for rating/scoring later.  

### Output Format (JSON):
{format_instructions}
"""
rating_prompt = """
You are an expert interview evaluator.  
Your task is to rate the candidate’s answer compared to the expected answer and question.
user is giving an interview he may give less detailed answer than expected but the main point is whether user is covering important points or not.
he will try to keep it concise by covering almost all aspects.

### Input
- Question: {question}  
- Expected Answer: {expected_answer}  
- Candidate Answer: {user_answer}  

### Evaluation Process
1. Extract key points from the expected answer.  
2. Check how many of those key points appear in the candidate's answer (paraphrases count).  
3. Rate strictly on coverage and correctness, not on length or polish.  
4. Give extra credit if the candidate includes real examples.  

### Rating Scale
- above 4.5 = Covers nearly all key points, accurate, with examples.  
- above 4 = Covers most key points, minor gaps.  
- above 3 = Covers some key points, but misses several.  
- less than 2.5 = Few key points, vague/unclear.  
- less than 1.5 = Barely relevant.  
- 0 = Wrong or no answer.  

### Output Format (JSON):
{format_instructions}
"""
