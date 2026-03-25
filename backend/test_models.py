from dotenv import load_dotenv
load_dotenv()
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

MODELS = [
    "meta-llama/llama-3.1-8b-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free",
    "deepseek/deepseek-r1-0528:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "mistralai/mistral-small-3.2-24b-instruct:free",
    "qwen/qwen3-8b:free",
    "qwen/qwen3-14b:free",
    "google/gemma-3-12b-it:free",
    "google/gemma-3n-e4b-it:free",
    "nousresearch/hermes-3-llama-3.1-8b:free",
    "openchat/openchat-7b:free",
]

print("Testing free models on OpenRouter...")
print("-" * 55)
working = []

for model in MODELS:
    try:
        r = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Say OK"}],
            max_tokens=5,
            extra_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "EduMentor AI"
            }
        )
        reply = (r.choices[0].message.content or "").strip()[:20]
        print(f"  WORKS   {model}  -> {reply}")
        working.append(model)
    except Exception as e:
        print(f"  FAILED  {model}")
        print(f"          {str(e)[:80]}")

print()
print("=" * 55)
if working:
    print(f"WORKING MODELS ({len(working)} found):")
    for m in working:
        print(f"  {m}")
    print()
    print(f"Set in your .env:")
    print(f"  AI_MODEL_PRIMARY={working[0]}")
    print(f"  AI_MODEL_BACKUP={working[1] if len(working) > 1 else working[0]}")
else:
    print("NO WORKING MODELS FOUND.")
    print("Check your OPENROUTER_API_KEY at https://openrouter.ai/keys")
print("=" * 55)
