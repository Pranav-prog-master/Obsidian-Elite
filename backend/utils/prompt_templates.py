# These prompts work with any AI provider including OpenRouter, Groq, and Anthropic.
# The claude_service.py handles which AI provider is actually called.


def get_quiz_prompt(notes_text: str, difficulty: str = "medium") -> dict:
    difficulty_instructions = {
        "easy": (
            "Difficulty level: EASY. "
            "Questions must test basic definitions and factual recall only. "
            "Each question should have one obviously correct answer and three clearly wrong distractors. "
            "Use simple, direct language."
        ),
        "medium": (
            "Difficulty level: MEDIUM. "
            "Questions must test understanding and application of concepts, not just recall. "
            "All four options should be plausible, but only one is clearly the best answer. "
            "Include questions that require the student to apply or connect ideas."
        ),
        "hard": (
            "Difficulty level: HARD. "
            "Questions must test analysis, problem-solving, and deep conceptual understanding. "
            "All four options must seem highly plausible to a student who has only surface knowledge. "
            "Only a student who truly understands the concept can identify the single correct answer. "
            "Include tricky edge cases, exceptions, and multi-step reasoning."
        ),
    }

    return {
        "system": (
            "You are an expert exam question setter for Indian competitive exams like JEE, NEET, and UPSC. "
            "You only return valid JSON and nothing else. No markdown, no code fences, no explanation."
        ),
        "user": (
            f"Read the following study notes carefully and generate exactly 10 multiple choice questions.\n\n"
            f"{difficulty_instructions.get(difficulty, difficulty_instructions['medium'])}\n\n"
            f"Notes:\n{notes_text}\n\n"
            "Return ONLY a raw JSON array of exactly 10 objects. Each object must have these exact keys:\n"
            "  question       — the MCQ question text\n"
            "  option_a       — first option\n"
            "  option_b       — second option\n"
            "  option_c       — third option\n"
            "  option_d       — fourth option\n"
            "  correct_option — must be exactly one of: a, b, c, or d (lowercase single letter)\n"
            "  explanation    — one sentence explaining why the correct answer is right\n\n"
            "Output rules: No markdown. No code fences. No extra text before or after. Only the raw JSON array."
        ),
    }


def get_doubt_prompt(question: str) -> dict:
    return {
        "system": (
            "You are a friendly and patient tutor helping a student understand concepts. "
            "Always explain in simple language suitable for a high school or college student in India. "
            "You always structure your answers using the exact four section headings provided."
        ),
        "user": (
            f"Answer the following student question using exactly these four sections with bold headings.\n\n"
            "**Direct Answer:** Answer the question in 2 to 3 sentences directly and clearly.\n\n"
            "**Simple Explanation:** Break it down simply in 3 to 4 sentences as if explaining to a 16-year-old "
            "who is hearing this concept for the first time.\n\n"
            "**Real Life Example:** Give one relatable real-life example from daily life in India "
            "(use familiar things like chai, cricket, trains, markets, etc.).\n\n"
            "**Quick Tip:** One sentence memory trick or shortcut to remember this concept easily for exams.\n\n"
            "Keep the total response under 200 words. Use the exact bold headings above.\n\n"
            f"Student's question: {question}"
        ),
    }


def get_explanation_prompt(topic: str, context: str) -> dict:
    return {
        "system": (
            "You are an expert teacher who explains complex topics in a clear, structured way. "
            "You always use the exact section headings provided and keep explanations concise and exam-focused."
        ),
        "user": (
            f"Explain the topic '{topic}' using the context from the student's own notes provided below.\n\n"
            f"Context from student's notes:\n{context}\n\n"
            "Structure your explanation using exactly these six sections with bold headings:\n\n"
            "**What Is It:** Write 2 to 3 sentences giving a clear, simple overview of the topic.\n\n"
            "**Why It Matters:** Write one sentence on the real-world relevance or application of this topic.\n\n"
            "**Key Points:** Write exactly 4 bullet points covering the most important things to know.\n\n"
            "**Step By Step:** Explain how it works in numbered steps. Maximum 5 steps. Be specific.\n\n"
            "**Visual Description:** Describe a simple diagram or mental image that helps visualize this concept. "
            "Use words only — for example: 'Imagine a circle with arrows pointing outward' or "
            "'Picture a table with two columns'. Keep this under 50 words.\n\n"
            "**Exam Tip:** Write one sentence on what examiners commonly ask about this topic in JEE, NEET, or UPSC.\n\n"
            "Keep the total response under 400 words. Use the exact bold headings above."
        ),
    }
