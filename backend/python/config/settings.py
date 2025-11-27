import os
from typing import List

class Settings:
    """إعدادات التطبيق"""
    
    def __init__(self):
        self.ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5000").split(",")
        self.REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/quantum_trade")
        self.EXCHANGE_API_KEY = os.getenv("EXCHANGE_API_KEY")
        self.EXCHANGE_SECRET = os.getenv("EXCHANGE_SECRET")
        self.AI_MODEL_PATH = os.getenv("AI_MODEL_PATH", "./ai_models")
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")