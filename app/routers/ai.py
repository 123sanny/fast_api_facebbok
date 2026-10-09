from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database import get_db
from schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIPromptSuggestRequest,
    AIPromptSuggestResponse
)
from services.ai_service import (
    generate_ai_response,
    get_mode_suggestions,
    MODE_PROMPTS
)

router = APIRouter(prefix="/api/v1/ai", tags=["Nexoria Quantum AI"])


@router.post("/chat", response_model=AIChatResponse)
def chat_with_quantum_ai(
    payload: AIChatRequest,
    db: Session = Depends(get_db)
):
    """
    Live interactive neural chat endpoint for Nexoria Quantum AI 2.0.
    Supports multi-turn context, specialized modes (general, creative, coder, translator),
    and user personalization.
    """
    try:
        result = generate_ai_response(
            message=payload.message,
            mode=payload.mode,
            user_id=payload.user_id,
            user_name=payload.user_name,
            history=payload.history,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Neural generation engine encountered an error: {str(e)}"
        )


@router.post("/suggest-prompts", response_model=AIPromptSuggestResponse)
def get_prompt_suggestions(payload: AIPromptSuggestRequest):
    """
    Retrieve quick starter suggestion prompts based on the active mode.
    """
    prompts = get_mode_suggestions(payload.mode)
    return {
        "success": True,
        "mode": payload.mode,
        "prompts": prompts
    }


@router.get("/modes")
def get_available_ai_modes():
    """
    List all active AI neural modes and capabilities.
    """
    return {
        "success": True,
        "modes": [
            {"id": "general", "label": "Quantum Co-Pilot", "description": "Social strategy, platform navigation & smart assistant"},
            {"id": "creative", "label": "Creative Writer", "description": "Viral hooks, high-converting captions & Reel scripts"},
            {"id": "coder", "label": "Code & Logic", "description": "Full-stack development, algorithms & architecture"},
            {"id": "translator", "label": "Polyglot 100+", "description": "Multi-language translation with cultural nuance"}
        ]
    }
