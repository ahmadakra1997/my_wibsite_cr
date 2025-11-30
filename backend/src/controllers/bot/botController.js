/**
 * متحكم البوت التداولي المتقدم
 * إدارة شاملة للبوت مع معالجة متقدمة للأخطاء
 */

const BotService = require('../services/bot/botService');
const ResponseHandler = require('../../utils/responseHandler');
const ErrorHandler = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

class BotController {
    constructor() {
        this.botService = new BotService();
        this.responseHandler = new ResponseHandler();
        this.errorHandler = new ErrorHandler();
    }

    /**
     * جلب حالة البوت الحالية
     */
    async getBotStatus(req, res) {
        try {
            const userId = req.user.id;
            const botStatus = await this.botService.getBotStatus(userId);
            
            this.responseHandler.sendSuccess(res, 'تم جلب حالة البوت بنجاح', botStatus);
        } catch (error) {
            logger.error('خطأ في جلب حالة البوت:', error);
            this.errorHandler.handleError(res, error, 'BOT_STATUS_FETCH_FAILED');
        }
    }

    /**
     * تفعيل البوت
     */
    async activateBot(req, res) {
        try {
            const userId = req.user.id;
            const activationResult = await this.botService.activateBot(userId);
            
            // إرسال تحديث عبر WebSocket
            this.botService.broadcastStatusUpdate(userId, {
                type: 'bot_activated',
                timestamp: new Date(),
                data: activationResult
            });

            this.responseHandler.sendSuccess(res, 'تم تفعيل البوت بنجاح', activationResult);
        } catch (error) {
            logger.error('خطأ في تفعيل البوت:', error);
            this.errorHandler.handleError(res, error, 'BOT_ACTIVATION_FAILED');
        }
    }

    /**
     * إيقاف البوت
     */
    async deactivateBot(req, res) {
        try {
            const userId = req.user.id;
            const deactivationResult = await this.botService.deactivateBot(userId);
            
            // إرسال تحديث عبر WebSocket
            this.botService.broadcastStatusUpdate(userId, {
                type: 'bot_deactivated',
                timestamp: new Date(),
                data: deactivationResult
            });

            this.responseHandler.sendSuccess(res, 'تم إيقاف البوت بنجاح', deactivationResult);
        } catch (error) {
            logger.error('خطأ في إيقاف البوت:', error);
            this.errorHandler.handleError(res, error, 'BOT_DEACTIVATION_FAILED');
        }
    }

    /**
     * جلب مقاييس الأداء
     */
    async getPerformanceMetrics(req, res) {
        try {
            const userId = req.user.id;
            const { timeframe = '24h' } = req.query;
            
            const performance = await this.botService.getPerformanceMetrics(userId, timeframe);
            this.responseHandler.sendSuccess(res, 'تم جلب بيانات الأداء بنجاح', performance);
        } catch (error) {
            logger.error('خطأ في جلب مقاييس الأداء:', error);
            this.errorHandler.handleError(res, error, 'PERFORMANCE_FETCH_FAILED');
        }
    }

    /**
     * جلب سجل التداول
     */
    async getTradingHistory(req, res) {
        try {
            const userId = req.user.id;
            const { limit = 50, offset = 0 } = req.query;
            
            const history = await this.botService.getTradingHistory(userId, parseInt(limit), parseInt(offset));
            this.responseHandler.sendSuccess(res, 'تم جلب سجل التداول بنجاح', history);
        } catch (error) {
            logger.error('خطأ في جلب سجل التداول:', error);
            this.errorHandler.handleError(res, error, 'TRADING_HISTORY_FETCH_FAILED');
        }
    }

    /**
     * جلب إعدادات البوت
     */
    async getBotSettings(req, res) {
        try {
            const userId = req.user.id;
            const settings = await this.botService.getBotSettings(userId);
            
            this.responseHandler.sendSuccess(res, 'تم جلب الإعدادات بنجاح', settings);
        } catch (error) {
            logger.error('خطأ في جلب إعدادات البوت:', error);
            this.errorHandler.handleError(res, error, 'SETTINGS_FETCH_FAILED');
        }
    }

