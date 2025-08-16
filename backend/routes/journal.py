from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import get_db
from services.ai_provider import analyze_and_reply
from datetime import datetime, timedelta
from bson import ObjectId

# Mounted at /api/journal in app.py
journal_bp = Blueprint('journal_bp', __name__)

# -------- Public (no auth) endpoints --------

@journal_bp.route('/', methods=['POST'])
@journal_bp.route('',  methods=['POST'])   # allow /api/journal (no trailing slash)
def create_journal_entry():
    """Create a new journal entry with AI analysis (public)."""
    try:
        data = request.get_json(silent=True) or {}
        if not data.get('text'):
            return jsonify({'error': 'Journal text is required'}), 400

        text = data['text']
        user_id = None  # public flow
        ai = analyze_and_reply(text)

        db = get_db()
        created_at = datetime.utcnow()

        if db is not None:
            doc = {'user_id': user_id, 'text': text, 'created_at': created_at, 'ai': ai}
            res = db.journal_entries.insert_one(doc)
            resp = {
                'id': str(res.inserted_id),
                'user_id': user_id,
                'text': text,
                'created_at': created_at.isoformat(),
                'ai': ai
            }
        else:
            resp = {
                'id': f"demo_{created_at.timestamp()}",
                'user_id': user_id,
                'text': text,
                'created_at': created_at.isoformat(),
                'ai': ai
            }
        return jsonify(resp), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/', methods=['GET'])
@journal_bp.route('',  methods=['GET'])    # allow /api/journal (no trailing slash)
def get_journal_entries():
    """Get latest public entries (no auth)."""
    try:
        limit = request.args.get('limit', 20, type=int)
        user_id = None

        db = get_db()
        if db is not None:
            entries = list(
                db.journal_entries
                .find({'user_id': user_id})
                .sort('created_at', -1)
                .limit(limit)
            )
            for e in entries:
                e['id'] = str(e['_id'])
                e['created_at'] = e['created_at'].isoformat()
                del e['_id']
        else:
            entries = [{
                'id': 'demo_entry_1',
                'text': 'Today I woke up feeling refreshed and calm.',
                'created_at': datetime.utcnow().isoformat(),
                'ai': {'emotion': 'calm', 'intensity': 2, 'risk': 'none',
                       'summary': 'Peaceful start',
                       'reply': "You're appreciating a mindful moment—nice.",
                       'micro_action': {'type': 'breathing', 'duration_sec': 60}}
            }]

        return jsonify({'entries': entries,
                        'pagination': {'page': 1, 'limit': limit,
                                       'total': len(entries), 'pages': 1}}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------- Legacy/JWT-protected endpoints (keep if you need auth flow) --------

@journal_bp.route('/entry', methods=['POST'])
@jwt_required()
def create_journal_entry_old():
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}
        if not data.get('content'):
            return jsonify({'error': 'Journal content is required'}), 400

        content = data['content']
        title = data.get('title', '')
        mood = data.get('mood', '')
        tags = data.get('tags', [])

        doc = {
            'user_id': ObjectId(user_id),
            'title': title,
            'content': content,
            'mood': mood,
            'tags': tags,
            'timestamp': datetime.utcnow(),
            'word_count': len(content.split()),
            'ai_response': None,
            'is_private': data.get('is_private', True),
        }
        db = get_db()
        res = db.journal_entries.insert_one(doc)
        return jsonify({
            'message': 'Journal entry created successfully',
            'entry': {
                'id': str(res.inserted_id),
                'title': title,
                'content': content,
                'timestamp': doc['timestamp'].isoformat(),
                'word_count': doc['word_count']
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/entries', methods=['GET'])
@jwt_required()
def get_journal_entries_old():
    try:
        user_id = get_jwt_identity()
        db = get_db()
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        skip = (page - 1) * limit

        entries = list(db.journal_entries.find(
            {'user_id': ObjectId(user_id)}
        ).sort('timestamp', -1).skip(skip).limit(limit))

        for e in entries:
            e['id'] = str(e['_id'])
            e['timestamp'] = e['timestamp'].isoformat()
            del e['_id']

        total = db.journal_entries.count_documents({'user_id': ObjectId(user_id)})
        return jsonify({'entries': entries,
                        'pagination': {'page': page, 'limit': limit,
                                       'total': total, 'pages': (total + limit - 1)//limit}}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/ai-response', methods=['POST'])
@jwt_required()
def get_ai_therapy_response():
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}
        if not data.get('content'):
            return jsonify({'error': 'Journal content is required'}), 400

        content = data['content']
        entry_id = data.get('entry_id')

        ai = analyze_and_reply(content)

        if entry_id:
            db = get_db()
            db.journal_entries.update_one(
                {'_id': ObjectId(entry_id), 'user_id': ObjectId(user_id)},
                {'$set': {'ai_response': ai}}
            )
        return jsonify({'ai_response': ai}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
