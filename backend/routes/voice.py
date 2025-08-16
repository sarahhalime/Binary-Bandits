from flask import Blueprint, request, jsonify
import os
import openai
from werkzeug.utils import secure_filename
import tempfile

voice_bp = Blueprint('voice', __name__)

@voice_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio using OpenAI Whisper"""
    try:
        # Check if OpenAI API key is available
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return jsonify({
                'error': 'OpenAI API key not configured. Please use browser speech-to-text instead.',
                'message': 'Voice transcription requires OpenAI API key'
            }), 400
        
        # Check if audio file is present
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'No audio file selected'}), 400
        
        # Validate file type
        allowed_extensions = {'wav', 'mp3', 'm4a', 'webm', 'ogg'}
        if not audio_file.filename.lower().endswith(tuple(allowed_extensions)):
            return jsonify({'error': 'Invalid file type. Supported: wav, mp3, m4a, webm, ogg'}), 400
        
        # Save audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            # Initialize OpenAI client
            client = openai.OpenAI(api_key=api_key)
            
            # Transcribe audio
            with open(temp_file_path, 'rb') as audio:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio,
                    response_format="text"
                )
            
            return jsonify({
                'transcript': transcript,
                'success': True
            }), 200
            
        except Exception as e:
            return jsonify({
                'error': f'Transcription failed: {str(e)}',
                'message': 'Please try again or use browser speech-to-text'
            }), 500
        
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
