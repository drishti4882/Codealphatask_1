from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pandas as pd

def perform_clustering(df, n_clusters=3):
    """
    Perform K-Means clustering to group regions by economic impact.
    Features: Unemployment Rate and Labour Participation.
    """
    print(f">> Initializing Clustering Module (n={n_clusters})...")
    
    # Selecting features for clustering
    features = ['Estimated Unemployment Rate (%)', 'Estimated Labour Participation Rate (%)']
    X = df[features]
    
    # Scaling is crucial for K-Means
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Training K-Means
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df['Cluster_ID'] = kmeans.fit_predict(X_scaled)
    
    # Mapping cluster IDs to human-readable impact levels
    # We'll calculate the mean unemployment per cluster to rank them
    cluster_means = df.groupby('Cluster_ID')['Estimated Unemployment Rate (%)'].mean().sort_values()
    
    impact_map = {}
    labels = ["Low Impact", "Moderate Impact", "High Impact"]
    for i, cluster_id in enumerate(cluster_means.index):
        impact_map[cluster_id] = labels[i]
        
    df['Impact_Zone'] = df['Cluster_ID'].map(impact_map)
    
    print(">> Clustering complete. Identified impact zones.")
    return df, kmeans
