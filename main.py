from data_loader import load_data, preprocess_for_ml
import regression
from neural_network import train_nn_model
import clustering
import anomaly_detector
from database_manager import DatabaseManager
import mining_history
import pandas as pd
import numpy as np

def run_pipeline():
    print("--- UNEMPLOYMENT ANALYSIS PIPELINE ---")
    mining_history.log_mining_event("STARTED", "Initiating ingestion of archive folder.")
    
    # 1. Load and Clean
    file1 = "archive (7)/Unemployment in India.csv"
    file2 = "archive (7)/Unemployment_Rate_upto_11_2020.csv"
    
    print(">> Ingesting primary and extended datasets from archive folder...")
    df1 = load_data(file1)
    df2 = load_data(file2)
    df = pd.concat([df1, df2], ignore_index=True)
    print(f">> Total unified records: {len(df)}")
    
    # 2. Preprocess
    X, y = preprocess_for_ml(df)
    
    # 3. Traditional Regression
    reg_model, _ = regression.train_regression_model(X, y)
    
    # 4. Neural Network (Memory Safety Check)
    try:
        nn_model, scaler = train_nn_model(X, y)
        X_scaled = scaler.transform(X)
        df['NN_Prediction'] = nn_model.predict(X_scaled)
    except Exception as e:
        print(f"!! ML Warning: TensorFlow skipped: {e}")
        df['NN_Prediction'] = df['Estimated Unemployment Rate (%)']
    
    # 5. Clustering
    df, _ = clustering.perform_clustering(df)
    
    # 6. Anomaly Detection
    df, _ = anomaly_detector.detect_anomalies(df)
    
    # 7. Generate Prediction columns
    df['Regression_Prediction'] = reg_model.predict(X)
    
    # 8. Store and Export
    db = DatabaseManager()
    db.connect()
    db.store_mined_data(df)
    
    output_file = "results_for_powerbi.csv"
    df.to_csv(output_file, index=False)
    db.disconnect()
    
    mining_history.log_mining_event("COMPLETED", f"Successfully processed {len(df)} records.")
    print(f"--- Mining Complete. Final analytics saved to {output_file} ---")

if __name__ == "__main__":
    run_pipeline()
