from sklearn.ensemble import IsolationForest
import pandas as pd

def detect_anomalies(df):
    """
    Identifies economic outliers using the Isolation Forest algorithm.
    Useful for pinpointing the exact start and peak of the pandemic shock.
    """
    print(">> Initializing Anomaly Detection Module...")
    
    # Features to analyze for anomalies
    features = ['Estimated Unemployment Rate (%)', 'Estimated Labour Participation Rate (%)']
    X = df[features]
    
    # Contamination refers to the expected % of outliers
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    df['is_anomaly'] = iso_forest.fit_predict(X)
    
    # Convert -1/1 to 1/0 for easier UI handling
    df['Anomaly_Flag'] = df['is_anomaly'].map({1: 0, -1: 1})
    
    anomalies_found = df[df['Anomaly_Flag'] == 1]
    print(f">> Detected {len(anomalies_found)} economic anomalies in the dataset.")
    
    return df, iso_forest
