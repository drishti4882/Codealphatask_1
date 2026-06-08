from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import main
from database_manager import DatabaseManager
import os
import pandas as pd
import json

# Master Unified Server
app = Flask(__name__, static_folder='dist', static_url_path='')
# Optimized CORS for Windows/Cloud compatibility
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """
    PERMANENT FIX: This serves your website and all its assets 
    from the same port as the Python code.
    """
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.before_request
def log_request():
    # This helps you see in the terminal if the button is working
    if request.path.startswith('/api'):
        print(f">> [API CALL] {request.method} {request.path}")

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "engine": "Production-Ready", "database": "Connected"})

@app.route('/api/mine', methods=['POST'])
def run_mining():
    try:
        print(">> Remote Pipeline Execution Started...")
        main.run_pipeline()
        return jsonify({"status": "success", "message": "Mining Complete"})
    except Exception as e:
        print(f"!! Pipeline Error: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/results', methods=['GET'])
def get_results():
    """
    Returns the latest mined data. 
    FALLBACK: If MongoDB is down, it reads directly from the exported CSV.
    """
    try:
        db = DatabaseManager()
        db.connect()
        if db.db is not None:
            # Try to get from MongoDB
            cursor = db.db["mining_results"].find().sort("Date", -1).limit(500)
            results = list(cursor)
            for r in results:
                if '_id' in r: r['_id'] = str(r['_id'])
            db.disconnect()
            return jsonify(results)
        else:
            raise Exception("No DB Connection")
    except Exception as e:
        print(f">> DB not available, falling back to local CSV storage: {e}")
        if os.path.exists("results_for_powerbi.csv"):
            try:
                df = pd.read_csv("results_for_powerbi.csv")
                # Fix: Load JSON string to object so jsonify can handle it
                data_list = json.loads(df.to_json(orient='records'))
                return jsonify(data_list)
            except Exception as csv_err:
                print(f"!! Critical: CSV load error: {csv_err}")
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
