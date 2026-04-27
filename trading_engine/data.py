import pandas as pd
import numpy as np

class DataEngine:
    def fetch_market_data(self, asset: str, timeframe: str):
        # In production, replace with real IQ Option API call
        # Mocking for now
        data = {
            'timestamp': pd.date_range(end=pd.Timestamp.now(), periods=100, freq='1min'),
            'open': np.random.rand(100) * 100,
            'high': np.random.rand(100) * 100,
            'low': np.random.rand(100) * 100,
            'close': np.random.rand(100) * 100,
            'volume': np.random.rand(100) * 1000
        }
        return pd.DataFrame(data)
