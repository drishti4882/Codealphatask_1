from pymongo import MongoClient
import pandas as pd
import json

class DatabaseManager:
    def __init__(self, uri="mongodb+srv://<db_username>:<db_password>@cluster0.q8h27tp.mongodb.net/?appName=Cluster0", db_name="unemployment_analytics"):
        """
        Initialize MongoDB Connection.
        Replace 'uri' with your MongoDB Atlas connection string if needed.
        """
        self.uri = uri
        self.db_name = db_name
        self.client = None
        self.db = None

    def connect(self):
        """Establish connection to MongoDB."""
        try:
            self.client = MongoClient(self.uri)
            self.db = self.client[self.db_name]
            print(f">> Connected to MongoDB: {self.db_name}")
        except Exception as e:
            print(f"!! MongoDB Connection Error: {e}")

    def disconnect(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            print(">> MongoDB connection closed.")

    def store_mined_data(self, df, collection_name="mining_results"):
        """
        Store the mined dataframe into a MongoDB collection.
        Clears existing data in the collection first.
        """
        if self.db is None:
            self.connect()
        
        try:
            # Drop collection to avoid duplicates in this mining pipeline
            self.db[collection_name].drop()
            
            # Convert DF to JSON-compatible dictionary
            records = json.loads(df.to_json(orient='records', date_format='iso'))
            
            if records:
                self.db[collection_name].insert_many(records)
                print(f">> Successfully stored {len(records)} records in MongoDB collection: {collection_name}")
            else:
                print(">> No records to store.")
        except Exception as e:
            print(f"!! Error storing data in MongoDB: {e}")

    def query_critical_zones(self, threshold=25):
        """Query MongoDB for documents with unemployment rates above the threshold."""
        if self.db is None:
            self.connect()
            
        collection = self.db["mining_results"]
        # MongoDB Query for high impact
        query = {"Estimated Unemployment Rate (%)": {"$gt": threshold}}
        
        try:
            cursor = collection.find(query)
            results = pd.DataFrame(list(cursor))
            if not results.empty and '_id' in results.columns:
                results.drop(columns=['_id'], inplace=True)
            return results
        except Exception as e:
            print(f"!! Error querying MongoDB: {e}")
            return None

if __name__ == "__main__":
    # Test the manager
    db = DatabaseManager()
    db.connect()
    # In actual pipeline, we pass the df here
    db.disconnect()
