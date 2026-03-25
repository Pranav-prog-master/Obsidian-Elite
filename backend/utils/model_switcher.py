"""
EduMentor AI — Live Model Switcher
Lets the team switch between free OpenRouter models instantly during the hackathon demo
without restarting the server.

Endpoints:
  POST /admin/switch-model   — switch to a different free model
  GET  /admin/current-model  — see which model is currently active
"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Admin"])

# All always-free models available on OpenRouter
FREE_MODELS: dict = {
    "gemma":   "google/gemma-2-9b-it:free",
    "mistral": "mistralai/mistral-7b-instruct:free",
    "llama":   "meta-llama/llama-3.1-8b-instruct:free",
    "phi":     "microsoft/phi-3-mini-128k-instruct:free",
    "gemma2":  "google/gemma-2-27b-it:free",
}


class SwitchModelRequest(BaseModel):
    model_name: str


@router.post("/switch-model", summary="Switch the active AI model without restarting the server")
def switch_model(body: SwitchModelRequest):
    model_key = body.model_name.strip().lower()

    if model_key not in FREE_MODELS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unknown model name '{model_key}'. "
                f"Available options: {list(FREE_MODELS.keys())}"
            ),
        )

    # Import here to avoid circular import at module load time
    from services.claude_service import claude_service

    old_model = claude_service.primary_model
    new_model = FREE_MODELS[model_key]

    # Update both the runtime attribute and the environment variable
    claude_service.primary_model = new_model
    os.environ["AI_MODEL_PRIMARY"] = new_model

    print(f"  [ModelSwitcher] Switched primary model: {old_model} → {new_model}")

    return {
        "message": "Model switched successfully",
        "old_model": old_model,
        "new_model": new_model,
        "available_models": FREE_MODELS,
    }


@router.get("/current-model", summary="See which AI model is currently active")
def current_model():
    from services.claude_service import claude_service

    return {
        "primary_model": claude_service.primary_model,
        "backup_model":  claude_service.backup_model,
        "provider":      os.getenv("AI_PROVIDER", "openrouter"),
        "available_models": FREE_MODELS,
    }
