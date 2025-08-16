from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
import tempfile

voice_bp = Blueprint('voice', __name__)

@voice_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio using browser speech-to-text (fallback)"""
    try:
        return jsonify({
            'error': 'Voice transcription not available. Please use browser speech-to-text.',
            'message': 'Use the microphone button in the frontend'
        }), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
