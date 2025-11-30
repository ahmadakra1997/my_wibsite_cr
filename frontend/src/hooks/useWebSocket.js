import { useEffect, useRef, useState, useCallback } from 'react';

export const useWebSocket = (channel = null) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    try {
      // استخدام الإعدادات الحالية مع إضافة القيمة الافتراضية
      const socketUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
      
      console.log('🔄 محاولة الاتصال بـ WebSocket:', socketUrl);
      ws.current = new WebSocket(socketUrl);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // الاشتراك في القناة إذا تم تحديدها
        if (channel && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'subscribe',
            channel: channel
          }));
          console.log(`📡 مشترك في القناة: ${channel}`);
        }
      };

      ws.current.onmessage = (event) => {
        // console.log('📨 رسالة WebSocket مستلمة:', event.data);
        setLastMessage(event);
      };

      ws.current.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // إعادة الاتصال بعد 3 ثواني (بعد إزالة المهلة السابقة)
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
        reconnectTimeout.current = setTimeout(() => {
          console.log('🔄 إعادة محاولة الاتصال...');
          connect();
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
      setIsConnected(false);
    }
  }, [channel]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
      ws.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        const messageString = typeof message === 'string' ? message : JSON.stringify(message);
        ws.current.send(messageString);
        return true;
      } catch (error) {
        console.error('❌ Failed to send WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
      return false;
    }
  }, []);

  const subscribe = useCallback((newChannel) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        type: 'subscribe',
        channel: newChannel
      };
      return sendMessage(subscribeMessage);
    }
    return false;
  }, [sendMessage]);

  const unsubscribe = useCallback((unsubscribeChannel) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const unsubscribeMessage = {
        type: 'unsubscribe',
        channel: unsubscribeChannel
      };
      return sendMessage(unsubscribeMessage);
    }
    return false;
  }, [sendMessage]);

  // التأثير الرئيسي للإتصال وفصل الاتصال
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // تأثير منفصل لتحديث الاشتراك عند تغيير القناة
  useEffect(() => {
    if (isConnected && channel && ws.current?.readyState === WebSocket.OPEN) {
      subscribe(channel);
    }
  }, [channel, isConnected, subscribe]);

  return {
    lastMessage,
    isConnected,
    connectionStatus,
    sendMessage,
    subscribe,
    unsubscribe,
    disconnect,
    reconnect: connect
  };
};

// دالة مساعدة للتعامل مع رسائل WebSocket
export const parseWebSocketMessage = (messageEvent) => {
  try {
    if (!messageEvent || !messageEvent.data) return null;
    
    const data = JSON.parse(messageEvent.data);
    return {
      raw: messageEvent.data,
      parsed: data,
      type: data.type || 'unknown',
      timestamp: data.timestamp || Date.now(),
      channel: data.channel || null
    };
  } catch (error) {
    console.error('❌ Failed to parse WebSocket message:', error);
    return {
      raw: messageEvent?.data,
      parsed: null,
      type: 'parse_error',
      timestamp: Date.now(),
      error: error.message
    };
  }
};

// هوك مختصر للاستخدام السريع
export const useBotWebSocket = () => {
  return useWebSocket('bot-updates');
};

// هوك للإشعارات
export const useNotificationsWebSocket = () => {
  return useWebSocket('notifications');
};

// هوك للتداولات الحية
export const useTradingWebSocket = () => {
  return useWebSocket('trading');
};

export default useWebSocket;
