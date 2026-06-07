import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

def train_nn_model(X, y):
    """
    Trains a TensorFlow Neural Network.
    """
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    model = Sequential([
        Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    
    print(">> Training TensorFlow Model...")
    model.fit(X_train, y_train, epochs=20, batch_size=4, verbose=0)
    
    loss, mae = model.evaluate(X_test, y_test, verbose=0)
    print(f">> Neural Network Trained. Test Loss: {loss:.2f}")
    
    return model, scaler
