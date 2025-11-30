/**
 * التطبيق الرئيسي المتقدم - الإصدار 3.0
 * واجهة مستخدم محسنة مع أداء فائق وتجربة مستخدم استثنائية
 */

import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';

// Redux Store
import store from './store/store';

// إعدادات i18n للمترجم
import i18n from './i18n';

// خدمات الأداء والأمان
import PerformanceMonitor from './services/PerformanceMonitor';
import SecurityService from './services/SecurityService';
import ErrorTrackingService from './services/ErrorTrackingService';

// المكونات الأساسية
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorFallback from './components/common/ErrorFallback';
import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';
import MaintenanceMode from './components/common/MaintenanceMode';

// تحميل كسول للمكونات الثقيلة
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const TradingInterface = lazy(() => import('./components/trading/TradingInterface'));
const Analytics = lazy(() => import('./components/analytics/Analytics'));
const RiskManagement = lazy(() => import('./components/risk/RiskManagement'));
const Settings = lazy(() => import('./components/settings/Settings'));
const AuthModal = lazy(() => import('./components/auth/AuthModal'));

// 🆕 المكونات الجديدة للبوت
const BotActivation = lazy(() => import('./components/bot/BotActivation'));
const BotStatus = lazy(() => import('./components/bot/BotStatus'));

// مدير أداء التطبيق
const performanceMonitor = new PerformanceMonitor();
const securityService = new SecurityService();
const errorTracker = new ErrorTrackingService();

/**
 * المكون الرئيسي للتطبيق مع التحسينات المتقدمة
 */
function App() {
  // تأثيرات التهيئة
  useEffect(() => {
    // تهيئة خدمات المراقبة
    initializeMonitoringServices();
    
    // إعداد مستمعات الأخطاء
    setupErrorHandlers();
    
    // التحقق من صحة الجلسة
    validateUserSession();
    
    // تنظيف عند إلغاء التثبيت
    return () => {
      cleanupServices();
    };
  }, []);

  /**
   * تهيئة خدمات المراقبة والأداء
   */
  const initializeMonitoringServices = () => {
    try {
      // بدء مراقبة الأداء
      performanceMonitor.startMonitoring();
      
      // تهيئة تتبع الأخطاء
      errorTracker.initialize();
      
      // التحقق من إعدادات الأمان
      securityService.initializeSecurityChecks();
      
      console.log('✅ تم تهيئة خدمات المراقبة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تهيئة خدمات المراقبة:', error);
      errorTracker.captureException(error);
    }
  };

  /**
   * إعداد معالجة الأخطاء
   */
  const setupErrorHandlers = () => {
    // معالجة أخطاء غير متوقعة
    window.addEventListener('unhandledrejection', (event) => {
      errorTracker.captureException(event.reason);
      console.error('خطأ غير معالج:', event.reason);
    });

    // معالجة أخطاء الأحداث
    window.addEventListener('error', (event) => {
      errorTracker.captureException(event.error);
    });
  };

  /**
   * التحقق من صحة جلسة المستخدم
   */
  const validateUserSession = async () => {
    try {
      const isValid = await securityService.validateSession();
      if (!isValid) {
        console.warn('⚠️ جلسة المستخدم غير صالحة');
        // إعادة التوجيه للصفحة الرئيسية أو تسجيل الدخول
      }
    } catch (error) {
      console.error('❌ خطأ في التحقق من الجلسة:', error);
    }
  };

  /**
   * تنظيف الخدمات عند إلغاء التثبيت
   */
  const cleanupServices = () => {
    performanceMonitor.stopMonitoring();
    securityService.cleanup();
  };

  /**
   * معالج الأخطاء العالمي
   */
  const handleGlobalError = (error, errorInfo) => {
    console.error('🔥 خطأ عام في التطبيق:', error);
    errorTracker.captureException(error, { extra: errorInfo });
    
    // يمكن إضافة إخطار للمستخدم هنا
    // showNotification('error', 'حدث خطأ غير متوقع. يرجى تحديث الصفحة.');
  };

  /**
   * معالج استعادة التطبيق بعد الخطأ
   */
  const handleErrorReset = () => {
    window.location.reload();
  };

  // حالة الصيانة (يمكن التحكم فيها عبر البيئة)
  const isMaintenanceMode = process.env.REACT_APP_MAINTENANCE_MODE === 'true';

  // 🆕 تحميل المكونات المخبأة للاستخدام مع إضافة المكونات الجديدة
  const memoizedRoutes = useMemo(() => (
    <Routes>
      {/* المسار الافتراضي */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* المسارات الرئيسية */}
      <Route path="/dashboard" element={
        <Suspense fallback={<LoadingSpinner type="dashboard" />}>
          <Dashboard />
        </Suspense>
      } />
      
      <Route path="/trading" element={
        <Suspense fallback={<LoadingSpinner type="trading" />}>
          <TradingInterface />
        </Suspense>
      } />
      
      <Route path="/analytics" element={
        <Suspense fallback={<LoadingSpinner type="analytics" />}>
          <Analytics />
        </Suspense>
      } />
      
      <Route path="/risk" element={
        <Suspense fallback={<LoadingSpinner type="risk" />}>
          <RiskManagement />
        </Suspense>
      } />
      
      <Route path="/settings" element={
        <Suspense fallback={<LoadingSpinner type="settings" />}>
          <Settings />
        </Suspense>
      } />
      
      {/* 🆕 المسارات الجديدة لإدارة البوت */}
      <Route path="/bot/activation" element={
        <Suspense fallback={<LoadingSpinner type="bot" />}>
          <BotActivation />
        </Suspense>
      } />
      
      <Route path="/bot/status" element={
        <Suspense fallback={<LoadingSpinner type="bot" />}>
          <BotStatus />
        </Suspense>
      } />
      
      {/* مسار التعامل مع الصفحات غير الموجودة */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  ), []);

  // إذا كان في وضع الصيانة
  if (isMaintenanceMode) {
    return (
      <div className="app-maintenance">
        <MaintenanceMode />
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleGlobalError}
      onReset={handleErrorReset}
    >
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <Router>
            <div className="app-container" data-testid="app-container">
              {/* رأس التطبيق */}
              <AppHeader />
              
              {/* المحتوى الرئيسي */}
              <main className="app-main-content">
                {memoizedRoutes}
              </main>
              
              {/* 🆕 إضافة المكونات الجديدة للبوت في لوحة التحكم */}
              <div className="bot-management-section">
                <Suspense fallback={<LoadingSpinner type="bot" />}>
                  <div className="bot-components-grid">
                    <BotActivation />
                    <BotStatus />
                  </div>
                </Suspense>
              </div>
              
              {/* نافذة المصادقة (تظهر عند الحاجة) */}
              <Suspense fallback={<div />}>
                <AuthModal />
              </Suspense>
              
              {/* تذييل التطبيق */}
              <AppFooter />
            </div>
          </Router>
        </I18nextProvider>
      </Provider>
    </ErrorBoundary>
  );
}

// تحسينات الأداء الإضافية
export default React.memo(App);
