// frontend/src/services/botService.js
import api from './api';

class BotService {
  constructor() {
    this.baseURL = '/api/bot';
  }

  // تفعيل البوت
  async activateBot() {
    try {
      const response = await api.post(`${this.baseURL}/activate`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // الحصول على حالة البوت
  async getBotStatus() {
    try {
      const response = await api.get(`${this.baseURL}/status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // إيقاف البوت
  async stopBot(botId) {
    try {
      const response = await api.post(`${this.baseURL}/stop`, { botId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // تحديث إعدادات البوت
  async updateBotConfig(updates) {
    try {
      const response = await api.put(`${this.baseURL}/config`, updates);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // الحصول على أداء البوت
  async getBotPerformance() {
    try {
      const response = await api.get(`${this.baseURL}/performance`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // الحصول على سجل البوتات
  async getBotHistory() {
    try {
      const response = await api.get(`${this.baseURL}/history`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // التحقق من الأهلية
  async checkEligibility() {
    try {
      const response = await api.get(`${this.baseURL}/eligibility`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // إعادة تشغيل البوت
  async restartBot(botId) {
    try {
      const response = await api.post(`${this.baseURL}/restart`, { botId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // تحديث الإعدادات العامة
  async updateBotSettings(settings) {
    try {
      const response = await api.put(`${this.baseURL}/settings`, settings);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response?.data) {
      return new Error(error.response.data.message || 'حدث خطأ في الخادم');
    }
    return new Error('فشل في الاتصال بالخادم');
  }
}

export default new BotService();
