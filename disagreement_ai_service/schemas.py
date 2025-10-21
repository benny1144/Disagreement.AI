from pydantic import BaseModel
from typing import List


class ChatMessage(BaseModel):
    role: str  # "user", "assistant", or "system"
    content: str


class MediationRequest(BaseModel):
    chat_history: List[ChatMessage]
    dispute_context: str  # A summary of the dispute so far


class MediationResponse(BaseModel):
    response_message: str
    updated_context: str
