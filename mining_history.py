import datetime
from database_manager import DatabaseManager

def log_mining_event(status, details):
    """
    Records a mining event to a separate MongoDB collection for auditing.
    This provides 'more backend' functionality for tracking analysis history.
    """
    db = DatabaseManager()
    try:
        db.connect()
        event = {
            "timestamp": datetime.datetime.now().isoformat(),
            "status": status,
            "details": details,
            "engine_version": "2.1.0"
        }
        db.db["mining_history"].insert_one(event)
        print(f">> Audit Log Created: {status}")
    except Exception as e:
        print(f"!! Failed to log event: {e}")
    finally:
        db.disconnect()
