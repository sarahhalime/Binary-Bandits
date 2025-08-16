import os
import json
from typing import Dict, Any
import openai
import google.generativeai as genai
import groq

def analyze_and_reply(text: str) -> Dict[str, Any]:
    """
    Analyze journal text and provide supportive reply using configured AI provider.
    
    Args:
        text: The journal entry text to analyze
        
    Returns:
        Dict with emotion, intensity, risk, summary, reply, micro_action, and crisis_resources
    """
    ai_provider = os.getenv('AI_PROVIDER', 'groq').lower()
    
    if ai_provider == 'groq':
        return _analyze_with_groq(text)
    elif ai_provider == 'openai':
        return _analyze_with_openai(text)
    elif ai_provider == 'gemini':
        return _analyze_with_gemini(text)
    else:
        # Fallback response
        return _get_fallback_response(text)

def _analyze_with_groq(text: str) -> Dict[str, Any]:
    """Analyze using Groq LLM"""
    api_key = os.getenv('GROQ_API')
    if not api_key:
        return _get_fallback_response(text)
    
    client = groq.Groq(api_key=api_key)
    
    system_prompt = """Role: You are a warm, supportive, non-clinical journaling companion.
Goals: (1) Validate feelings succinctly, (2) Name primary emotion, (3) Offer ONE small actionable step.
Constraints:
  - No diagnosis or medical claims.
  - Keep replies short (2–5 sentences).
  - If self-harm/suicidal intent or acute crisis is detected: risk="crisis", intensity=5; reply with 2–3 short supportive lines and crisis resources; include a grounding micro_action (e.g., 'breathing' 60s).
Output JSON ONLY with keys:
  emotion, intensity (1-5), risk (none|low|elevated|crisis), summary, reply,
  micro_action { type, duration_sec },
  crisis_resources (optional array of { label, url, region })"""

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        content = response.choices[0].message.content.strip()
        # Try to parse JSON response
        try:
            result = json.loads(content)
            return _validate_ai_response(result)
        except json.JSONDecodeError:
            # If JSON parsing fails, create structured response
            return _create_structured_response(content, text)
            
    except Exception as e:
        print(f"Groq API error: {e}")
        return _get_fallback_response(text)

def _analyze_with_openai(text: str) -> Dict[str, Any]:
    """Analyze using OpenAI GPT-4o-mini"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        return _get_fallback_response(text)
    
    client = openai.OpenAI(api_key=api_key)
    
    system_prompt = """Role: You are a warm, supportive, non-clinical journaling companion.
Goals: (1) Validate feelings succinctly, (2) Name primary emotion, (3) Offer ONE small actionable step.
Constraints:
  - No diagnosis or medical claims.
  - Keep replies short (2–5 sentences).
  - If self-harm/suicidal intent or acute crisis is detected: risk="crisis", intensity=5; reply with 2–3 short supportive lines and crisis resources; include a grounding micro_action (e.g., 'breathing' 60s).
Output JSON ONLY with keys:
  emotion, intensity (1-5), risk (none|low|elevated|crisis), summary, reply,
  micro_action { type, duration_sec },
  crisis_resources (optional array of { label, url, region })"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        content = response.choices[0].message.content.strip()
        # Try to parse JSON response
        try:
            result = json.loads(content)
            return _validate_ai_response(result)
        except json.JSONDecodeError:
            # If JSON parsing fails, create structured response
            return _create_structured_response(content, text)
            
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return _get_fallback_response(text)

