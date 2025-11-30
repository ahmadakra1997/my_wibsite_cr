// frontend/src/hooks/useBotWebSocket.js
import { useState, useEffect, useRef } from 'react';

function useWebSocket(serviceType = 'trading') {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_WS_HOST || window.location.host;
    const wsUrl = `${protocol}//${host}/ws/${serviceType}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log(`✅ Connected to ${serviceType} WebSocket`);
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      setLastMessage(event);
    };

    ws.current.onclose = () => {
      console.log(`🔌 Disconnected from ${serviceType} WebSocket`);
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error(`❌ WebSocket error:`, error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [serviceType]);

  const sendMessage = (message) => {
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    lastMessage,
    sendMessage
  };
}

export default useWebSocket;
