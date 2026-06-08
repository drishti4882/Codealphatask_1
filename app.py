from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import main
from database_manager import DatabaseManager
import os
import pandas as pd
import json

# Master Unified Server
app = Flask(__name__, static_folder='dist', static_url_path='')

# PERMANENT FIX: Full permissive CORS for local development ports
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5000", "http://127.0.0.1:5000"]}})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve React frontend assets or index.html for routing."""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Verify backend is alive."""
    return jsonify({"status": "healthy", "engine": "Mining-v2"})

@app.route('/api/mine', methods=['POST', 'OPTIONS'])
def run_mining():
    """Execute the full data mining pipeline."""
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
        
    try:
        print(">> [EXECUTE] Mining Pipeline Triggered via API")
        main.run_pipeline()
        print(">> [SUCCESS] Pipeline execution finished")
        return jsonify({"status": "success", "message": "Mining Complete"})
    except Exception as e:
        error_msg = str(e)
        print(f"!! [ERROR] {error_msg}")
        return jsonify({"status": "error", "message": error_msg}), 500

@app.route('/api/results', methods=['GET'])
def get_results():
    """Fetch mined results from MongoDB or CSV fallback."""
    print(">> [FETCH] Request for latest results")
    try:
        db = DatabaseManager()
        db.connect()
        if db.db is not None:
            cursor = db.db["mining_results"].find().sort("Date", -1).limit(500)
            results = list(cursor)
            for r in results:
                if '_id' in r: r['_id'] = str(r['_id'])
            db.disconnect()
            return jsonify(results)
        raise Exception("Database offline")
    except Exception as e:
        print(f">> [FALLBACK] Database offline, reading CSV: {e}")
        if os.path.exists("results_for_powerbi.csv"):
            df = pd.read_csv("results_for_powerbi.csv")
            return jsonify(json.loads(df.to_json(orient='records')))
        return jsonify([])

@app.errorhandler(404)
def not_found(e):
    """Catch-all to serve index.html for client-side routing."""
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Use the port assigned by the cloud provider (Render) or default to 5000
    port = int(os.environ.get("PORT", 5000))
    print(f">> Unified Server starting on port {port}")
    app.run(host='0.0.0.0', port=port)
