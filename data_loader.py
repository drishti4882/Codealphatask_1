import pandas as pd
import os

def load_data(file_path):
    """
    Loads and performs basic cleaning on the unemployment dataset.
    Automatically checks the 'archive (7)' directory.
    """
    # Force search in archive folder if not explicitly absolute
    if not os.path.isabs(file_path) and not file_path.startswith("archive"):
        file_path = os.path.join("archive (7)", file_path)

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset mining failed. File not found at: {file_path}")
        
    df = pd.read_csv(file_path)
    
    # Cleaning columns (removing leading/trailing spaces)
    df.columns = df.columns.str.strip()
    
    # Dropping missing values
    df = df.dropna()
    
    # Standardizing Date format
    df['Date'] = pd.to_datetime(df['Date'], dayfirst=True)
    
    print(f">> Loaded {len(df)} rows from {file_path}")
    return df

def preprocess_for_ml(df):
    """
    Prepares features for training.
    """
    # Using 'Estimated Employed' and 'Estimated Labour Participation Rate (%)' as features
    features = ['Estimated Employed', 'Estimated Labour Participation Rate (%)']
    target = 'Estimated Unemployment Rate (%)'
    
    X = df[features]
    y = df[target]
    
    return X, y
