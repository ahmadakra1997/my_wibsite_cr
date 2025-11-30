// frontend/src/services/websocketService.js - النسخة المتكاملة والمتقدمة
class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.eventListeners = new Map();
    this.isConnected = false;
    this.connectionUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
  }

  // 🔗 الاتصال بالخادم
  connect() {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔄 محاولة الاتصال بـ WebSocket...');
        
        this.socket = new WebSocket(this.connectionUrl);

        this.socket.onopen = (event) => {
          console.log('✅ تم الاتصال بـ WebSocket بنجاح');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected', event);
          resolve(event);
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit('message', data);
            
            // إرسال الحدث حسب النوع
            if (data.type) {
              this.emit(data.type, data);
            }
          } catch (error) {
            console.error('❌ خطأ في معالجة رسالة WebSocket:', error);
            this.emit('error', { error: 'Failed to parse message', originalEvent: event });
          }
        };

        this.socket.onclose = (event) => {
          console.log('🔌 تم إغلاق اتصال WebSocket:', event.code, event.reason);
          this.isConnected = false;
          this.emit('disconnected', event);
          
          // إعادة الاتصال التلقائي
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              console.log(`🔄 محاولة إعادة الاتصال ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
              this.connect();
            }, this.reconnectInterval);
          }
        };

        this.socket.onerror = (error) => {
          console.error('❌ خطأ في WebSocket:', error);
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        console.error('❌ فشل إنشاء اتصال WebSocket:', error);
        reject(error);
      }
    });
  }

  // 📤 إرسال رسالة
  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message);
      this.socket.send(messageString);
      return true;
    } else {
      console.warn('⚠️ WebSocket غير متصل، لا يمكن إرسال الرسالة');
      return false;
    }
  }

  // 📡 الاشتراك في قناة
  subscribe(channel) {
    return this.send({
      type: 'subscribe',
      channel: channel
    });
  }

  // 📡 إلغاء الاشتراك من قناة
  unsubscribe(channel) {
    return this.send({
      type: 'unsubscribe',
      channel: channel
    });
  }

  // 🔌 قطع الاتصال
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 تم قطع اتصال WebSocket يدوياً');
    }
  }

  // 🎯 إضافة مستمع للأحداث
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  // 🎯 إزالة مستمع للأحداث
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 📢 إطلاق حدث
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ خطأ في معالج حدث ${event}:`, error);
        }
      });
    }
  }

  // 🔄 إعادة الاتصال
  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    return this.connect();
  }

  // 📊 الحصول على حالة الاتصال
  getConnectionStatus() {
    if (!this.socket) return 'disconnected';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  // 🏓 إرسال ping للتحقق من الاتصال
  ping() {
    return this.send({
      type: 'ping',
      timestamp: Date.now()
    });
  }

  // 🎯 خدمات البوت المخصصة
  subscribeToBotUpdates(botId = null) {
    const channel = botId ? `bot-${botId}` : 'bot-updates';
    return this.subscribe(channel);
  }

  subscribeToTradingUpdates() {
    return this.subscribe('trading');
  }

  subscribeToPerformanceUpdates() {
    return this.subscribe('performance');
  }

  subscribeToNotifications() {
    return this.subscribe('notifications');
  }

  // 📈 إرسال أمر تداول
  sendTradeOrder(order) {
    return this.send({
      type: 'trade_order',
      ...order
    });
  }

  // ⚙️ تحديث إعدادات البوت
  updateBotSettings(settings) {
    return this.send({
      type: 'update_settings',
      settings: settings
    });
  }

  // 🛡️ طلب حالة البوت
  requestBotStatus() {
    return this.send({
      type: 'status_request'
    });
  }
}

// 🎯 هوكس React للاستخدام السهل
export const createWebSocketHook = (service) => {
  return (events = {}) => {
    const [lastMessage, setLastMessage] = React.useState(null);
    const [connectionStatus, setConnectionStatus] = React.useState('disconnected');

    React.useEffect(() => {
      // إضافة مستمعي الأحداث
      Object.entries(events).forEach(([event, callback]) => {
        service.on(event, callback);
      });

      // مستمع الرسائل العامة
      service.on('message', setLastMessage);
      service.on('connected', () => setConnectionStatus('connected'));
      service.on('disconnected', () => setConnectionStatus('disconnected'));

      // الاتصال التلقائي
      if (!service.isConnected) {
        service.connect().catch(console.error);
      }

      return () => {
        // تنظيف المستمعين
        Object.entries(events).forEach(([event, callback]) => {
          service.off(event, callback);
        });
        service.off('message', setLastMessage);
        service.off('connected', () => setConnectionStatus('connected'));
        service.off('disconnected', () => setConnectionStatus('disconnected'));
      };
    }, []);

    return {
      lastMessage,
      connectionStatus,
      send: service.send.bind(service),
      subscribe: service.subscribe.bind(service),
      unsubscribe: service.unsubscribe.bind(service),
      disconnect: service.disconnect.bind(service),
      reconnect: service.reconnect.bind(service)
    };
  };
};

// إنشاء نسخة واحدة من الخدمة
const webSocketService = new WebSocketService();

// هوك مخصص للبوت
export const useBotWebSocket = createWebSocketHook(webSocketService);

// هوك مخصص للتداول
export const useTradingWebSocket = createWebSocketHook(webSocketService);

// هوك مخصص للإشعارات
export const useNotificationsWebSocket = createWebSocketHook(webSocketService);

// تصدير الخدمة الرئيسية
export default webSocketService;
