import os
from datetime import timedelta

class Config:
    """إعدادات آمنة مع حماية المعلومات الحساسة"""
    
    # === إعدادات الأمان ===
    SECRET_KEY = os.getenv('SECRET_KEY', 'fallback-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # === إعدادات قاعدة البيانات ===
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///trading.db')
    
    # === إعدادات منصات التداول ===
    EXCHANGE_CONFIGS = {
        'binance': {
            'api_key': os.getenv('BINANCE_API_KEY', ''),
            'api_secret': os.getenv('BINANCE_API_SECRET', ''),
            'testnet': os.getenv('BINANCE_TESTNET', 'True').lower() == 'true'
        },
        'bybit': {
            'api_key': os.getenv('BYBIT_API_KEY', ''),
            'api_secret': os.getenv('BYBIT_API_SECRET', ''),
            'testnet': os.getenv('BYBIT_TESTNET', 'True').lower() == 'true'
        }
        # يمكن إضافة منصات أخرى هنا
    }
    
    # === إعدادات إدارة المخاطر ===
    RISK_CONFIG = {
        'max_position_size': float(os.getenv('MAX_POSITION_SIZE', '1000')),
        'daily_loss_limit': float(os.getenv('DAILY_LOSS_LIMIT', '500')),
        'max_leverage': int(os.getenv('MAX_LEVERAGE', '10')),
        'auto_risk_management': os.getenv('AUTO_RISK_MANAGEMENT', 'True').lower() == 'true'
    }
    
    # === إعدادات الذكاء الاصطناعي ===
    AI_CONFIG = {
        'model_path': os.getenv('AI_MODEL_PATH', 'models/trading_model.h5'),
        'confidence_threshold': float(os.getenv('AI_CONFIDENCE_THRESHOLD', '0.7')),
        'retrain_interval': int(os.getenv('AI_RETRAIN_INTERVAL', '24'))
    }
    
    # === إعدادات الأداء ===
    PERFORMANCE_CONFIG = {
        'cache_timeout': int(os.getenv('CACHE_TIMEOUT', '300')),
        'max_workers': int(os.getenv('MAX_WORKERS', '5')),
        'request_timeout': int(os.getenv('REQUEST_TIMEOUT', '30'))
    }

def validate_config():
    """التحقق من صحة الإعدادات"""
    required_vars = ['SECRET_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"⚠️  تحذير: المتغيرات التالية مفقودة: {missing_vars}")
        print("يرجى تعيينها في ملف .env")
    
    return len(missing_vars) == 0

# التحقق من الإعدادات عند الاستيراد
if __name__ == "__main__":
    validate_config()
