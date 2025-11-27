// backend/server.js - النسخة المتقدمة مع تكامل Python
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

// أنظمة الأمان المتقدمة
const CyberSecurityMonitor = require('./src/services/cyberSecurityMonitor');
const AntiReverseEngineering = require('./src/services/antiReverseEngineering');
const EncryptionService = require('./src/services/EncryptionService');

// مسارات API
const paymentRoutes = require('./src/routes/payment');
const authRoutes = require('./src/routes/auth');
const tradingRoutes = require('./src/routes/trading');
const clientRoutes = require('./src/routes/client');
const adminRoutes = require('./src/routes/admin');
const webhookRoutes = require('./src/routes/webhooks');

class QuantumTradeServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.port = process.env.PORT || 5000;
        this.pythonPort = process.env.PYTHON_PORT || 8000;
        this.env = process.env.NODE_ENV || 'development';
        this.securityMonitor = new CyberSecurityMonitor();
        this.antiReverse = new AntiReverseEngineering();
        this.encryptionService = new EncryptionService();
        
        // تكوين WebSocket للبيانات الحية
        this.tradingWebSocket = null;
        this.pythonWebSocket = null;
        this.connectedClients = new Map();
        
        this.initializeCoreSystems();
        this.setupSecurityInfrastructure();
        this.setupAdvancedMiddlewares();
        this.setupDatabaseConnection();
        this.setupPythonIntegration(); // ⭐ الإضافة الجديدة
        this.setupAPIRoutes();
        this.setupWebSocketBridge(); // ⭐ الإضافة الجديدة
        this.setupErrorHandlers();
        this.setupPerformanceMonitoring();
    }

    initializeCoreSystems() {
        // إنشاء هيكل المجلدات
        this.createDirectoryStructure();
        
        // بدء أنظمة المراقبة الأمنية
        this.securityMonitor.startRealTimeMonitoring();
        this.antiReverse.initializeAdvancedProtection();

        // تسجيل حدث بدء التشغيل المتقدم
        this.securityMonitor.logSecurityEvent('SERVER_INITIALIZATION', {
            timestamp: new Date().toISOString(),
            environment: this.env,
            version: '2.0.0',
            nodeVersion: process.version,
            platform: process.platform,
            pid: process.pid,
            pythonIntegration: true
        });

        console.log('🔧 بدء تهيئة الأنظمة الأساسية مع تكامل Python...');
    }

    createDirectoryStructure() {
        const directories = [
            './logs',
            './logs/security',
            './logs/performance', 
            './logs/errors',
            './logs/websocket',
            './uploads',
            './temp',
            './backups'
        ];

        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    setupSecurityInfrastructure() {
        // 🔒 أمان Helmet المتقدم
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https:"],
                    imgSrc: ["'self'", "data:", "https:", "blob:"],
                    connectSrc: ["'self'", "https:", "wss:", "ws:"],
                    fontSrc: ["'self'", "https:", "data:"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"],
                    workerSrc: ["'self'", "blob:"],
                    manifestSrc: ["'self'"]
                }
            },
            crossOriginEmbedderPolicy: { policy: "require-corp" },
            crossOriginOpenerPolicy: { policy: "same-origin" },
            crossOriginResourcePolicy: { policy: "same-site" },
            dnsPrefetchControl: { allow: false },
            frameguard: { action: "deny" },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            },
            ieNoOpen: true,
            noSniff: true,
            permittedCrossDomainPolicies: { permittedPolicies: "none" },
            referrerPolicy: { policy: "strict-origin-when-cross-origin" },
            xssFilter: true
        }));

        // 🛡️ تحديد معدل الطلبات المتقدم
        this.setupRateLimiting();

        // 🌍 تكوين CORS المحسن
        this.app.use(cors(this.getCorsConfig()));

        // 🔐 وسيط الأمان المخصص
        this.app.use(this.advancedSecurityMiddleware.bind(this));
    }

    setupRateLimiting() {
        const limiters = {
            general: rateLimit({
                windowMs: 15 * 60 * 1000,
                max: 200,
                message: {
                    error: 'طلبات كثيرة من هذا العنوان IP',
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: '15 دقيقة'
                },
                standardHeaders: true,
                legacyHeaders: false,
                skipSuccessfulRequests: false,
                keyGenerator: (req) => req.ip || req.connection.remoteAddress
            }),

            auth: rateLimit({
                windowMs: 60 * 60 * 1000,
                max: 10,
                message: {
                    error: 'محاولات تسجيل دخول كثيرة',
                    code: 'AUTH_RATE_LIMIT',
                    retryAfter: '60 دقيقة'
                },
                skipSuccessfulRequests: true
            }),

            api: rateLimit({
                windowMs: 1 * 60 * 1000,
                max: 50,
                message: {
                    error: 'طلبات API كثيرة',
                    code: 'API_RATE_LIMIT', 
                    retryAfter: '1 دقيقة'
                }
            }),

            payment: rateLimit({
                windowMs: 5 * 60 * 1000,
                max: 20,
                message: {
                    error: 'طلبات دفع كثيرة',
                    code: 'PAYMENT_RATE_LIMIT',
                    retryAfter: '5 دقائق'
                }
            }),

            websocket: rateLimit({
                windowMs: 1 * 60 * 1000,
                max: 30,
                message: {
                    error: 'طلبات WebSocket كثيرة',
                    code: 'WEBSOCKET_RATE_LIMIT',
                    retryAfter: '1 دقيقة'
                }
            })
        };

        // تطبيق محددات المعدل
        this.app.use('/api/', limiters.general);
        this.app.use('/api/auth/', limiters.auth);
        this.app.use('/api/trading/', limiters.api);
        this.app.use('/api/payment/', limiters.payment);
        this.app.use('/ws/', limiters.websocket);
    }

    getCorsConfig() {
        const allowedOrigins = this.env === 'production' 
            ? (process.env.ALLOWED_ORIGINS || 'https://yourdomain.com').split(',')
            : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'http://localhost:8000'];

        return {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    this.securityMonitor.logSecurityEvent('CORS_VIOLATION', {
                        origin,
                        timestamp: new Date().toISOString()
                    });
                    callback(new Error('غير مسموح به بواسطة CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type', 
                'Authorization', 
                'X-Requested-With',
                'X-API-Key',
                'X-Client-Version',
                'X-Device-ID',
                'X-Session-ID',
                'X-CSRF-Token'
            ],
            exposedHeaders: [
                'X-RateLimit-Limit',
                'X-RateLimit-Remaining',
                'X-RateLimit-Reset'
            ],
            maxAge: 86400,
            preflightContinue: false,
            optionsSuccessStatus: 204
        };
    }

    advancedSecurityMiddleware(req, res, next) {
        const requestId = this.generateRequestId();
        req.requestId = requestId;

        // إضافة رؤوس أمان متقدمة
        res.header('X-Request-ID', requestId);
        res.header('X-Content-Type-Options', 'nosniff');
        res.header('X-Frame-Options', 'DENY');
        res.header('X-XSS-Protection', '1; mode=block');
        res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
        res.header('X-Runtime', 'Node.js');

        // إزالة الرؤوس الخطرة
        res.removeHeader('X-Powered-By');
        res.removeHeader('Server');

        // فحص الطلبات المشبوهة
        if (this.detectSuspiciousActivity(req)) {
            this.securityMonitor.logSecurityEvent('SUSPICIOUS_ACTIVITY_DETECTED', {
                requestId,
                ip: req.ip,
                method: req.method,
                url: req.url,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
            });

            return res.status(429).json({
                error: 'نشاط مشبوه تم اكتشافه',
                code: 'SUSPICIOUS_ACTIVITY',
                requestId
            });
        }

        // تسجيل الطلب للأغراض الأمنية
        this.securityMonitor.logRequest(req);

        next();
    }

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    detectSuspiciousActivity(req) {
        const suspiciousPatterns = [
            /(\.\.\/|\.\.\\)/, // directory traversal
            /<script>|javascript:/i, // XSS attempts
            /union.*select|insert.*into|drop.*table/i, // SQL injection
            /exec\(|system\(|eval\(/i, // command execution
            /\/\.env|\/config|\/backup/i, // sensitive file access
            /phpmyadmin|adminer|webconfig/i // admin tools
        ];

        const userAgent = req.get('User-Agent') || '';
        const isSuspiciousUA = userAgent.includes('bot') || 
                              userAgent.includes('crawler') || 
                              userAgent.includes('scanner');

        return suspiciousPatterns.some(pattern => 
            pattern.test(req.url) || 
            pattern.test(JSON.stringify(req.body)) ||
            pattern.test(userAgent)
        ) || isSuspiciousUA;
    }

    setupAdvancedMiddlewares() {
        // 📊 تسجيل الطلبات المتقدم
        this.setupAdvancedLogging();

        // 🔄 ضغط الاستجابات
        this.app.use(compression({
            level: 6,
            threshold: 1024,
            filter: (req, res) => {
                if (req.headers['x-no-compression']) return false;
                return compression.filter(req, res);
            }
        }));

        // 📝 تحليل JSON المحسن
        this.app.use(express.json({ 
            limit: '10mb',
            verify: (req, res, buf) => {
                req.rawBody = buf;
                try {
                    JSON.parse(buf);
                } catch (e) {
                    this.securityMonitor.logSecurityEvent('INVALID_JSON_PAYLOAD', {
                        requestId: req.requestId,
                        ip: req.ip,
                        url: req.url,
                        error: e.message,
                        timestamp: new Date().toISOString()
                    });
                    res.status(400).json({ 
                        error: 'حمولة JSON غير صالحة',
                        code: 'INVALID_JSON',
                        requestId: req.requestId
                    });
                }
            }
        }));
        
        this.app.use(express.urlencoded({ 
            extended: true, 
            limit: '10mb',
            parameterLimit: 100
        }));

        // ⚡ وسيط الأداء
        this.app.use(this.performanceMiddleware.bind(this));
    }

    setupAdvancedLogging() {
        const logFormats = {
            combined: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
            security: ':date[iso] :method :url :status :res[content-length] :response-time ms :remote-addr :user-agent',
            websocket: ':date[iso] :client-id :event-type :message'
        };

        // سجل الوصول العام
        const accessLogStream = fs.createWriteStream(
            path.join(__dirname, 'logs/access.log'), 
            { flags: 'a' }
        );
        
        this.app.use(morgan(logFormats.combined, { 
            stream: accessLogStream,
            skip: (req) => req.url.includes('/health') || req.url.includes('/metrics')
        }));

        // سجل الأمان
        const securityLogStream = fs.createWriteStream(
            path.join(__dirname, 'logs/security/security.log'), 
            { flags: 'a' }
        );

        this.app.use(morgan(logFormats.security, { 
            stream: securityLogStream,
            skip: (req) => !this.isSecurityRelevant(req)
        }));

        // تسجيل المطور
        if (this.env !== 'production') {
            this.app.use(morgan('dev'));
        }
    }

    isSecurityRelevant(req) {
        const securityPaths = ['/auth', '/payment', '/admin', '/api/key', '/ws/'];
        return securityPaths.some(path => req.url.includes(path));
    }

    performanceMiddleware(req, res, next) {
        const start = process.hrtime();

        res.on('finish', () => {
            const duration = process.hrtime(start);
            const responseTime = duration[0] * 1000 + duration[1] / 1000000;

            // تسجيل الأداء للطلبات البطيئة
            if (responseTime > 1000) { // أكثر من 1 ثانية
                this.securityMonitor.logPerformanceIssue({
                    requestId: req.requestId,
                    url: req.url,
                    method: req.method,
                    responseTime,
                    timestamp: new Date().toISOString()
                });
            }
        });

        next();
    }

    async setupDatabaseConnection() {
        try {
            const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quantum_trade';
            
            const mongooseOptions = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                maxPoolSize: 20,
                minPoolSize: 5,
                retryWrites: true,
                w: 'majority',
                bufferCommands: false,
                bufferMaxEntries: 0,
                autoIndex: this.env !== 'production'
            };

            await mongoose.connect(MONGODB_URI, mongooseOptions);
            
            console.log('🔗 تم الاتصال بقاعدة البيانات بنجاح');
            
            // مستمعي أحداث قاعدة البيانات المتقدمة
            this.setupDatabaseEventListeners();

        } catch (error) {
            console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
            this.securityMonitor.logSecurityEvent('DATABASE_CONNECTION_FAILED', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
            process.exit(1);
        }
    }

    setupDatabaseEventListeners() {
        mongoose.connection.on('error', (err) => {
            console.error('❌ خطأ في اتصال قاعدة البيانات:', err);
            this.securityMonitor.logSecurityEvent('DATABASE_ERROR', {
                error: err.message,
                timestamp: new Date().toISOString()
            });
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ تم قطع اتصال قاعدة البيانات');
            this.securityMonitor.logSecurityEvent('DATABASE_DISCONNECTED', {
                timestamp: new Date().toISOString()
            });
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔁 تم إعادة الاتصال بقاعدة البيانات');
            this.securityMonitor.logSecurityEvent('DATABASE_RECONNECTED', {
                timestamp: new Date().toISOString()
            });
        });

        mongoose.connection.on('connected', () => {
            console.log('✅ اتصال قاعدة البيانات نشط');
        });
    }

    // ⭐ الإضافة الجديدة: تكامل Python
    setupPythonIntegration() {
        console.log('🔗 بدء تكامل محرك التداول Python...');

        // 🎯 Reverse Proxy لطلبات التداول إلى Python
        const tradingProxy = createProxyMiddleware({
            target: `http://localhost:${this.pythonPort}`,
            changeOrigin: true,
            pathRewrite: {
                '^/api/v1/trading': '/api/v1/trading'
            },
            on: {
                proxyReq: (proxyReq, req, res) => {
                    console.log(`🔄 توجيه طلب تداول إلى Python: ${req.method} ${req.url}`);
                    
                    // تسجيل حدث الأمان
                    this.securityMonitor.logSecurityEvent('TRADING_REQUEST_PROXY', {
                        requestId: req.requestId,
                        method: req.method,
                        url: req.url,
                        target: `http://localhost:${this.pythonPort}`,
                        timestamp: new Date().toISOString()
                    });
                },
                proxyRes: (proxyRes, req, res) => {
                    console.log(`✅ استجابة من Python: ${proxyRes.statusCode} ${req.url}`);
                },
                error: (err, req, res) => {
                    console.error('❌ خطأ في الاتصال مع Python:', err.message);
                    
                    this.securityMonitor.logSecurityEvent('PYTHON_CONNECTION_ERROR', {
                        requestId: req.requestId,
                        error: err.message,
                        timestamp: new Date().toISOString()
                    });

                    // استجابة بديلة عند تعطل Python
                    res.status(503).json({
                        error: 'خدمة التداول غير متاحة حالياً',
                        code: 'TRADING_SERVICE_UNAVAILABLE',
                        requestId: req.requestId,
                        fallback: true,
                        timestamp: new Date().toISOString()
                    });
                }
            },
            timeout: 30000,
            proxyTimeout: 30000
        });

        // 🎯 Proxy للبيانات الحية والتحليلات
        const liveDataProxy = createProxyMiddleware({
            target: `http://localhost:${this.pythonPort}`,
            changeOrigin: true,
            pathRewrite: {
                '^/api/v1/live': '/api/v1/live'
            },
            timeout: 15000
        });

        // 🎯 Proxy لإشارات الذكاء الاصطناعي
        const aiProxy = createProxyMiddleware({
            target: `http://localhost:${this.pythonPort}`,
            changeOrigin: true,
            pathRewrite: {
                '^/api/v1/ai': '/api/v1/ai'
            },
            timeout: 20000
        });

        // تطبيق الـ Proxies
        this.app.use('/api/v1/trading', tradingProxy);
        this.app.use('/api/v1/live', liveDataProxy);
        this.app.use('/api/v1/ai', aiProxy);

        console.log('✅ تم تكوين Reverse Proxy للتداول مع Python');
    }

    // ⭐ الإضافة الجديدة: جسر WebSocket للبيانات الحية
    setupWebSocketBridge() {
        // خادم WebSocket للعملاء (React)
        this.tradingWebSocket = new WebSocket.Server({ 
            server: this.server,
            path: '/ws/trading',
            perMessageDeflate: false,
            clientTracking: true
        });

        console.log('🔌 بدء جسر WebSocket للبيانات الحية...');

        this.tradingWebSocket.on('connection', (clientWs, request) => {
            const clientId = this.generateClientId();
            const clientIP = request.socket.remoteAddress;
            
            console.log(`🔗 عميل متصل WebSocket: ${clientId} من ${clientIP}`);

            // تخزين معلومات العميل
            this.connectedClients.set(clientId, {
                ws: clientWs,
                ip: clientIP,
                connectedAt: new Date(),
                lastActivity: new Date()
            });

            // تسجيل اتصال العميل
            this.securityMonitor.logSecurityEvent('WEBSOCKET_CLIENT_CONNECTED', {
                clientId,
                ip: clientIP,
                userAgent: request.headers['user-agent'],
                timestamp: new Date().toISOString()
            });

            // محاولة الاتصال بخادم Python WebSocket
            this.connectToPythonWebSocket(clientWs, clientId);

            clientWs.on('message', (message) => {
                try {
                    const parsedMessage = JSON.parse(message);
                    this.handleWebSocketMessage(clientWs, parsedMessage, clientId);
                    
                    // تحديث آخر نشاط
                    const clientInfo = this.connectedClients.get(clientId);
                    if (clientInfo) {
                        clientInfo.lastActivity = new Date();
                    }
                } catch (error) {
                    console.error('❌ خطأ في معالجة رسالة WebSocket:', error);
                    this.logWebSocketError(clientId, 'MESSAGE_PARSING_ERROR', error.message);
                }
            });

            clientWs.on('close', (code, reason) => {
                console.log(`🔌 عميل مقطوع WebSocket: ${clientId} (${code})`);
                this.cleanupClientConnection(clientId, code, reason);
            });

            clientWs.on('error', (error) => {
                console.error(`❌ خطأ WebSocket للعميل ${clientId}:`, error);
                this.logWebSocketError(clientId, 'CLIENT_ERROR', error.message);
                this.cleanupClientConnection(clientId, 1006, 'Client error');
            });

            // إرسال رسالة ترحيب
            this.sendToClient(clientId, {
                type: 'connection_established',
                clientId,
                timestamp: new Date().toISOString(),
                message: 'تم الاتصال بنجاح بخادم التداول',
                services: {
                    trading: true,
                    live_data: true,
                    ai_signals: true
                }
            });

            // بدء مراقبة النشاط
            this.startClientActivityMonitoring(clientId);
        });

        // محاولة الاتصال بخادم Python WebSocket عند البدء
        setTimeout(() => {
            this.connectToPythonWebSocketServer();
        }, 2000);

        console.log('✅ تم تهيئة جسر WebSocket');
    }

    // ⭐ الإضافة الجديدة: الاتصال بخادم Python WebSocket
    connectToPythonWebSocketServer() {
        const pythonWsUrl = `ws://localhost:${this.pythonPort}/ws/trading`;
        
        console.log(`🔄 محاولة الاتصال بخادم Python WebSocket: ${pythonWsUrl}`);
        
        try {
            this.pythonWebSocket = new WebSocket(pythonWsUrl, {
                handshakeTimeout: 10000,
                perMessageDeflate: false
            });

            this.pythonWebSocket.on('open', () => {
                console.log('✅ تم الاتصال بنجاح بخادم Python WebSocket');
                
                this.securityMonitor.logSecurityEvent('PYTHON_WEBSOCKET_CONNECTED', {
                    url: pythonWsUrl,
                    timestamp: new Date().toISOString()
                });

                // إعلام جميع العملاء المتصلين
                this.broadcastToClients({
                    type: 'service_status',
                    service: 'python_engine',
                    status: 'connected',
                    timestamp: new Date().toISOString()
                });
            });

            this.pythonWebSocket.on('message', (data) => {
                try {
                    // نقل البيانات من Python إلى جميع العملاء المتصلين
                    this.broadcastToClients(JSON.parse(data));
                    
                    // تسجيل للإحصاءات
                    this.securityMonitor.logSecurityEvent('PYTHON_WEBSOCKET_MESSAGE', {
                        messageType: JSON.parse(data).type,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    console.error('❌ خطأ في معالجة رسالة Python:', error);
                }
            });

            this.pythonWebSocket.on('close', (code, reason) => {
                console.warn('⚠️ تم قطع الاتصال بخادم Python WebSocket:', code, reason);
                
                this.securityMonitor.logSecurityEvent('PYTHON_WEBSOCKET_DISCONNECTED', {
                    code,
                    reason: reason.toString(),
                    timestamp: new Date().toISOString()
                });

                // إعلام جميع العملاء المتصلين
                this.broadcastToClients({
                    type: 'service_status',
                    service: 'python_engine',
                    status: 'disconnected',
                    timestamp: new Date().toISOString()
                });

                // إعادة الاتصال بعد 5 ثواني
                setTimeout(() => {
                    this.connectToPythonWebSocketServer();
                }, 5000);
            });

            this.pythonWebSocket.on('error', (error) => {
                console.error('❌ خطأ في اتصال Python WebSocket:', error);
                
                this.securityMonitor.logSecurityEvent('PYTHON_WEBSOCKET_ERROR', {
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            });

        } catch (error) {
            console.error('❌ فشل في إنشاء اتصال Python WebSocket:', error);
            
            // إعادة المحاولة بعد 10 ثواني
            setTimeout(() => {
                this.connectToPythonWebSocketServer();
            }, 10000);
        }
    }

    // ⭐ الإضافة الجديدة: الاتصال بـ Python WebSocket للعميل
    connectToPythonWebSocket(clientWs, clientId) {
        if (!this.pythonWebSocket || this.pythonWebSocket.readyState !== WebSocket.OPEN) {
            this.sendToClient(clientId, {
                type: 'service_unavailable',
                message: 'خدمة البيانات الحية غير متاحة حالياً',
                clientId,
                timestamp: new Date().toISOString(),
                retryIn: 5
            });
            return;
        }

        // إرسال رسالة تسجيل العميل إلى Python
        this.pythonWebSocket.send(JSON.stringify({
            type: 'client_connected',
            clientId,
            timestamp: new Date().toISOString()
        }));
    }

    // ⭐ الإضافة الجديدة: بث البيانات إلى العملاء
    broadcastToClients(data) {
        if (!this.tradingWebSocket || this.connectedClients.size === 0) return;

        const messageString = typeof data === 'string' ? data : JSON.stringify(data);

        this.connectedClients.forEach((clientInfo, clientId) => {
            if (clientInfo.ws.readyState === WebSocket.OPEN) {
                try {
                    clientInfo.ws.send(messageString);
                } catch (error) {
                    console.error(`❌ خطأ في بث البيانات للعميل ${clientId}:`, error);
                    this.cleanupClientConnection(clientId, 1011, 'Broadcast error');
                }
            }
        });
    }

    // ⭐ الإضافة الجديدة: إرسال رسالة إلى عميل محدد
    sendToClient(clientId, data) {
        const clientInfo = this.connectedClients.get(clientId);
        if (clientInfo && clientInfo.ws.readyState === WebSocket.OPEN) {
            try {
                clientInfo.ws.send(JSON.stringify(data));
            } catch (error) {
                console.error(`❌ خطأ في إرسال البيانات للعميل ${clientId}:`, error);
            }
        }
    }

    // ⭐ الإضافة الجديدة: معالجة رسائل WebSocket
    handleWebSocketMessage(clientWs, message, clientId) {
        const { type, data } = message;

        // تسجيل رسائل معينة للأمان
        if (type === 'subscribe' || type === 'unsubscribe') {
            this.securityMonitor.logSecurityEvent('WEBSOCKET_SUBSCRIPTION', {
                clientId,
                type,
                data,
                timestamp: new Date().toISOString()
            });
        }

        // نقل الرسائل إلى Python إذا كان متصلاً
        if (this.pythonWebSocket && this.pythonWebSocket.readyState === WebSocket.OPEN) {
            this.pythonWebSocket.send(JSON.stringify({
                ...message,
                clientId,
                timestamp: new Date().toISOString()
            }));
        } else {
            // إعلام العميل بأن Python غير متصل
            this.sendToClient(clientId, {
                type: 'error',
                message: 'خدمة التداول غير متاحة حالياً',
                originalType: type,
                timestamp: new Date().toISOString()
            });
        }
    }

    // ⭐ الإضافة الجديدة: تنظيف اتصال العميل
    cleanupClientConnection(clientId, code = 1000, reason = 'Normal closure') {
        const clientInfo = this.connectedClients.get(clientId);
        if (clientInfo) {
            // إعلام Python بقطع اتصال العميل
            if (this.pythonWebSocket && this.pythonWebSocket.readyState === WebSocket.OPEN) {
                this.pythonWebSocket.send(JSON.stringify({
                    type: 'client_disconnected',
                    clientId,
                    code,
                    reason,
                    timestamp: new Date().toISOString()
                }));
            }

            // إغلاق اتصال WebSocket
            if (clientInfo.ws.readyState === WebSocket.OPEN) {
                clientInfo.ws.close(code, reason);
            }

            // إزالة العميل من القائمة
            this.connectedClients.delete(clientId);

            this.securityMonitor.logSecurityEvent('WEBSOCKET_CLIENT_DISCONNECTED', {
                clientId,
                code,
                reason,
                duration: new Date() - clientInfo.connectedAt,
                timestamp: new Date().toISOString()
            });

            console.log(`🧹 تم تنظيف اتصال العميل: ${clientId}`);
        }
    }

    // ⭐ الإضافة الجديدة: مراقبة نشاط العميل
    startClientActivityMonitoring(clientId) {
        // فحص النشاط كل 30 ثانية
        const activityCheck = setInterval(() => {
            const clientInfo = this.connectedClients.get(clientId);
            if (!clientInfo) {
                clearInterval(activityCheck);
                return;
            }

            const inactiveTime = new Date() - clientInfo.lastActivity;
            if (inactiveTime > 300000) { // 5 دقائق بدون نشاط
                console.log(`⏰ فصل العميل ${clientId} بسبب عدم النشاط`);
                this.cleanupClientConnection(clientId, 1001, 'Inactivity timeout');
                clearInterval(activityCheck);
            }
        }, 30000);

        // تخزين معرف المؤقت للتنظيف لاحقاً
        const clientInfo = this.connectedClients.get(clientId);
        if (clientInfo) {
            clientInfo.activityCheckInterval = activityCheck;
        }
    }

    // ⭐ الإضافة الجديدة: تسجيل أخطاء WebSocket
    logWebSocketError(clientId, errorType, errorMessage) {
        const errorLog = {
            clientId,
            errorType,
            errorMessage,
            timestamp: new Date().toISOString()
        };

        const websocketLogStream = fs.createWriteStream(
            path.join(__dirname, 'logs/websocket/errors.log'), 
            { flags: 'a' }
        );

        websocketLogStream.write(JSON.stringify(errorLog) + '\n');
        websocketLogStream.end();

        this.securityMonitor.logSecurityEvent('WEBSOCKET_ERROR', errorLog);
    }

    // ⭐ الإضافة الجديدة: إنشاء معرف عميل فريد
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    setupAPIRoutes() {
        // 🏥 نقطة فحص الصحة المتقدمة
        this.app.get('/health', (req, res) => {
            const healthCheck = {
                status: 'OK',
                service: 'QUANTUM AI TRADER SERVER',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: this.env,
                version: '2.0.0',
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
                pythonIntegration: {
                    status: this.pythonWebSocket && this.pythonWebSocket.readyState === WebSocket.OPEN ? 'connected' : 'disconnected',
                    port: this.pythonPort
                },
                websocket: {
                    connectedClients: this.connectedClients.size,
                    pythonConnected: this.pythonWebSocket && this.pythonWebSocket.readyState === WebSocket.OPEN
                },
                security: {
                    monitoring: this.securityMonitor.isActive(),
                    reverseEngineering: this.antiReverse.isActive()
                }
            };

            res.status(200).json(healthCheck);
        });

        // 📊 نقطة المقاييس
        this.app.get('/metrics', (req, res) => {
            res.status(200).json(this.getSystemMetrics());
        });

        // 🛣️ مسارات API مع الإصدار
        this.app.use('/api/v1/auth', authRoutes);
        this.app.use('/api/v1/client', clientRoutes);
        this.app.use('/api/v1/payment', paymentRoutes);
        this.app.use('/api/v1/admin', adminRoutes);
        this.app.use('/api/v1/webhooks', webhookRoutes);

        // 🎯 معالج 404 المتقدم
        this.app.use('/api/*', (req, res) => {
            this.securityMonitor.logSecurityEvent('ENDPOINT_NOT_FOUND', {
                requestId: req.requestId,
                ip: req.ip,
                method: req.method,
                url: req.originalUrl,
                timestamp: new Date().toISOString()
            });

            res.status(404).json({
                error: 'النقطة المطلوبة غير موجودة',
                code: 'ENDPOINT_NOT_FOUND',
                path: req.originalUrl,
                requestId: req.requestId,
                suggestion: 'تحقق من التوثيق أو اتصل بالدعم',
                documentation: 'https://docs.akraa.com/api'
            });
        });
    }

    getSystemMetrics() {
        return {
            timestamp: new Date().toISOString(),
            process: {
                pid: process.pid,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                version: process.version,
                platform: process.platform
            },
            system: {
                loadavg: os.loadavg(),
                freemem: os.freemem(),
                totalmem: os.totalmem(),
                cpus: os.cpus().length,
                arch: os.arch()
            },
            database: {
                state: mongoose.connection.readyState,
                host: mongoose.connection.host,
                name: mongoose.connection.name
            },
            pythonIntegration: {
                websocket: this.pythonWebSocket ? {
                    state: this.pythonWebSocket.readyState,
                    connected: this.pythonWebSocket.readyState === WebSocket.OPEN
                } : null,
                port: this.pythonPort
            },
            websocket: {
                connectedClients: this.connectedClients.size,
                clientDetails: Array.from(this.connectedClients.entries()).map(([id, info]) => ({
                    id,
                    ip: info.ip,
                    connectedAt: info.connectedAt,
                    lastActivity: info.lastActivity
                }))
            },
            security: {
                totalRequests: this.securityMonitor.getRequestCount(),
                blockedRequests: this.securityMonitor.getBlockedCount(),
                lastIncident: this.securityMonitor.getLastIncident()
            }
        };
    }

    setupErrorHandlers() {
        // 🚨 معالج الأخطاء العام المتقدم
        this.app.use((error, req, res, next) => {
            console.error('🚨 معالج الأخطاء العام:', error);

            const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // تسجيل حدث الأمان المتقدم
            this.securityMonitor.logSecurityEvent('SERVER_ERROR', {
                errorId,
                requestId: req.requestId,
                error: error.message,
                stack: error.stack,
                url: req.url,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
            });

            // حفظ الخطأ في السجل
            this.logErrorToFile(error, req, errorId);

            // عدم كشف تفاصيل الخطأ في الإنتاج
            if (this.env === 'production') {
                return res.status(500).json({
                    error: 'خطأ داخلي في الخادم',
                    code: 'INTERNAL_ERROR',
                    errorId,
                    requestId: req.requestId,
                    support: 'support@akraa.com'
                });
            }

            res.status(500).json({
                error: error.message,
                stack: error.stack,
                code: 'INTERNAL_ERROR',
                errorId,
                requestId: req.requestId
            });
        });

        // 🚨 معالج رفض Promise غير المعالج
        process.on('unhandledRejection', (reason, promise) => {
            console.error('🚨 رفض Promise غير معالج:', reason);
            this.securityMonitor.logSecurityEvent('UNHANDLED_REJECTION', {
                reason: reason?.toString() || 'Unknown',
                timestamp: new Date().toISOString()
            });
        });

        // 🚨 معالج استثناء غير معالج
        process.on('uncaughtException', (error) => {
            console.error('🚨 استثناء غير معالج:', error);
            this.securityMonitor.logSecurityEvent('UNCAUGHT_EXCEPTION', {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            
            // الإغلاق الآمن
            this.gracefulShutdown('UNCAUGHT_EXCEPTION');
        });
    }

    logErrorToFile(error, req, errorId) {
        const errorLog = {
            errorId,
            requestId: req.requestId,
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            },
            request: {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                headers: req.headers
            }
        };

        const errorLogStream = fs.createWriteStream(
            path.join(__dirname, 'logs/errors/errors.log'), 
            { flags: 'a' }
        );

        errorLogStream.write(JSON.stringify(errorLog) + '\n');
        errorLogStream.end();
    }

    setupPerformanceMonitoring() {
        // مراقبة استخدام الذاكرة
        setInterval(() => {
            const memoryUsage = process.memoryUsage();
            if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
                this.securityMonitor.logPerformanceIssue({
                    type: 'HIGH_MEMORY_USAGE',
                    memoryUsage,
                    timestamp: new Date().toISOString()
                });
            }
        }, 60000); // كل دقيقة

        // مراقبة اتصالات WebSocket
        setInterval(() => {
            const websocketStats = {
                connectedClients: this.connectedClients.size,
                pythonConnected: this.pythonWebSocket && this.pythonWebSocket.readyState === WebSocket.OPEN,
                timestamp: new Date().toISOString()
            };

            if (websocketStats.connectedClients > 100) {
                this.securityMonitor.logPerformanceIssue({
                    type: 'HIGH_WEBSOCKET_CONNECTIONS',
                    stats: websocketStats,
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000); // كل 30 ثانية
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(this.getStartupBanner());
        });

        this.setupGracefulShutdown();
    }

    getStartupBanner() {
        return `
        
🚀 QUANTUM AI TRADER SERVER - الإصدار 2.0.0 مع تكامل Python

📍 المنفذ: ${this.port}
🐍 منفذ Python: ${this.pythonPort}
🌍 البيئة: ${this.env}
⚡ Node.js: ${process.version}
📦 PID: ${process.pid}

✅ الأنظمة المفعلة:
   🔒 مراقبة الأمان في الوقت الحقيقي
   🐍 تكامل محرك التداول Python
   🔌 جسر WebSocket للبيانات الحية
   🔄 Reverse Proxy لطلبات التداول
   🛡️ حماية متقدمة ضد الهندسة العكسية
   📊 مراقبة الأداء والتسجيل المتقدم

🔗 اتصالات الخدمة:
   📡 Node.js API: http://localhost:${this.port}
   🤖 Python Trading: http://localhost:${this.pythonPort}
   🔌 WebSocket: ws://localhost:${this.port}/ws/trading
   📊 قاعدة البيانات: ${mongoose.connection.readyState === 1 ? '🟢 متصل' : '🔴 غير متصل'}

🎯 مسارات التداول (موجهة إلى Python):
   • /api/v1/trading/* → Python Trading Engine
   • /api/v1/live/* → Python Live Data
   • /api/v1/ai/* → Python AI Analysis

🎯 مسارات الإدارة (في Node.js):
   • /api/v1/auth/* → إدارة المستخدمين
   • /api/v1/payment/* → نظام الدفع
   • /api/v1/client/* → إدارة العملاء
   • /api/v1/admin/* → لوحة التحكم

🔌 حالة WebSocket:
   • العملاء المتصلين: ${this.connectedClients.size}
   • اتصال Python: ${this.pythonWebSocket && this.pythonWebSocket.readyState === WebSocket.OPEN ? '🟢 نشط' : '🔴 غير متصل'}

==================================================

        `;
    }

    setupGracefulShutdown() {
        const shutdown = (signal) => {
            console.log(`\n\n📢 تم استقبال إشارة ${signal}. بدء الإغلاق الآمن...`);
            
            this.securityMonitor.logSecurityEvent('SERVER_SHUTDOWN_INITIATED', {
                signal,
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });

            // إغلاق جميع اتصالات العملاء
            console.log(`👋 إغلاق اتصالات ${this.connectedClients.size} عميل...`);
            this.connectedClients.forEach((clientInfo, clientId) => {
                this.cleanupClientConnection(clientId, 1001, 'Server shutdown');
            });

            // إغلاق اتصالات WebSocket
            if (this.tradingWebSocket) {
                this.tradingWebSocket.close();
                console.log('✅ تم إغلاق خادم WebSocket.');
            }

            if (this.pythonWebSocket) {
                this.pythonWebSocket.close();
                console.log('✅ تم إغلاق اتصال Python WebSocket.');
            }

            // إغلاق خادم HTTP
            this.server.close((err) => {
                if (err) {
                    console.error('❌ خطأ في إغلاق خادم HTTP:', err);
                } else {
                    console.log('✅ تم إغلاق خادم HTTP.');
                }

                // إغلاق اتصال قاعدة البيانات
                mongoose.connection.close(false, (dbErr) => {
                    if (dbErr) {
                        console.error('❌ خطأ في إغلاق قاعدة البيانات:', dbErr);
                    } else {
                        console.log('✅ تم إغلاق اتصال قاعدة البيانات.');
                    }

                    // إيقاف أنظمة المراقبة
                    this.securityMonitor.stopMonitoring();
                    console.log('✅ تم إيقاف مراقبة الأمان.');

                    console.log('👋 اكتمل الإغلاق الآمن.');
                    process.exit(err || dbErr ? 1 : 0);
                });
            });

            // الإغلاق القسري بعد 30 ثانية
            setTimeout(() => {
                console.error('❌ لم يتمكن من إغلاق الاتصالات في الوقت المحدد، إغلاق قسري');
                process.exit(1);
            }, 30000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGUSR2', () => shutdown('SIGUSR2'));
    }

    gracefulShutdown(reason) {
        console.log(`\n🔄 بدء الإغلاق الآمن بسبب: ${reason}`);
        this.setupGracefulShutdown()('AUTO_SHUTDOWN');
    }
}

// إنشاء وتشغيل الخادم
const server = new QuantumTradeServer();
server.start();

module.exports = server;