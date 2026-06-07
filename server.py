from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import main
from database_manager import DatabaseManager
import os

# Create Flask app with Static folder pointing to React's build output (dist)
app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)

@app.route('/')
def serve():
    """Serves the React Frontend."""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "engine": "Production-Ready", "database": "MongoDB Atlas Connected"})

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
    db = DatabaseManager()
    try:
        db.connect()
        collection = db.db["mining_results"]
        cursor = collection.find().sort("Date", -1).limit(200)
        results = list(cursor)
        for r in results: r['_id'] = str(r['_id'])
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.disconnect()

@app.errorhandler(404)
def not_found(e):
    """Catch-all to serve index.html for client-side routing."""
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Use the port assigned by the cloud provider (Render) or default to 5000
    port = int(os.environ.get("PORT", 5000))
    print(f">> Unified Server starting on port {port}")
    app.run(host='0.0.0.0', port=port)
