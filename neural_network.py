from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

def train_nn_model(X, y):
    """
    Trains a Neural Network using Scikit-Learn (MLP).
    Lighter than TensorFlow and works on all Python versions.
    """
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    # This is a Neural Network with 2 hidden layers (64 and 32 neurons)
    model = MLPRegressor(
        hidden_layer_sizes=(64, 32), 
        max_iter=500, 
        activation='relu', 
        solver='adam', 
        random_state=42
    )
    
    print(">> Training Neural Network (MLP Engine)...")
    model.fit(X_train, y_train)
    
    score = model.score(X_test, y_test)
    print(f">> Neural Network Trained. Accuracy Score: {score:.2f}")
    
    return model, scaler
