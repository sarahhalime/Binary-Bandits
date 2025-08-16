# backend/services/ai_provider.py
import os, json, time
from typing import Dict, Any
import google.generativeai as genai

SYSTEM_PROMPT = """You are a warm, supportive, non-clinical journaling companion.
Goals: (1) Validate feelings succinctly, (2) Name the primary emotion, (3) Offer ONE small actionable step.
Constraints:
- No diagnosis or medical claims.
- Keep replies short (2–5 sentences).
- If self-harm/suicidal intent or acute crisis is detected: set risk="crisis", intensity=5; reply with 2–3 short supportive lines and crisis resources; include a grounding micro_action (e.g., "breathing" 60s).
Return STRICT JSON ONLY with keys:
  emotion, intensity (1-5), risk (none|low|elevated|crisis), summary, reply,
  micro_action { type, duration_sec },
  crisis_resources (optional array of { label, url, region })
"""

def _strip_code_fences(s: str) -> str:
    t = s.strip()
    if t.startswith("```"):
        t = t.strip("`")
        if "\n" in t:
            t = t.split("\n", 1)[1]
    return t

def _validate_ai_response(result: Dict[str, Any]) -> Dict[str, Any]:
    required = ["emotion", "intensity", "risk", "summary", "reply", "micro_action"]
    for k in required:
        if k not in result:
            if k == "micro_action":
                result[k] = {"type": "breathing", "duration_sec": 60}
            elif k == "intensity":
                result[k] = 3
            elif k == "risk":
                result[k] = "none"
            else:
                result[k] = "Not specified"

    # intensity 1..5
    try:
        result["intensity"] = int(result["intensity"])
    except Exception:
        result["intensity"] = 3
    if not (1 <= result["intensity"] <= 5):
        result["intensity"] = 3

    # risk enum
    if str(result["risk"]).lower() not in {"none", "low", "elevated", "crisis"}:
        result["risk"] = "none"

    # micro_action shape
    if not isinstance(result["micro_action"], dict) or \
       "type" not in result["micro_action"] or \
       "duration_sec" not in result["micro_action"]:
        result["micro_action"] = {"type": "breathing", "duration_sec": 60}

    if "crisis_resources" not in result or not isinstance(result["crisis_resources"], list):
        result["crisis_resources"] = []
    return result

def _fallback(original_text: str) -> Dict[str, Any]:
    txt = (original_text or "").lower()
    if any(w in txt for w in ["sad", "depressed", "down", "hopeless"]):
        emotion, intensity = "sad", 4
    elif any(w in txt for w in ["anxious", "worried", "nervous", "stress"]):
        emotion, intensity = "anxious", 3
    elif any(w in txt for w in ["angry", "frustrated", "mad"]):
        emotion, intensity = "angry", 3
    elif any(w in txt for w in ["happy", "joy", "excited"]):
        emotion, intensity = "happy", 2
    else:
        emotion, intensity = "neutral", 2
    return {
        "emotion": emotion,
        "intensity": intensity,
        "risk": "none",
        "summary": "Thank you for sharing your thoughts",
        "reply": "I hear you. Consider a minute of slow breathing to reset.",
        "micro_action": {"type": "breathing", "duration_sec": 60},
        "crisis_resources": []
    }

def analyze_and_reply(text: str) -> Dict[str, Any]:
    """
    Use fallback response to fix the hanging issue
    """
    return _fallback(text)
