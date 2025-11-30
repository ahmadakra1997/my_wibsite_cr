/**
 * خدمات API المتقدمة - الإصدار 3.0
 * نظام متكامل للاتصال بالخادم مع إدارة متقدمة للأخطاء والأمان
 */

// 🔧 دوال الأمان والمساعدة
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Client-Version': '3.0.0',
    'X-Request-ID': `frontend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      error: 'خطأ في الشبكة أو الخادم',
      code: 'NETWORK_ERROR'
    }));
    
    throw new Error(errorData.error || `خطأ ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

const apiRequest = (url, options = {}) => {
  return fetch(url, {
    headers: getAuthHeaders(),
    ...options
  }).then(handleResponse);
};

// 🏦 خدمات الدفع الحالية (محفوظة)
export const paymentAPI = {
  processPayment: (paymentData) => 
    apiRequest('/api/payment/process', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    }),

  getPaymentHistory: () => 
    apiRequest('/api/payment/history'),

  getBalance: () => 
    apiRequest('/api/payment/balance'),

  withdrawFunds: (withdrawalData) => 
    apiRequest('/api/payment/withdraw', {
      method: 'POST',
      body: JSON.stringify(withdrawalData)
    })
};

// 🔐 خدمات المصادقة الحالية (محفوظة)
export const authAPI = {
  login: (credentials) => 
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (userData) => 
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  logout: () => 
    apiRequest('/api/auth/logout', {
      method: 'POST'
    }),

  refreshToken: () => 
    apiRequest('/api/auth/refresh-token', {
      method: 'POST'
    }),

  getProfile: () => 
    apiRequest('/api/auth/profile')
};

// 📈 خدمات التداول الحالية (محفوظة)
export const tradingAPI = {
  getMarketData: (symbol = 'BTC/USD') => 
    apiRequest(`/api/trading/market?symbol=${encodeURIComponent(symbol)}`),

  placeOrder: (orderData) => 
    apiRequest('/api/trading/order', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),

  cancelOrder: (orderId) => 
    apiRequest(`/api/trading/order/${orderId}`, {
      method: 'DELETE'
    }),

  getOpenOrders: () => 
    apiRequest('/api/trading/orders/open'),

  getOrderHistory: (limit = 50) => 
    apiRequest(`/api/trading/orders/history?limit=${limit}`)
};

// 📊 خدمات التحليلات الحالية (محفوظة)
export const analyticsAPI = {
  getPortfolioAnalytics: () => 
    apiRequest('/api/analytics/portfolio'),

  getPerformanceMetrics: (period = '1m') => 
    apiRequest(`/api/analytics/performance?period=${period}`),

  getRiskAssessment: () => 
    apiRequest('/api/analytics/risk'),

  getTradingInsights: () => 
    apiRequest('/api/analytics/insights')
};

// ⚙️ خدمات الإعدادات الحالية (محفوظة)
export const settingsAPI = {
  getUserSettings: () => 
    apiRequest('/api/settings/user'),

  updateUserSettings: (settings) => 
    apiRequest('/api/settings/user', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  getNotificationSettings: () => 
    apiRequest('/api/settings/notifications'),

  updateNotificationSettings: (settings) => 
    apiRequest('/api/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
};

// 🆕 خدمات البوت التداولي المتقدمة (المضافة)
export const botAPI = {
  // تفعيل/إيقاف البوت
  activateBot: () => 
    apiRequest('/api/bot/activate', {
      method: 'POST'
    }),

  deactivateBot: () => 
    apiRequest('/api/bot/deactivate', {
      method: 'POST'
    }),

  getBotStatus: () => 
    apiRequest('/api/bot/status'),

  // أداء البوت
  getPerformanceMetrics: (timeframe = '24h') => 
    apiRequest(`/api/bot/performance?timeframe=${timeframe}`),

  getTradingHistory: () => 
    apiRequest('/api/bot/history'),

  getTradingAnalytics: (timeframe = '24h') => 
    apiRequest(`/api/bot/analytics?timeframe=${timeframe}`),

  // إعدادات البوت
  getBotSettings: () => 
    apiRequest('/api/bot/settings'),

  updateBotSettings: (settings) => 
    apiRequest('/api/bot/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  resetBotSettings: () => 
    apiRequest('/api/bot/settings/reset', {
      method: 'POST'
    }),

  testBotConnection: () => 
    apiRequest('/api/bot/test-connection'),

  // بيانات إضافية
  getTradingPairs: () => 
    apiRequest('/api/bot/pairs'),

  getTradingStrategies: () => 
    apiRequest('/api/bot/strategies')
};

// 🔄 دوال مختصرة للاستخدام السهل (تشمل جميع الخدمات)
export const {
  // البوت
  activateBot,
  deactivateBot,
  getBotStatus,
  getPerformanceMetrics: getBotPerformanceMetrics,
  getTradingHistory: getBotTradingHistory,
  getTradingAnalytics: getBotTradingAnalytics,
  getBotSettings,
  updateBotSettings,
  resetBotSettings,
  testBotConnection,
  getTradingPairs,
  getTradingStrategies
} = botAPI;

export const {
  // الدفع
  processPayment,
  getPaymentHistory,
  getBalance,
  withdrawFunds
} = paymentAPI;

export const {
  // المصادقة
  login,
  register,
  logout,
  refreshToken,
  getProfile
} = authAPI;

export const {
  // التداول
  getMarketData,
  placeOrder,
  cancelOrder,
  getOpenOrders,
  getOrderHistory
} = tradingAPI;

export const {
  // التحليلات
  getPortfolioAnalytics,
  getPerformanceMetrics,
  getRiskAssessment,
  getTradingInsights
} = analyticsAPI;

export const {
  // الإعدادات
  getUserSettings,
  updateUserSettings,
  getNotificationSettings,
  updateNotificationSettings
} = settingsAPI;

// 🎯 تصدير عام لجميع الخدمات
export default {
  // المجموعات
  payment: paymentAPI,
  auth: authAPI,
  trading: tradingAPI,
  analytics: analyticsAPI,
  settings: settingsAPI,
  bot: botAPI,
  
  // الدوال الفردية
  activateBot,
  deactivateBot,
  getBotStatus,
  getBotPerformanceMetrics,
  getBotTradingHistory,
  getBotTradingAnalytics,
  getBotSettings,
  updateBotSettings,
  resetBotSettings,
  testBotConnection,
  getTradingPairs,
  getTradingStrategies,
  processPayment,
  getPaymentHistory,
  getBalance,
  withdrawFunds,
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  getMarketData,
  placeOrder,
  cancelOrder,
  getOpenOrders,
  getOrderHistory,
  getPortfolioAnalytics,
  getPerformanceMetrics,
  getRiskAssessment,
  getTradingInsights,
  getUserSettings,
  updateUserSettings,
  getNotificationSettings,
  updateNotificationSettings
};

// 🛡️ معالج الأخطاء العالمي
window.addEventListener('unhandledrejection', (event) => {
  console.error('خطأ غير معالج في API:', event.reason);
  
  // يمكن إضافة إخطار للمستخدم هنا
  if (event.reason.message?.includes('network') || event.reason.message?.includes('Network')) {
    console.warn('⚠️ مشكلة في الاتصال بالخادم');
  }
});
