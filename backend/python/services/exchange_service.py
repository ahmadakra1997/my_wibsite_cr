# backend/python/services/exchange_service.py
"""
🎯 خدمة التداول المتقدمة مع المنصات - مدمجة مع الكود الأصلي
الإصدار: 3.0.0 | المطور: Akraa Trading Team
"""

import asyncio
import logging
import os
import time
import traceback
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import ccxt
import pandas as pd
import numpy as np
import pytz
from decimal import Decimal, ROUND_DOWN

# نماذج البيانات
from models.trading_models import *

logger = logging.getLogger(__name__)

class AdvancedExchangeService:
    """خدمة التداول المتقدمة مع دمج الكود الأصلي بالكامل"""
    
    def __init__(self):
        self.exchanges: Dict[str, ccxt.Exchange] = {}
        self.current_exchange = 'mexc'
        self.timezone = pytz.timezone('Asia/Riyadh')
        self.rate_limits = {}
        self.last_request_time = {}
        self.supported_symbols = self._get_supported_symbols()
        
        # إعدادات من الكود الأصلي
        self.EXCHANGES = {
            'mexc': {
                'api_key': os.getenv('MEXC_API_KEY', "mx0vglaHTCGu1GuJXk"),
                'secret': os.getenv('MEXC_SECRET', "75018e91f9bf4d20823955aee2c38c65"),
                'active': True
            },
            'kucoin': {
                'api_key': os.getenv('KUCOIN_API_KEY', ""),
                'secret': os.getenv('KUCOIN_SECRET', ""),
                'active': False
            },
            'binance': {
                'api_key': os.getenv('BINANCE_API_KEY', ""),
                'secret': os.getenv('BINANCE_SECRET', ""),
                'active': False
            }
        }
        
        self.initialize_exchanges()
    
    def _get_supported_symbols(self):
        """قائمة الرموز المدعومة من الكود الأصلي"""
        return [
            "BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "ADA/USDT", "DOT/USDT", 
            "DOGE/USDT", "AVAX/USDT", "MATIC/USDT", "AR/USDT", "OP/USDT", "CHZ/USDT",
            # ... (كل الرموز من الكود الأصلي)
            "BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "ADA/USDT"
        ]
    
    def initialize_exchanges(self):
        """تهيئة اتصالات المنصات من الكود الأصلي"""
        try:
            logger.info("🔗 بدء تهيئة اتصالات المنصات...")
            
            for exchange_name, config in self.EXCHANGES.items():
                if not config['active']:
                    continue
                    
                exchange_class = getattr(ccxt, exchange_name)
                exchange_config = {
                    'apiKey': config['api_key'],
                    'secret': config['secret'],
                    'enableRateLimit': True,
                    'timeout': 60000,
                    'options': {
                        'defaultType': 'spot',
                        'adjustForTimeDifference': True,
                        'recvWindow': 60000,
                        'createMarketBuyOrderRequiresPrice': False
                    }
                }
                
                self.exchanges[exchange_name] = exchange_class(exchange_config)
                logger.info(f"✅ تم تهيئة منصة {exchange_name}")
            
            # تحميل الأسواق
            self._load_markets()
            
        except Exception as e:
            logger.error(f"❌ فشل تهيئة المنصات: {traceback.format_exc()}")
            raise
    
    def _load_markets(self):
        """تحميل بيانات الأسواق"""
        for exchange_name, exchange in self.exchanges.items():
            try:
                exchange.load_markets()
                logger.info(f"📊 تم تحميل أسواق {exchange_name}: {len(exchange.markets)} سوق")
            except Exception as e:
                logger.error(f"❌ فشل تحميل أسواق {exchange_name}: {str(e)}")
    
    async def get_market_data(self, symbol: str, exchange_name: str = None) -> MarketData:
        """جلب بيانات السوق المتقدمة من الكود الأصلي"""
        try:
            exchange = self.get_exchange(exchange_name)
            
            # احترام حدود Rate Limiting
            await self._respect_rate_limits(exchange_name, 'fetch_ticker')
            
            ticker = exchange.fetch_ticker(symbol)
            ohlcv = exchange.fetch_ohlcv(symbol, '1d', limit=2)
            
            # حساب التغير
            change_24h = ((ticker['last'] - ticker['open']) / ticker['open']) * 100 if ticker['open'] else 0
            
            return MarketData(
                symbol=symbol,
                price=float(ticker['last']),
                volume=float(ticker['baseVolume']),
                timestamp=datetime.utcnow(),
                change_24h=change_24h,
                high_24h=float(ticker['high']),
                low_24h=float(ticker['low']),
                bid=float(ticker['bid']),
                ask=float(ticker['ask']),
                spread=float((ticker['ask'] - ticker['bid']) / ticker['bid'] * 100) if ticker['bid'] else 0,
                base_volume=float(ticker['baseVolume']),
                quote_volume=float(ticker['quoteVolume'])
            )
            
        except Exception as e:
            logger.error(f"❌ خطأ في جلب بيانات السوق لـ {symbol}: {traceback.format_exc()}")
            raise
    
    async def fetch_ohlcv(self, symbol: str, timeframe: str = '1h', limit: int = 100, 
                         exchange_name: str = None) -> List[List[float]]:
        """جلب بيانات OHLCV من الكود الأصلي"""
        try:
            exchange = self.get_exchange(exchange_name)
            await self._respect_rate_limits(exchange_name, 'fetch_ohlcv')
            
            ohlcv = exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            return ohlcv
            
        except Exception as e:
            logger.error(f"❌ خطأ في جلب OHLCV لـ {symbol}: {str(e)}")
            return []
    
    async def place_order(self, order_data: PlaceOrderRequest, exchange_name: str = None) -> OrderResponse:
        """تنفيذ أمر تداول متقدم من الكود الأصلي"""
        try:
            exchange = self.get_exchange(exchange_name)
            await self._respect_rate_limits(exchange_name, 'create_order')
            
            # التحقق من الرمز
            if order_data.symbol not in exchange.markets:
                raise ValueError(f"الرمز {order_data.symbol} غير مدعوم في {exchange_name}")
            
            # الحصول على معلومات السوق للتحقق
            market = exchange.market(order_data.symbol)
            
            # تقريب الكمية حسب متطلبات المنصة
            amount = self._adjust_amount(order_data.quantity, market)
            
            # معلمات الأمر
            order_params = {
                'symbol': order_data.symbol,
                'type': order_data.order_type.value,
                'side': order_data.side.value,
                'amount': amount,
            }
            
            # إضافة السعر للأوامر المحددة
            if order_data.price and order_data.order_type in [OrderType.LIMIT, OrderType.STOP_LIMIT]:
                order_params['price'] = self._adjust_price(order_data.price, market)
            
            # إضافة سعر الوقف لأوامر STOP
            if order_data.stop_price and order_data.order_type in [OrderType.STOP, OrderType.STOP_LIMIT]:
                order_params['stopPrice'] = self._adjust_price(order_data.stop_price, market)
            
            # تنفيذ الأمر
            order_result = exchange.create_order(**order_params)
            
            return OrderResponse(
                order_id=order_result['id'],
                symbol=order_data.symbol,
                side=order_data.side,
                order_type=order_data.order_type,
                quantity=float(amount),
                price=order_data.price,
                status=order_result['status'],
                timestamp=datetime.utcnow(),
                exchange_id=order_result['id'],
                filled_quantity=float(order_result.get('filled', 0)),
                remaining_quantity=float(order_result.get('remaining', amount)),
                average_price=float(order_result.get('average', order_data.price))
            )
            
        except ccxt.InsufficientFunds as e:
            logger.error(f"💰 رصيد غير كافي لـ {order_data.symbol}: {str(e)}")
            raise HTTPException(status_code=400, detail="رصيد غير كافي")
        except ccxt.InvalidOrder as e:
            logger.error(f"❌ أمر غير صالح لـ {order_data.symbol}: {str(e)}")
            raise HTTPException(status_code=400, detail="أمر غير صالح")
        except Exception as e:
            logger.error(f"❌ خطأ في تنفيذ الأمر لـ {order_data.symbol}: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"فشل في تنفيذ الأمر: {str(e)}")
    
    async def cancel_order(self, order_id: str, symbol: str, exchange_name: str = None) -> bool:
        """إلغاء أمر مع إدارة الأخطاء"""
        try:
            exchange = self.get_exchange(exchange_name)
            await self._respect_rate_limits(exchange_name, 'cancel_order')
            
            result = exchange.cancel_order(order_id, symbol)
            return True
            
        except ccxt.OrderNotFound:
            logger.warning(f"⚠️ الأمر {order_id} غير موجود أو تم إلغاؤه مسبقاً")
            return True
        except Exception as e:
            logger.error(f"❌ خطأ في إلغاء الأمر {order_id}: {str(e)}")
            return False
    
    async def get_order(self, order_id: str, symbol: str, exchange_name: str = None) -> Optional[OrderResponse]:
        """الحصول على حالة أمر"""
        try:
            exchange = self.get_exchange(exchange_name)
            await self._respect_rate_limits(exchange_name, 'fetch_order')
            
            order = exchange.fetch_order(order_id, symbol)
            
            return OrderResponse(
                order_id=order['id'],
                symbol=order['symbol'],
                side=OrderSide.BUY if order['side'] == 'buy' else OrderSide.SELL,
                order_type=OrderType(order['type']),
                quantity=float(order['amount']),
                price=float(order['price']) if order['price'] else None,
                status=order['status'],
                timestamp=datetime.fromtimestamp(order['timestamp'] / 1000),
                exchange_id=order['id'],
                filled_quantity=float(order['filled']),
                remaining_quantity=float(order['remaining']),
                average_price=float(order['average']) if order['average'] else None
            )
            
        except Exception as e:
            logger.error(f"❌ خطأ في جلب الأمر {order_id}: {str(e)}")
            return None
    
    async def get_open_orders(self, symbol: str = None, exchange_name: str = None) -> List[OrderResponse]:
        """الحصول على الأوامر المفتوحة"""
        try:
            exchange = self.get_exchange(exchange_name)
            await self._respect_rate_limits(exchange_name, 'fetch_open_orders')
            
            orders = exchange.fetch_open_orders(symbol) if symbol else exchange.fetch_open_orders()
            
            return [
                OrderResponse(
                    order_id=order['id'],
                    symbol=order['symbol'],
                    side=OrderSide.BUY if order['side'] == 'buy' else OrderSide.SELL,
                    order_type=OrderType(order['type']),
                    quantity=float(order['amount']),
                    price=float(order['price']) if order['price'] else None,
                    status=order['status'],
                    timestamp=datetime.fromtimestamp(order['timestamp'] / 1000),
                    exchange_id=order['id'],
                    filled_quantity=float(order['filled']),
                    remaining_quantity=float(order['remaining']),
                    average_price=float(order['average']) if order['average'] else None
                )
                for order in orders
            ]
            
        except Exception as e:
            logger.error(f"❌ خطأ في جلب الأوامر المفتوحة: {str(e)}")
            return []
    
    async def get_balance(self, exchange_name: str = None) -> Dict[str, float]:
        """الحصول على الرصيد"""
        try:
            exchange = self.get_exchange(exchange_name)
            await self._respect_rate_limits(exchange_name, 'fetch_balance')
            
            balance = exchange.fetch_balance()
            free_balance = {}
            
            for currency, info in balance['free'].items():
                if info and float(info) > 0:
                    free_balance[currency] = float(info)
            
            return free_balance
            
        except Exception as e:
            logger.error(f"❌ خطأ في جلب الرصيد: {str(e)}")
            return {}
    
    async def get_active_symbols(self, exchange_name: str = None) -> List[str]:
        """الحصول على الرموز النشطة مع الفلترة من الكود الأصلي"""
        try:
            exchange = self.get_exchange(exchange_name)
            
            # استخدام الرموز المدعومة من الكود الأصلي
            active_symbols = []
            
            for symbol in self.supported_symbols:
                if symbol in exchange.markets:
                    market = exchange.markets[symbol]
                    if market['active']:
                        active_symbols.append(symbol)
            
            logger.info(f"📊 الرموز النشطة في {exchange_name}: {len(active_symbols)} رمز")
            return active_symbols[:20]  # إرجاع أول 20 رمز فقط للكفاءة
            
        except Exception as e:
            logger.error(f"❌ خطأ في جلب الرموز النشطة: {str(e)}")
            return self.supported_symbols[:10]
    
    async def create_market_buy_order(self, symbol: str, amount: float, exchange_name: str = None) -> OrderResponse:
        """إنشاء أمر شراء سوقي"""
        order_data = PlaceOrderRequest(
            symbol=symbol,
            side=OrderSide.BUY,
            order_type=OrderType.MARKET,
            quantity=amount
        )
        return await self.place_order(order_data, exchange_name)
    
    async def create_market_sell_order(self, symbol: str, amount: float, exchange_name: str = None) -> OrderResponse:
        """إنشاء أمر بيع سوقي"""
        order_data = PlaceOrderRequest(
            symbol=symbol,
            side=OrderSide.SELL,
            order_type=OrderType.MARKET,
            quantity=amount
        )
        return await self.place_order(order_data, exchange_name)
    
    async def create_limit_buy_order(self, symbol: str, amount: float, price: float, exchange_name: str = None) -> OrderResponse:
        """إنشاء أمر شراء محدد"""
        order_data = PlaceOrderRequest(
            symbol=symbol,
            side=OrderSide.BUY,
            order_type=OrderType.LIMIT,
            quantity=amount,
            price=price
        )
        return await self.place_order(order_data, exchange_name)
    
    async def create_limit_sell_order(self, symbol: str, amount: float, price: float, exchange_name: str = None) -> OrderResponse:
        """إنشاء أمر بيع محدد"""
        order_data = PlaceOrderRequest(
            symbol=symbol,
            side=OrderSide.SELL,
            order_type=OrderType.LIMIT,
            quantity=amount,
            price=price
        )
        return await self.place_order(order_data, exchange_name)
    
    def get_exchange(self, exchange_name: str = None):
        """الحصول على كائن المنصة"""
        name = exchange_name or self.current_exchange
        if name not in self.exchanges:
            raise ValueError(f"المنصة {name} غير مهيئة أو غير مدعومة")
        return self.exchanges[name]
    
    async def _respect_rate_limits(self, exchange_name: str, endpoint: str):
        """احترام حدود Rate Limiting من الكود الأصلي"""
        try:
            current_time = time.time()
            key = f"{exchange_name}_{endpoint}"
            
            if key not in self.last_request_time:
                self.last_request_time[key] = current_time
                return
            
            time_since_last = current_time - self.last_request_time[key]
            min_interval = 0.1  # 100ms بين الطلبات
            
            if time_since_last < min_interval:
                sleep_time = min_interval - time_since_last
                await asyncio.sleep(sleep_time)
            
            self.last_request_time[key] = time.time()
            
        except Exception as e:
            logger.warning(f"⚠️ خطأ في إدارة Rate Limiting: {str(e)}")
    
    def _adjust_amount(self, amount: float, market: Dict) -> float:
        """ضبط الكمية حسب متطلبات المنصة"""
        try:
            precision = market['precision']['amount']
            if isinstance(precision, int):
                # تقريب للعدد الصحيح من المنازل
                return float(Decimal(str(amount)).quantize(Decimal('1.' + '0' * precision), rounding=ROUND_DOWN))
            else:
                # تقريب عادي
                return round(amount, precision)
        except:
            return amount
    
    def _adjust_price(self, price: float, market: Dict) -> float:
        """ضبط السعر حسب متطلبات المنصة"""
        try:
            precision = market['precision']['price']
            if isinstance(precision, int):
                return float(Decimal(str(price)).quantize(Decimal('1.' + '0' * precision), rounding=ROUND_DOWN))
            else:
                return round(price, precision)
        except:
            return price
    
    async def get_order_book(self, symbol: str, limit: int = 20, exchange_name: str = None) -> Dict[str, List]:
        """الحصول على كتاب الطلبات"""
        try:
            exchange = self.get_exchange(exchange_name)
            await self._respect_rate_limits(exchange_name, 'fetch_order_book')
            
            order_book = exchange.fetch_order_book(symbol, limit)
            return {
                'bids': order_book['bids'],
                'asks': order_book['asks'],
                'timestamp': order_book['timestamp'],
                'datetime': exchange.iso8601(order_book['timestamp'])
            }
            
        except Exception as e:
            logger.error(f"❌ خطأ في جلب كتاب الطلبات لـ {symbol}: {str(e)}")
            return {'bids': [], 'asks': []}
    
    async def get_recent_trades(self, symbol: str, limit: int = 50, exchange_name: str = None) -> List[Dict]:
        """الحصول على الصفقات الحديثة"""
        try:
            exchange = self.get_exchange(exchange_name)
            await self._respect_rate_limits(exchange_name, 'fetch_trades')
            
            trades = exchange.fetch_trades(symbol, limit=limit)
            return [
                {
                    'id': trade['id'],
                    'timestamp': trade['timestamp'],
                    'datetime': trade['datetime'],
                    'symbol': trade['symbol'],
                    'side': trade['side'],
                    'price': float(trade['price']),
                    'amount': float(trade['amount']),
                    'cost': float(trade['cost']),
                    'takerOrMaker': trade.get('takerOrMaker', 'unknown')
                }
                for trade in trades
            ]
            
        except Exception as e:
            logger.error(f"❌ خطأ في جلب الصفقات لـ {symbol}: {str(e)}")
            return []
    
    async def get_health(self) -> Dict[str, Any]:
        """فحص صحة اتصالات المنصات"""
        health_status = {}
        
        for exchange_name, exchange in self.exchanges.items():
            try:
                # محاولة جلب الرصيد كاختبار للاتصال
                balance = exchange.fetch_balance()
                health_status[exchange_name] = {
                    'status': 'connected',
                    'has_credentials': bool(exchange.apiKey),
                    'tested_at': datetime.utcnow().isoformat()
                }
            except Exception as e:
                health_status[exchange_name] = {
                    'status': 'disconnected',
                    'error': str(e),
                    'tested_at': datetime.utcnow().isoformat()
                }
        
        return health_status

# نسخة مبسطة للاستخدام السريع
class SimpleExchangeService:
    """خدمة مبسطة للاستخدام المباشر"""
    
    def __init__(self):
        self.advanced_service = AdvancedExchangeService()
    
    async def buy_market(self, symbol: str, amount: float) -> OrderResponse:
        """شراء سوقي مبسط"""
        return await self.advanced_service.create_market_buy_order(symbol, amount)
    
    async def sell_market(self, symbol: str, amount: float) -> OrderResponse:
        """بيع سوقي مبسط"""
        return await self.advanced_service.create_market_sell_order(symbol, amount)
    
    async def get_price(self, symbol: str) -> float:
        """الحصول على السعر الحالي"""
        market_data = await self.advanced_service.get_market_data(symbol)
        return market_data.price
    
    async def get_balance(self, currency: str = 'USDT') -> float:
        """الحصول على رصيد عملة محددة"""
        balance = await self.advanced_service.get_balance()
        return balance.get(currency, 0.0)

# إنشاء نسخة عالمية للاستخدام
exchange_service = AdvancedExchangeService()