    /**
     * تحديث إعدادات البوت
     */
    async updateBotSettings(req, res) {
        try {
            const userId = req.user.id;
            const settings = req.body;
            
            const updatedSettings = await this.botService.updateBotSettings(userId, settings);
            
            // إرسال تحديث عبر WebSocket
            this.botService.broadcastStatusUpdate(userId, {
                type: 'settings_updated',
                timestamp: new Date(),
                data: updatedSettings
            });

            this.responseHandler.sendSuccess(res, 'تم تحديث الإعدادات بنجاح', updatedSettings);
        } catch (error) {
            logger.error('خطأ في تحديث إعدادات البوت:', error);
            this.errorHandler.handleError(res, error, 'SETTINGS_UPDATE_FAILED');
        }
    }

    /**
     * اختبار اتصال البوت
     */
    async testExchangeConnection(req, res) {
        try {
            const userId = req.user.id;
            const testResults = await this.botService.testExchangeConnection(userId);
            
            this.responseHandler.sendSuccess(res, 'تم اختبار الاتصال بنجاح', testResults);
        } catch (error) {
            logger.error('خطأ في اختبار اتصال البوت:', error);
            this.errorHandler.handleError(res, error, 'CONNECTION_TEST_FAILED');
        }
    }

    /**
     * جلب أزواج التداول
     */
    async getTradingPairs(req, res) {
        try {
            const pairs = await this.botService.getTradingPairs();
            this.responseHandler.sendSuccess(res, 'تم جلب أزواج التداول بنجاح', pairs);
        } catch (error) {
            logger.error('خطأ في جلب أزواج التداول:', error);
            this.errorHandler.handleError(res, error, 'PAIRS_FETCH_FAILED');
        }
    }

    /**
     * جلب الاستراتيجيات
     */
    async getTradingStrategies(req, res) {
        try {
            const strategies = await this.botService.getTradingStrategies();
            this.responseHandler.sendSuccess(res, 'تم جلب الاستراتيجيات بنجاح', strategies);
        } catch (error) {
            logger.error('خطأ في جلب الاستراتيجيات:', error);
            this.errorHandler.handleError(res, error, 'STRATEGIES_FETCH_FAILED');
        }
    }

    /**
     * جلب تحليلات التداول
     */
    async getTradingAnalytics(req, res) {
        try {
            const userId = req.user.id;
            const { timeframe = '24h' } = req.query;
            
            const analytics = await this.botService.getTradingAnalytics(userId, timeframe);
            this.responseHandler.sendSuccess(res, 'تم جلب التحليلات بنجاح', analytics);
        } catch (error) {
            logger.error('خطأ في جلب تحليلات التداول:', error);
            this.errorHandler.handleError(res, error, 'ANALYTICS_FETCH_FAILED');
        }
    }

    /**
     * جلب المقاييس الحية
     */
    async getLiveMetrics(req, res) {
        try {
            const userId = req.user.id;
            const metrics = await this.botService.getLiveMetrics(userId);
            this.responseHandler.sendSuccess(res, 'تم جلب المقاييس الحية بنجاح', metrics);
        } catch (error) {
            logger.error('خطأ في جلب المقاييس الحية:', error);
            this.errorHandler.handleError(res, error, 'METRICS_FETCH_FAILED');
        }
    }

    /**
     * إعادة تشغيل البوت
     */
    async restartBot(req, res) {
        try {
            const userId = req.user.id;
            const result = await this.botService.restartBot(userId);
            
            this.responseHandler.sendSuccess(res, 'تم إعادة تشغيل البوت بنجاح', result);
        } catch (error) {
            logger.error('خطأ في إعادة تشغيل البوت:', error);
            this.errorHandler.handleError(res, error, 'RESTART_FAILED');
        }
    }

    /**
     * إيقاف الطوارئ
     */
    async emergencyStop(req, res) {
        try {
            const userId = req.user.id;
            const result = await this.botService.emergencyStop(userId);
            
            this.responseHandler.sendSuccess(res, 'تم تنفيذ إيقاف الطوارئ بنجاح', result);
        } catch (error) {
            logger.error('خطأ في إيقاف الطوارئ:', error);
            this.errorHandler.handleError(res, error, 'EMERGENCY_STOP_FAILED');
        }
    }

