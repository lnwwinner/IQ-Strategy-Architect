import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

class LSTMModel:
    def __init__(self):
        self.model = Sequential([
            LSTM(50, activation='relu', input_shape=(10, 1)),
            Dense(1)
        ])
        self.model.compile(optimizer='adam', loss='mse')

    def prepare_data(self, prices):
        # Prepare 10-step lookback
        X = []
        for i in range(len(prices) - 10):
            X.append(prices[i:i+10])
        return np.array(X).reshape(-1, 10, 1)

    def predict(self, prices):
        X = self.prepare_data(prices)
        return self.model.predict(X)[-1][0]