def _analyze_with_gemini(text: str) -> Dict[str, Any]:
    """Analyze using Google Gemini"""
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return _get_fallback_response(text)
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    system_prompt = """Role: You are a warm, supportive, non-clinical journaling companion.
Goals: (1) Validate feelings succinctly, (2) Name primary emotion, (3) Offer ONE small actionable step.
Constraints:
  - No diagnosis or medical claims.
  - Keep replies short (2–5 sentences).
  - If self-harm/suicidal intent or acute crisis is detected: risk="crisis", intensity=5; reply with 2–3 short supportive lines and crisis resources; include a grounding micro_action (e.g., 'breathing' 60s).
Output JSON ONLY with keys:
  emotion, intensity (1-5), risk (none|low|elevated|crisis), summary, reply,
  micro_action { type, duration_sec },
  crisis_resources (optional array of { label, url, region })"""

    try:
        response = model.generate_content(f"{system_prompt}\n\nUser entry: {text}")
        content = response.text.strip()
        
        # Clean up markdown code blocks if present
        if '```json' in content:
            # Extract JSON from markdown code blocks
            start = content.find('```json') + 7
            end = content.find('```', start)
            if end != -1:
                content = content[start:end].strip()
        elif '```' in content:
            # Extract content from regular code blocks
            start = content.find('```') + 3
            end = content.find('```', start)
            if end != -1:
                content = content[start:end].strip()
        
        # Try to parse JSON response
        try:
            result = json.loads(content)
            return _validate_ai_response(result)
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Content: {content}")
            # If JSON parsing fails, create structured response
            return _create_structured_response(content, text)
            
    except Exception as e:
        print(f"Gemini API error: {e}")
        return _get_fallback_response(text)

def _validate_ai_response(result: Dict[str, Any]) -> Dict[str, Any]:
    """Validate and ensure all required fields are present"""
    required_fields = ['emotion', 'intensity', 'risk', 'summary', 'reply', 'micro_action']
    
    # Ensure all required fields exist
    for field in required_fields:
        if field not in result:
            if field == 'micro_action':
                result[field] = {'type': 'breathing', 'duration_sec': 60}
            elif field == 'intensity':
                result[field] = 3
            elif field == 'risk':
                result[field] = 'none'
            else:
                result[field] = 'Not specified'
    
    # Validate intensity range
    if not isinstance(result['intensity'], int) or result['intensity'] < 1 or result['intensity'] > 5:
        result['intensity'] = 3
    
    # Validate risk values
    valid_risks = ['none', 'low', 'elevated', 'crisis']
    if result['risk'] not in valid_risks:
        result['risk'] = 'none'
    
    # Ensure micro_action has required fields
    if not isinstance(result['micro_action'], dict):
        result['micro_action'] = {'type': 'breathing', 'duration_sec': 60}
    elif 'type' not in result['micro_action'] or 'duration_sec' not in result['micro_action']:
        result['micro_action'] = {'type': 'breathing', 'duration_sec': 60}
    
    return result

def _create_structured_response(content: str, original_text: str) -> Dict[str, Any]:
    """Create structured response when AI doesn't return valid JSON"""
    # Simple emotion detection
    text_lower = original_text.lower()
    if any(word in text_lower for word in ['sad', 'depressed', 'down', 'hopeless']):
        emotion = 'sad'
        intensity = 4
    elif any(word in text_lower for word in ['anxious', 'worried', 'nervous', 'stress']):
        emotion = 'anxious'
        intensity = 3
    elif any(word in text_lower for word in ['angry', 'frustrated', 'mad']):
        emotion = 'angry'
        intensity = 3
    elif any(word in text_lower for word in ['happy', 'joy', 'excited']):
        emotion = 'happy'
        intensity = 2
    else:
        emotion = 'neutral'
        intensity = 2
    
    return {
        'emotion': emotion,
        'intensity': intensity,
        'risk': 'none',
        'summary': 'Journal entry processed',
        'reply': content[:200] + '...' if len(content) > 200 else content,
        'micro_action': {'type': 'breathing', 'duration_sec': 60},
        'crisis_resources': []
    }

def _get_fallback_response(text: str) -> Dict[str, Any]:
    """Fallback response when AI services are unavailable"""
    return {
        'emotion': 'neutral',
        'intensity': 3,
        'risk': 'none',
        'summary': 'Thank you for sharing your thoughts',
        'reply': 'I hear you. Taking time to reflect is important. Consider taking a few deep breaths to ground yourself.',
        'micro_action': {'type': 'breathing', 'duration_sec': 60},
        'crisis_resources': []
    }
