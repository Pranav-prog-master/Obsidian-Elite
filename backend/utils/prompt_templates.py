"""Prompt templates for Claude API calls"""

QUIZ_GENERATION_PROMPT = """You are an expert exam question setter. Given the following study notes, generate exactly 10 multiple choice questions.

Return ONLY a valid JSON array where each object has these exact fields:
- question: the MCQ question text
- option_a: first option
- option_b: second option
- option_c: third option
- option_d: fourth option
- correct_option: single letter (a, b, c, or d)
- explanation: explanation of why the correct answer is right
- topic: the topic/concept this question tests

Do not include any markdown formatting, code blocks, or explanatory text. Only return the raw JSON array.

Study notes:
{notes_text}"""

DOUBT_SOLVING_PROMPT = """You are a friendly and knowledgeable tutor helping a student understand a concept.

Answer the following question in simple, easy-to-understand language. Include ONE real-life example or analogy. Keep your answer under 150 words.

Student's question: {student_question}

Provide your answer directly without any preamble."""

CONCEPT_EXPLANATION_PROMPT = """You are an expert educator explaining concepts clearly to students.

Explain the following topic based on the provided context material. Structure your explanation with:
1. What is it? (simple definition)
2. Key points (2-3 main ideas)
3. Why does it matter? (real-world application)
4. One real-life example

Topic: {topic}
Context material: {context}

Keep the explanation under 300 words and use simple language."""

STUDY_PLAN_GENERATION_PROMPT = """You are an expert study planner helping a student prepare for an exam.

Create a personalized day-by-day study plan. Return ONLY a valid JSON array where each object has:
- date: date in YYYY-MM-DD format
- subject: subject name
- topic: specific topic to study
- duration_minutes: recommended study time in minutes
- task_type: "read", "practice", or "revise"

Rules:
- Allocate MORE time (60-90 min) to weak topics
- Allocate MEDIUM time (45-60 min) to normal topics
- Allocate LESS time (30-45 min) to strong topics
- Ensure good break distribution (1000-1800 in mornings, 2000-2200 in evenings)
- Today's date: {today_date}
- Plan until: {exam_date}
- Student can study: {daily_hours} hours per day

Subjects to study: {subjects}
Weak topics (priority): {weak_topics}

Return ONLY the raw JSON array without any markdown or explanation."""
