// frontend/src/context/BotContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import botService from '../services/botService';
import useWebSocket from '../hooks/useBotWebSocket';

// أنواع الإجراءات
const BOT_ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_BOT_STATUS: 'SET_BOT_STATUS',
  SET_BOT_PERFORMANCE: 'SET_BOT_PERFORMANCE',
  SET_BOT_HISTORY: 'SET_BOT_HISTORY',
  UPDATE_BOT_CONFIG: 'UPDATE_BOT_CONFIG',
  RESET_BOT: 'RESET_BOT'
};

// الحالة الابتدائية
const initialState = {
  loading: false,
  error: null,
  botStatus: null,
  botPerformance: null,
  botHistory: [],
  isConnected: false,
  realTimeData: null
};

// Reducer لإدارة الحالة
function botReducer(state, action) {
  switch (action.type) {
    case BOT_ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case BOT_ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case BOT_ACTION_TYPES.SET_BOT_STATUS:
      return { 
        ...state, 
        botStatus: action.payload,
        error: null,
        loading: false 
      };
    
    case BOT_ACTION_TYPES.SET_BOT_PERFORMANCE:
      return { 
        ...state, 
        botPerformance: action.payload,
        error: null 
      };
    
    case BOT_ACTION_TYPES.SET_BOT_HISTORY:
      return { 
        ...state, 
        botHistory: action.payload,
        error: null 
      };
    
    case BOT_ACTION_TYPES.UPDATE_BOT_CONFIG:
      return {
        ...state,
        botStatus: {
          ...state.botStatus,
          configuration: {
            ...state.botStatus.configuration,
            ...action.payload
          }
        }
      };
    
    case BOT_ACTION_TYPES.RESET_BOT:
      return initialState;
    
    default:
      return state;
  }
}

// إنشاء Context
const BotContext = createContext();

// مقدم السياق
export function BotProvider({ children }) {
  const [state, dispatch] = useReducer(botReducer, initialState);
  
  // استخدام WebSocket للبيانات الحية
  const { isConnected, lastMessage } = useWebSocket('bot');

  // تحديث البيانات الحية من WebSocket
  useEffect(() => {
    if (lastMessage) {
      const message = JSON.parse(lastMessage.data);
      
      switch (message.type) {
        case 'bot_status_update':
          dispatch({
            type: BOT_ACTION_TYPES.SET_BOT_STATUS,
            payload: message.data
          });
          break;
        
        case 'bot_performance_update':
          dispatch({
            type: BOT_ACTION_TYPES.SET_BOT_PERFORMANCE,
            payload: message.data
          });
          break;
        
        case 'bot_trade_executed':
          // تحديث الإحصائيات عند تنفيذ صفقة جديدة
          loadBotPerformance();
          break;
      }
    }
  }, [lastMessage]);

  // تحميل حالة البوت
  const loadBotStatus = async () => {
    try {
      dispatch({ type: BOT_ACTION_TYPES.SET_LOADING, payload: true });
      const response = await botService.getBotStatus();
      dispatch({
        type: BOT_ACTION_TYPES.SET_BOT_STATUS,
        payload: response.data
      });
    } catch (error) {
      dispatch({
        type: BOT_ACTION_TYPES.SET_ERROR,
        payload: error.message
      });
    }
  };

  // تفعيل البوت
  const activateBot = async () => {
    try {
      dispatch({ type: BOT_ACTION_TYPES.SET_LOADING, payload: true });
      const response = await botService.activateBot();
      dispatch({
        type: BOT_ACTION_TYPES.SET_BOT_STATUS,
        payload: response.data
      });
      return response;
    } catch (error) {
      dispatch({
        type: BOT_ACTION_TYPES.SET_ERROR,
        payload: error.message
      });
      throw error;
    }
  };

  // إيقاف البوت
  const stopBot = async (botId) => {
    try {
      dispatch({ type: BOT_ACTION_TYPES.SET_LOADING, payload: true });
      const response = await botService.stopBot(botId);
      dispatch({
        type: BOT_ACTION_TYPES.SET_BOT_STATUS,
        payload: response.data
      });
      return response;
    } catch (error) {
      dispatch({
        type: BOT_ACTION_TYPES.SET_ERROR,
        payload: error.message
      });
      throw error;
    }
  };

  // تحميل أداء البوت
  const loadBotPerformance = async () => {
    try {
      const response = await botService.getBotPerformance();
      dispatch({
        type: BOT_ACTION_TYPES.SET_BOT_PERFORMANCE,
        payload: response.data
      });
    } catch (error) {
      dispatch({
        type: BOT_ACTION_TYPES.SET_ERROR,
        payload: error.message
      });
    }
  };

  // تحميل سجل البوتات
  const loadBotHistory = async () => {
    try {
      const response = await botService.getBotHistory();
      dispatch({
        type: BOT_ACTION_TYPES.SET_BOT_HISTORY,
        payload: response.data.history
      });
    } catch (error) {
      dispatch({
        type: BOT_ACTION_TYPES.SET_ERROR,
        payload: error.message
      });
    }
  };

  // تحديث إعدادات البوت
  const updateBotConfig = async (updates) => {
    try {
      const response = await botService.updateBotConfig(updates);
      dispatch({
        type: BOT_ACTION_TYPES.UPDATE_BOT_CONFIG,
        payload: updates
      });
      return response;
    } catch (error) {
      dispatch({
        type: BOT_ACTION_TYPES.SET_ERROR,
        payload: error.message
      });
      throw error;
    }
  };

  // التحقق من الأهلية
  const checkEligibility = async () => {
    try {
      const response = await botService.checkEligibility();
      return response.data;
    } catch (error) {
      return { eligible: false, message: error.message };
    }
  };

  const value = {
    // الحالة
    ...state,
    isConnected,
    
    // الإجراءات
    loadBotStatus,
    activateBot,
    stopBot,
    loadBotPerformance,
    loadBotHistory,
    updateBotConfig,
    checkEligibility,
    
    // مساعدات
    hasActiveBot: state.botStatus?.hasActiveBot || false,
    botId: state.botStatus?.botId,
    botName: state.botStatus?.botName,
    botUrl: state.botStatus?.botUrl
  };

  return (
    <BotContext.Provider value={value}>
      {children}
    </BotContext.Provider>
  );
}

// Hook مخصص لاستخدام السياق
export function useBot() {
  const context = useContext(BotContext);
  if (!context) {
    throw new Error('useBot must be used within a BotProvider');
  }
  return context;
}

export default BotContext;
