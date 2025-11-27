/**
 * دفتر الطلبات المتقدم - الإصدار 3.0
 * دفتر طلبات حي مع تحديثات فورية وتحليلات متقدمة
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

// الخدمات
import WebSocketService from '../../services/websocketService';
import OrderBookAnalyzer from '../../services/orderBookAnalyzer';

// المكونات
import OrderBookRow from './OrderBookRow';
import OrderBookHeader from './OrderBookHeader';
import DepthChart from './DepthChart';
import OrderBookStats from './OrderBookStats';
import LoadingState from '../common/LoadingState';

// الإجراءات
import { updateOrderBook, setOrderBookLoading } from '../../store/tradingSlice';

/**
 * مكون دفتر الطلبات المتقدم
 */
const OrderBook = ({ 
  symbol = 'BTCUSDT',
  depth = 25,
  showDepthChart = true,
  showStats = true,
  theme = 'dark',
  updateSpeed = 1000
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // الحالة
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [orderBookStats, setOrderBookStats] = useState({});
  
  // الخدمات
  const wsService = useMemo(() => new WebSocketService(), []);
  const orderBookAnalyzer = useMemo(() => new OrderBookAnalyzer(), []);

  // البيانات من Redux
  const { orderBook: reduxOrderBook, isLoading } = useSelector(state => state.trading);

  /**
   * معالج تحديث دفتر الطلبات
   */
  const handleOrderBookUpdate = useCallback((orderBookData) => {
    if (orderBookData.symbol !== symbol) return;

    try {
      // تحديث العروض والطلبات
      setBids(orderBookData.bids.slice(0, depth));
      setAsks(orderBookData.asks.slice(0, depth));
      
      // تحديث الوقت الأخير
      setLastUpdate(new Date());
      
      // حساب الإحصائيات
      const stats = orderBookAnalyzer.analyzeOrderBook(orderBookData);
      setOrderBookStats(stats);
      
      // تحديث Redux
      dispatch(updateOrderBook(orderBookData));

    } catch (error) {
      console.error('❌ خطأ في تحديث دفتر الطلبات:', error);
    }
  }, [symbol, depth, orderBookAnalyzer, dispatch]);

  /**
   * إعداد خدمة WebSocket
   */
  const setupWebSocket = useCallback(() => {
    wsService.connect({
      symbols: [symbol],
      onOrderBookUpdate: handleOrderBookUpdate,
      onConnectionStatus: (status) => {
        setIsConnected(status === 'connected');
      },
      onError: (error) => {
        console.error('WebSocket error in order book:', error);
        setIsConnected(false);
      }
    });

    return () => {
      wsService.disconnect();
    };
  }, [symbol, wsService, handleOrderBookUpdate]);

  /**
   * تأثير التهيئة
   */
  useEffect(() => {
    dispatch(setOrderBookLoading(true));
    
    const cleanupWebSocket = setupWebSocket();
    
    return () => {
      cleanupWebSocket();
      dispatch(setOrderBookLoading(false));
    };
  }, [setupWebSocket, dispatch]);

  /**
   * تأثير تحديث البيانات من Redux
   */
  useEffect(() => {
    if (reduxOrderBook && reduxOrderBook.symbol === symbol) {
      setBids(reduxOrderBook.bids || []);
      setAsks(reduxOrderBook.asks || []);
    }
  }, [reduxOrderBook, symbol]);

  /**
   * حساب إجمالي الكمية
   */
  const calculateTotal = useCallback((orders, isBid = true) => {
    return orders.reduce((total, order) => total + parseFloat(order.quantity), 0);
  }, []);

  /**
   * حساب النسبة المئوية
   */
  const calculatePercentage = useCallback((quantity, total) => {
    return total > 0 ? (quantity / total) * 100 : 0;
  }, []);

  // الإجماليات
  const totalBids = useMemo(() => calculateTotal(bids), [bids, calculateTotal]);
  const totalAsks = useMemo(() => calculateTotal(asks), [asks, calculateTotal]);

  /**
   * معالج النقر على صف الطلب
   */
  const handleOrderClick = useCallback((order, isBid) => {
    // يمكن إضافة وظائف إضافية هنا مثل وضع أمر
    console.log('Order clicked:', order, isBid);
    
    // إرسال حدث للنقر على الطلب
    const event = new CustomEvent('orderBookClick', {
      detail: { order, isBid, symbol }
    });
    window.dispatchEvent(event);
  }, [symbol]);

  // عرض حالة التحميل
  if (isLoading && (!bids.length || !asks.length)) {
    return (
      <LoadingState 
        type="orderbook" 
        message={t('orderBook.loading')}
        height={400}
      />
    );
  }

  return (
    <div className={`order-book-container ${theme}`} data-testid="order-book">
      {/* رأس دفتر الطلبات */}
      <OrderBookHeader
        symbol={symbol}
        lastUpdate={lastUpdate}
        isConnected={isConnected}
        stats={orderBookStats}
      />

      <div className="order-book-content">
        {/* العروض (الشراء) */}
        <div className="bids-section">
          <div className="section-header">
            <h4>{t('orderBook.bids')}</h4>
            <span className="total-volume">
              {t('orderBook.total')}: {totalBids.toFixed(4)}
            </span>
          </div>
          
          <div className="orders-list bids-list">
            {bids.map((bid, index) => (
              <OrderBookRow
                key={`bid-${index}`}
                order={bid}
                isBid={true}
                total={totalBids}
                percentage={calculatePercentage(parseFloat(bid.quantity), totalBids)}
                onClick={() => handleOrderClick(bid, true)}
                theme={theme}
              />
            ))}
          </div>
        </div>

        {/* سعر السوق */}
        <div className="market-price-section">
          {orderBookStats.midPrice && (
            <div className="market-price">
              <span className="price">{orderBookStats.midPrice}</span>
              <span className="label">{t('orderBook.midPrice')}</span>
            </div>
          )}
          
          {orderBookStats.spread && (
            <div className="market-spread">
              <span className="spread">{orderBookStats.spread}</span>
              <span className="label">{t('orderBook.spread')}</span>
            </div>
          )}
        </div>

        {/* الطلبات (البيع) */}
        <div className="asks-section">
          <div className="section-header">
            <h4>{t('orderBook.asks')}</h4>
            <span className="total-volume">
              {t('orderBook.total')}: {totalAsks.toFixed(4)}
            </span>
          </div>
          
          <div className="orders-list asks-list">
            {asks.map((ask, index) => (
              <OrderBookRow
                key={`ask-${index}`}
                order={ask}
                isBid={false}
                total={totalAsks}
                percentage={calculatePercentage(parseFloat(ask.quantity), totalAsks)}
                onClick={() => handleOrderClick(ask, false)}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </div>

      {/* مخطط العمق */}
      {showDepthChart && (
        <div className="depth-chart-section">
          <DepthChart
            bids={bids}
            asks={asks}
            theme={theme}
            height={200}
          />
        </div>
      )}

      {/* إحصائيات إضافية */}
      {showStats && orderBookStats && (
        <OrderBookStats
          stats={orderBookStats}
          symbol={symbol}
          theme={theme}
        />
      )}

      {/* حالة الاتصال */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 ' + t('common.connected') : '🔴 ' + t('common.disconnected')}
      </div>
    </div>
  );
};

// أنواع مخصصة للاستخدام السريع
OrderBook.Advanced = (props) => (
  <OrderBook 
    showDepthChart={true}
    showStats={true}
    depth={50}
    {...props}
  />
);

OrderBook.Simple = (props) => (
  <OrderBook 
    showDepthChart={false}
    showStats={false}
    depth={15}
    {...props}
  />
);

export default React.memo(OrderBook);