    /**
     * إعادة تعيين الإعدادات
     */
    async resetBotSettings(req, res) {
        try {
            const userId = req.user.id;
            const defaultSettings = await this.botService.resetBotSettings(userId);
            
            this.responseHandler.sendSuccess(res, 'تم إعادة تعيين الإعدادات بنجاح', defaultSettings);
        } catch (error) {
            logger.error('خطأ في إعادة تعيين الإعدادات:', error);
            this.errorHandler.handleError(res, error, 'RESET_SETTINGS_FAILED');
        }
    }

    /**
     * اختبار الإعدادات
     */
    async testBotSettings(req, res) {
        try {
            const userId = req.user.id;
            const testResults = await this.botService.testBotSettings(userId);
            
            this.responseHandler.sendSuccess(res, 'تم اختبار الإعدادات بنجاح', testResults);
        } catch (error) {
            logger.error('خطأ في اختبار الإعدادات:', error);
            this.errorHandler.handleError(res, error, 'SETTINGS_TEST_FAILED');
        }
    }

    /**
     * جلب صحة البوت
     */
    async getBotHealth(req, res) {
        try {
            const userId = req.user.id;
            const health = await this.botService.getBotHealth(userId);
            
            this.responseHandler.sendSuccess(res, 'تم جلب صحة البوت بنجاح', health);
        } catch (error) {
            logger.error('خطأ في جلب صحة البوت:', error);
            this.errorHandler.handleError(res, error, 'HEALTH_FETCH_FAILED');
        }
    }

    /**
     * التحقق من تكوين البوت
     */
    async validateBotConfig(req, res) {
        try {
            const userId = req.user.id;
            const validation = await this.botService.validateBotConfig(userId);
            
            this.responseHandler.sendSuccess(res, 'تم التحقق من التكوين بنجاح', validation);
        } catch (error) {
            logger.error('خطأ في التحقق من تكوين البوت:', error);
            this.errorHandler.handleError(res, error, 'VALIDATION_FAILED');
        }
    }

    /**
     * جلب إحصائيات البوت
     */
    async getBotStatistics(req, res) {
        try {
            const userId = req.user.id;
            const statistics = await this.botService.getBotStatistics(userId);
            
            this.responseHandler.sendSuccess(res, 'تم جلب الإحصائيات بنجاح', statistics);
        } catch (error) {
            logger.error('خطأ في جلب إحصائيات البوت:', error);
            this.errorHandler.handleError(res, error, 'STATISTICS_FETCH_FAILED');
        }
    }

    /**
     * جلب سجلات البوت
     */
    async getBotLogs(req, res) {
        try {
            const userId = req.user.id;
            const { limit = 100, level = 'info' } = req.query;
            
            const logs = await this.botService.getBotLogs(userId, parseInt(limit), level);
            this.responseHandler.sendSuccess(res, 'تم جلب السجلات بنجاح', logs);
        } catch (error) {
            logger.error('خطأ في جلب سجلات البوت:', error);
            this.errorHandler.handleError(res, error, 'LOGS_FETCH_FAILED');
        }
    }

    /**
     * نسخ احتياطي للإعدادات
     */
    async backupBotConfig(req, res) {
        try {
            const userId = req.user.id;
            const backup = await this.botService.backupBotConfig(userId);
            
            this.responseHandler.sendSuccess(res, 'تم إنشاء النسخ الاحتياطي بنجاح', backup);
        } catch (error) {
            logger.error('خطأ في النسخ الاحتياطي:', error);
            this.errorHandler.handleError(res, error, 'BACKUP_FAILED');
        }
    }

    /**
     * استعادة الإعدادات
     */
    async restoreBotConfig(req, res) {
        try {
            const userId = req.user.id;
            const { backupId } = req.body;
            
            const restored = await this.botService.restoreBotConfig(userId, backupId);
            this.responseHandler.sendSuccess(res, 'تم استعادة الإعدادات بنجاح', restored);
        } catch (error) {
            logger.error('خطأ في استعادة الإعدادات:', error);
            this.errorHandler.handleError(res, error, 'RESTORE_FAILED');
        }
    }

    /**
     * جلب إصدار البوت
     */
    async getBotVersion(req, res) {
        try {
            const version = await this.botService.getBotVersion();
            this.responseHandler.sendSuccess(res, 'تم جلب الإصدار بنجاح', version);
        } catch (error) {
            logger.error('خطأ في جلب إصدار البوت:', error);
            this.errorHandler.handleError(res, error, 'VERSION_FETCH_FAILED');
        }
    }
}

module.exports = new BotController();
