from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    sender: str = Field(..., description="'user' or 'ai'")
    text: str = Field(...)
    time: Optional[str] = None


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    mode: str = Field(default="general", description="'general', 'creative', 'coder', 'translator'")
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    history: Optional[List[Dict[str, Any]]] = Field(default_factory=list)


class AIChatResponse(BaseModel):
    success: bool = True
    reply: str
    mode: str
    suggested_replies: List[str] = Field(default_factory=list)
    timestamp: str
    model_version: str = "Nexoria Quantum Neural v2.4 Ultra"


class AIPromptSuggestRequest(BaseModel):
    mode: str = "general"


class AIPromptSuggestResponse(BaseModel):
    success: bool = True
    mode: str
    prompts: List[Dict[str, str]]
