// backend/routes/botRoutes.js
const express = require('express');
const router = express.Router();
const botController = require('../controllers/botController');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// وساطة التحقق من الصلاحيات الإضافية
const checkBotPermissions = (req, res, next) => {
    // يمكن إضافة تحقق إضافي من صلاحيات البوت
    next();
};

// وساطة التحقق من صحة البيانات
const validateBotConfig = [
    body('tradingStrategy')
        .optional()
        .isIn(['scalping', 'day_trading', 'swing', 'arbitrage', 'market_making', 'custom'])
        .withMessage('إستراتيجية التداول غير صالحة'),
    body('riskLevel')
        .optional()
        .isIn(['low', 'medium', 'high', 'custom'])
        .withMessage('مستوى المخاطرة غير صالح'),
    body('riskManagement.stopLoss')
        .optional()
        .isFloat({ min: 0.1, max: 50 })
        .withMessage('وقف الخسارة يجب أن يكون بين 0.1 و 50'),
    body('riskManagement.takeProfit')
        .optional()
        .isFloat({ min: 0.1, max: 100 })
        .withMessage('جني الأرباح يجب أن يكون بين 0.1 و 100')
];

// معالج أخطاء التحقق
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'بيانات غير صالحة',
            errors: errors.array()
        });
    }
    next();
};

// 🔒 جميع مسارات البوت تتطلب مصادقة
router.use(auth);

// 📊 مسارات البوت الأساسية
router.post('/activate', botController.activateBot);
router.get('/status', botController.getBotStatus);
router.get('/performance', botController.getBotPerformance);
router.get('/history', botController.getBotHistory);
router.get('/eligibility', botController.checkEligibility);

// ⚙️ مسارات إدارة البوت
router.post('/stop', 
    [
        body('botId').notEmpty().withMessage('معرف البوت مطلوب')
    ],
    handleValidationErrors,
    botController.stopBot
);

router.put('/config',
    validateBotConfig,
    handleValidationErrors,
    botController.updateBotConfig
);

router.put('/settings',
    [
        body('autoCreate').optional().isBoolean(),
        body('defaultStrategy')
            .optional()
            .isIn(['scalping', 'day_trading', 'swing', 'arbitrage', 'market_making'])
    ],
    handleValidationErrors,
    botController.updateBotSettings
);

router.post('/restart',
    [
        body('botId').notEmpty().withMessage('معرف البوت مطلوب')
    ],
    handleValidationErrors,
    botController.restartBot
);

// 🩺 مسارات صحية للبوت
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'خدمة البوت تعمل بشكل طبيعي',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = router;
