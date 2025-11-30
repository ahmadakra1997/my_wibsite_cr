/**
 * مسارات البوت التداولي المتقدمة
 * نظام متكامل لإدارة البوت التداولي مع أمان متقدم
 */

const express = require('express');
const router = express.Router();
const botController = require('../controllers/bot/botController');
const { authenticateToken, authorizeBotAccess } = require('../middleware/authMiddleware');
const { validateBotSettings } = require('../middleware/validationMiddleware');

// 🔐 تطبيق المصادقة على جميع مسارات البوت
router.use(authenticateToken);
router.use(authorizeBotAccess);

// 📊 مسارات حالة البوت وأدائه
router.get('/status', botController.getBotStatus);
router.get('/performance', botController.getPerformanceMetrics);
router.get('/analytics', botController.getTradingAnalytics);
router.get('/history', botController.getTradingHistory);
router.get('/metrics', botController.getLiveMetrics);

// ⚡ مسارات التحكم بالبوت
router.post('/activate', botController.activateBot);
router.post('/deactivate', botController.deactivateBot);
router.post('/restart', botController.restartBot);
router.post('/emergency-stop', botController.emergencyStop);

// ⚙️ مسارات إعدادات البوت
router.get('/settings', botController.getBotSettings);
router.put('/settings', validateBotSettings, botController.updateBotSettings);
router.post('/settings/reset', botController.resetBotSettings);
router.post('/settings/test', botController.testBotSettings);

// 🔗 مسارات الاتصال والاختبار
router.post('/test-connection', botController.testExchangeConnection);
router.get('/health', botController.getBotHealth);
router.post('/validate', botController.validateBotConfig);

// 📈 مسارات البيانات الإضافية
router.get('/pairs', botController.getTradingPairs);
router.get('/strategies', botController.getTradingStrategies);
router.get('/statistics', botController.getBotStatistics);
router.get('/logs', botController.getBotLogs);

// 🎯 مسارات الإدارة المتقدمة
router.post('/backup', botController.backupBotConfig);
router.post('/restore', botController.restoreBotConfig);
router.get('/version', botController.getBotVersion);

module.exports = router;
