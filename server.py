from flask import Flask, jsonify, request
from flask_cors import CORS
import main  # Importing your existing main.py
from database_manager import DatabaseManager
import pandas as pd

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) # Full permissive for local development

@app.before_request
def log_request():
    print(f">> Incoming {request.method} request to {request.path}")

@app.route('/api/health', methods=['GET'])
def health_check():
    """System health monitoring."""
    return jsonify({"status": "healthy", "engine": "Python 3.10", "database": "Connected"})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Quick summary stats for the UI."""
    db = DatabaseManager()
    try:
        db.connect()
        coll = db.db["mining_results"]
        avg = coll.aggregate([{"$group": {"_id": None, "avg_rate": {"$avg": "$Estimated Unemployment Rate (%)"}}}])
        avg_val = list(avg)[0]['avg_rate'] if avg else 0
        return jsonify({"average_unemployment": round(avg_val, 2), "total_records": coll.count_documents({})})
    except:
        return jsonify({"error": "Failed to fetch stats"}), 500
    finally:
        db.disconnect()

@app.route('/api/anomalies', methods=['GET'])
def get_anomalies():
    """Return only the data points identified as economic anomalies."""
    db = DatabaseManager()
    try:
        db.connect()
        cursor = db.db["mining_results"].find({"Anomaly_Flag": 1})
        anomalies = list(cursor)
        for a in anomalies: a['_id'] = str(a['_id'])
        return jsonify(anomalies)
    except:
        return jsonify({"error": "Failed to fetch anomalies"}), 500
    finally:
        db.disconnect()

@app.route('/api/mine', methods=['POST'])
def run_mining():
    """Endpoint to trigger the full mining pipeline."""
    try:
        print(">> API Triggered: Running Enhanced Pipeline...")
        main.run_pipeline()
        return jsonify({"status": "success", "message": "Neural Mining & Anomaly Detection Complete."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/results', methods=['GET'])
def get_results():
    """Endpoint to fetch results from MongoDB for the dashboard."""
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

if __name__ == '__main__':
    import os
    # Use the port assigned by the cloud provider or default to 5000
    port = int(os.environ.get("PORT", 5000))
    print(f">> Backend Server running on port {port}")
    app.run(host='0.0.0.0', port=port)
