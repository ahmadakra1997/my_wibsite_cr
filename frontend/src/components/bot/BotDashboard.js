// frontend/src/components/bot/BotDashboard.js
import React, { useEffect } from 'react';
import { useBot } from '../../context/BotContext';
import BotActivation from './BotActivation';
import BotStatus from './BotStatus';
import BotPerformance from './BotPerformance';
import BotSettings from './BotSettings';
import BotHistory from './BotHistory';
import BotControls from './BotControls';

const BotDashboard = () => {
  const { 
    loadBotStatus, 
    loadBotPerformance, 
    loadBotHistory, 
    hasActiveBot,
    loading,
    error 
  } = useBot();

  // تحميل البيانات عند بدء التحميل
  useEffect(() => {
    loadBotStatus();
    loadBotPerformance();
    loadBotHistory();
  }, []);

  if (loading && !hasActiveBot) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mr-3">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🤖 بوت التداول التلقائي</h1>
        <p className="text-blue-100">
          نظام تداول ذكي يعمل تلقائياً بناءً على إستراتيجيتك المفضلة
        </p>
      </div>

      {/* رسائل الخطأ */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>خطأ: </strong> {error}
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العمود الأيسر - التحكم والحالة */}
        <div className="lg:col-span-1 space-y-6">
          {!hasActiveBot ? (
            <BotActivation />
          ) : (
            <>
              <BotStatus />
              <BotControls />
            </>
          )}
        </div>

        {/* العمود الأيمن - الإحصائيات والإعدادات */}
        <div className="lg:col-span-2 space-y-6">
          {hasActiveBot && (
            <>
              <BotPerformance />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BotSettings />
                <BotHistory />
              </div>
            </>
          )}
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="bg-gray-50 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">💡 كيف يعمل البوت؟</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-medium mb-1">تحليل السوق</h4>
            <p className="text-gray-600">يحلل البوت بيانات السوق باستمرار باستخدام خوارزميات الذكاء الاصطناعي</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-medium mb-1">اتخاذ القرار</h4>
            <p className="text-gray-600">يتخذ قرارات التداول بناءً على إستراتيجيتك وإعدادات المخاطرة</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="font-medium mb-1">تنفيذ تلقائي</h4>
            <p className="text-gray-600">ينفذ الصفقات تلقائياً على منصات التداول المربوطة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotDashboard;
