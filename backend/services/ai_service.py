import google.generativeai as genai
import os
from datetime import datetime
import re

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Initialize the model
model = genai.GenerativeModel('gemini-pro')

# Crisis detection keywords
CRISIS_KEYWORDS = [
    'suicide', 'kill myself', 'want to die', 'end it all', 'no reason to live',
    'better off dead', 'hurt myself', 'self harm', 'cutting', 'overdose',
    'hopeless', 'helpless', 'worthless', 'burden', 'everyone would be better off'
]

# Crisis hotline information
CRISIS_RESOURCES = {
    'message': 'If you\'re having thoughts of self-harm or suicide, please know that help is available 24/7:',
    'resources': [
        'National Suicide Prevention Lifeline (US): 988 or 1-800-273-8255',
        'Crisis Text Line: Text HOME to 741741',
        'Emergency Services: 911',
        'Your local mental health crisis line'
    ]
}

def detect_crisis(content):
    """Detect crisis indicators in text"""
    content_lower = content.lower()
    
    for keyword in CRISIS_KEYWORDS:
        if keyword in content_lower:
            return True
    
    return False

def get_ai_response(content, mood='', user_id=None):
    """Generate empathetic AI response for journal entry"""
    try:
        # Check for crisis indicators first
        if detect_crisis(content):
            return {
                'response': CRISIS_RESOURCES['message'],
                'resources': CRISIS_RESOURCES['resources'],
                'is_crisis': True,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        # Create context-aware prompt
        prompt = create_therapy_prompt(content, mood)
        
        # Generate response
        response = model.generate_content(prompt)
        
        # Clean and format response
        ai_response = clean_response(response.text)
        
        return {
            'response': ai_response,
            'is_crisis': False,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        # Fallback response if AI fails
        return {
            'response': "Thank you for sharing your thoughts. I'm here to listen and support you. Remember that your feelings are valid and it's okay to not be okay sometimes.",
            'is_crisis': False,
            'timestamp': datetime.utcnow().isoformat(),
            'error': str(e)
        }

def create_therapy_prompt(content, mood):
    """Create a therapeutic prompt for the AI"""
    
    base_prompt = f"""
You are a compassionate, empathetic AI therapist assistant. Your role is to provide supportive, understanding responses to people's journal entries.

IMPORTANT GUIDELINES:
- Be warm, empathetic, and non-judgmental
- Acknowledge and validate feelings
- Offer gentle insights and perspectives
- Keep responses concise (2-3 sentences)
- Never give medical advice
- If you detect crisis indicators, immediately provide crisis resources
- Focus on emotional support and gentle encouragement

User's current mood: {mood if mood else 'Not specified'}
Journal entry: "{content}"

Please provide a supportive, empathetic response that:
1. Acknowledges their feelings
2. Shows understanding and validation
3. Offers gentle encouragement or perspective
4. Keeps the tone warm and supportive

Response:"""

    return base_prompt

def clean_response(response_text):
    """Clean and format AI response"""
    # Remove any markdown formatting
    cleaned = re.sub(r'\*\*(.*?)\*\*', r'\1', response_text)
    cleaned = re.sub(r'\*(.*?)\*', r'\1', cleaned)
    cleaned = re.sub(r'`(.*?)`', r'\1', cleaned)
    
    # Remove extra whitespace
    cleaned = re.sub(r'\n+', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = cleaned.strip()
    
    return cleaned

def analyze_sentiment(content):
    """Analyze sentiment of text content"""
    try:
        prompt = f"""
Analyze the sentiment of this text and provide a brief assessment:

Text: "{content}"

Please provide:
1. Overall sentiment (positive, negative, neutral, mixed)
2. Emotional intensity (1-10 scale)
3. Key emotions detected
4. Brief explanation

Format as JSON:
{{
    "sentiment": "positive/negative/neutral/mixed",
    "intensity": 1-10,
    "emotions": ["emotion1", "emotion2"],
    "explanation": "brief explanation"
}}
"""
        
        response = model.generate_content(prompt)
        
        # Try to parse JSON response
        import json
        try:
            result = json.loads(response.text)
            return result
        except:
            # Fallback if JSON parsing fails
            return {
                'sentiment': 'neutral',
                'intensity': 5,
                'emotions': ['neutral'],
                'explanation': 'Unable to analyze sentiment'
            }
            
    except Exception as e:
        return {
            'sentiment': 'neutral',
            'intensity': 5,
            'emotions': ['neutral'],
            'explanation': f'Error analyzing sentiment: {str(e)}'
        }

def generate_activity_suggestions(mood, intensity=5):
    """Generate activity suggestions based on mood"""
    try:
        prompt = f"""
Based on the user's mood and intensity, suggest 3-5 short, simple activities that could help:

Mood: {mood}
Intensity: {intensity}/10

Please suggest activities that are:
- Quick (5-15 minutes)
- Easy to do
- Appropriate for the mood
- Supportive of mental health

Format as JSON:
{{
    "activities": [
        {{
            "name": "Activity name",
            "description": "Brief description",
            "duration": "5-15 minutes",
            "benefit": "How it helps"
        }}
    ]
}}
"""
        
        response = model.generate_content(prompt)
        
        import json
        try:
            result = json.loads(response.text)
            return result.get('activities', [])
        except:
            # Fallback suggestions
            return get_fallback_activities(mood)
            
    except Exception as e:
        return get_fallback_activities(mood)

def get_fallback_activities(mood):
    """Fallback activity suggestions"""
    mood_lower = mood.lower()
    
    if any(word in mood_lower for word in ['sad', 'depressed', 'down', 'blue']):
        return [
            {
                'name': 'Deep Breathing',
                'description': 'Take 10 slow, deep breaths',
                'duration': '2-3 minutes',
                'benefit': 'Calms the nervous system'
            },
            {
                'name': 'Gentle Stretch',
                'description': 'Simple stretching exercises',
                'duration': '5 minutes',
                'benefit': 'Releases tension and improves mood'
            },
            {
                'name': 'Write Gratitude',
                'description': 'Write down 3 things you\'re grateful for',
                'duration': '5 minutes',
                'benefit': 'Shifts focus to positive aspects'
            }
        ]
    elif any(word in mood_lower for word in ['anxious', 'worried', 'stressed']):
        return [
            {
                'name': 'Box Breathing',
                'description': 'Breathe in for 4, hold for 4, out for 4, hold for 4',
                'duration': '3-5 minutes',
                'benefit': 'Reduces anxiety and stress'
            },
            {
                'name': 'Progressive Relaxation',
                'description': 'Tense and relax each muscle group',
                'duration': '10 minutes',
                'benefit': 'Releases physical tension'
            },
            {
                'name': 'Mindful Walking',
                'description': 'Walk slowly and notice your surroundings',
                'duration': '10 minutes',
                'benefit': 'Grounds you in the present moment'
            }
        ]
    else:
        return [
            {
                'name': 'Quick Meditation',
                'description': 'Sit quietly and focus on your breath',
                'duration': '5 minutes',
                'benefit': 'Centers and calms the mind'
            },
            {
                'name': 'Light Exercise',
                'description': 'Simple movements like walking or stretching',
                'duration': '10 minutes',
                'benefit': 'Boosts mood and energy'
            },
            {
                'name': 'Creative Expression',
                'description': 'Draw, write, or create something',
                'duration': '10-15 minutes',
                'benefit': 'Provides emotional outlet'
            }
        ]
