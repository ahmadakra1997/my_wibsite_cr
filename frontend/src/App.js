import React, { useState } from 'react';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import LivePerformance from './components/LivePerformance';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import LanguageSwitcher from './components/LanguageSwitcher';
import './App.css';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthModalOpen(false);
  };

  const handlePaymentClick = (plan) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  // بيانات الباقات المحدثة
  const plans = [
    {
      id: 'basic',
      name: 'الباقة الأساسية',
      price: 29,
      features: [
        '✅ إشارات تداول فورية',
        '✅ مؤشر Strong Akraa ICT القوي',
        '✅ تحليل فني وأساسي متقدم',
        '✅ مراقبة ذكية للأخبار',
        '❌ التداول الآلي الكامل',
        '❌ الذكاء الاصطناعي',
        '❌ فريمات الدقيقة والربع ساعة',
        '❌ دعم متعدد المنصات'
      ],
      popular: false,
      timeframe: '1h+ فقط',
      platforms: 'منصة واحدة',
      coins: '50 عملة',
      monitoring: '5 عملة'
    },
    {
      id: 'medium',
      name: 'الباقة المتوسطة',
      price: 99,
      features: [
        '✅ جميع ميزات الباقة الأساسية',
        '✅ التداول الآلي الكامل',
        '✅ دعم فريمات الدقيقة والربع ساعة',
        '✅ دعم 3 منصات تداول',
        '✅ 300 عملة مدعومة',
        '✅ مراقبة 15 عملة آنياً',
        '✅ الذكاء الاصطناعي الأساسي',
        '✅ إشعارات فورية'
      ],
      popular: true,
      timeframe: '1m, 15m, 1h, 4h',
      platforms: '3 منصات',
      coins: '300 عملة',
      monitoring: '15 عملة'
    },
    {
      id: 'professional',
      name: 'الباقة الاحترافية ',
      price: 149,
      features: [
        '✅ جميع ميزات الباقة المتوسطة',
        '✅ دعم 10 منصات تداول',
        '✅ مراقبة 30 عملة في الوقت الحقيقي',
        '✅ الذكاء الاصطناعي التكيفي المتقدم',
        '✅ تحليلات متقدمة في الوقت الفعلي',
        '✅ دعم فني مخصص 24/7',
        '✅ تقارير أداء مفصلة يومية',
        '✅ استشارات تداول أسبوعية'
      ],
      popular: false,
      timeframe: 'جميع الفريمات',
      platforms: '10 منصات',
      coins: 'جميع العملات',
      monitoring: '30 عملة'
    }
  ];

  return (
    <div className="App">
      <LanguageSwitcher />
      
      {/* أزرار التنقل العلوية */}
      {!user && (
        <button 
          onClick={() => setIsAuthModalOpen(true)}
          className="fixed top-4 right-4 z-50 bg-neon-blue text-quantum-blue font-bold px-6 py-3 rounded-xl hover:bg-neon-blue/90 transition-all duration-300 quantum-glow shadow-lg transform hover:scale-105"
        >
           تسجيل الدخول
        </button>
      )}

      {user && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button 
            onClick={() => handlePaymentClick('professional')}
            className="bg-neon-green text-quantum-blue font-bold px-6 py-3 rounded-xl hover:bg-neon-green/90 transition-all duration-300 quantum-glow shadow-lg transform hover:scale-105"
          >
            💳 اشتراك الآن
          </button>
          <button 
            onClick={() => setUser(null)}
            className="bg-neon-blue text-quantum-blue font-bold px-6 py-3 rounded-xl hover:bg-neon-blue/90 transition-all duration-300 quantum-glow shadow-lg"
          >
            👤 الملف الشخصي
          </button>
        </div>
      )}
      
      <HeroSection />
      <FeaturesSection />
      <LivePerformance />
      <Dashboard />

      {/* 🔥 قسم الباقات والاشتراكات المحدث */}
      <section id="pricing" className="py-20 bg-quantum-blue">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neon-blue quantum-glow mb-4">
              خطط الاشتراك الاحترافية
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              اختر الباقة المناسبة لمستوى تداولك واستفد من نظام QUANTUM AI TRADING PLATFORM المتقدم
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-steel-blue border-2 rounded-2xl p-8 relative transition-all duration-300 hover:transform hover:scale-105 h-full flex flex-col ${
                  plan.popular 
                    ? 'border-neon-green shadow-2xl shadow-neon-green/30 transform scale-105' 
                    : 'border-neon-blue/40 hover:border-neon-blue'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-neon-green text-quantum-blue font-bold px-6 py-2 rounded-full text-sm quantum-glow">
                       الأكثر طلباً
                    </span>
                  </div>
                )}

                {plan.id === 'professional' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-neon-purple text-white font-bold px-6 py-2 rounded-full text-sm quantum-glow">
                       موصى بها
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-5xl font-bold text-neon-blue">${plan.price}</span>
                    <span className="text-gray-400">/شهرياً</span>
                  </div>
                  
                  {/* المواصفات الفنية */}
                  <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                    <div className="bg-quantum-blue/50 rounded-lg p-2">
                      <div className="text-neon-blue font-bold"> الفريمات</div>
                      <div className="text-gray-300">{plan.timeframe}</div>
                    </div>
                    <div className="bg-quantum-blue/50 rounded-lg p-2">
                      <div className="text-neon-blue font-bold"> المنصات</div>
                      <div className="text-gray-300">{plan.platforms}</div>
                    </div>
                    <div className="bg-quantum-blue/50 rounded-lg p-2">
                      <div className="text-neon-blue font-bold"> العملات</div>
                      <div className="text-gray-300">{plan.coins}</div>
                    </div>
                    <div className="bg-quantum-blue/50 rounded-lg p-2">
                      <div className="text-neon-blue font-bold"> المراقبة</div>
                      <div className="text-gray-300">{plan.monitoring}</div>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className={`text-lg mt-1 ${feature.startsWith('✅') ? 'text-neon-green' : 'text-dark-red'}`}>
                        {feature.startsWith('✅') ? '✓' : '✗'}
                      </span>
                      <span className={`${feature.startsWith('✅') ? 'text-gray-300' : 'text-gray-500'} text-sm`}>
                        {feature.substring(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (!user) {
                      setIsAuthModalOpen(true);
                    } else {
                      setSelectedPlan(plan.id);
                      setIsPaymentModalOpen(true);
                    }
                  }}
                  className={`w-full py-4 font-bold rounded-xl transition-all duration-300 quantum-glow mt-auto ${
                    plan.popular
                      ? 'bg-neon-green text-quantum-blue hover:bg-neon-green/90 hover:scale-105'
                      : plan.id === 'professional'
                      ? 'bg-neon-purple text-white hover:bg-neon-purple/90 hover:scale-105'
                      : 'bg-neon-blue text-quantum-blue hover:bg-neon-blue/90'
                  }`}
                >
                  {!user 
                    ? ' سجل الدخول للاشتراك' 
                    : `🚀 ${plan.id === 'basic' ? 'ابدأ بالإشارات' : plan.id === 'medium' ? 'التداول الآلي الكامل' : 'المستوى الاحترافي'}`
                  }
                </button>
              </div>
            ))}
          </div>

          {/* ميزات إضافية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-steel-blue/50 rounded-2xl border border-neon-blue/20">
              <div className="text-3xl mb-3">🤖</div>
              <h4 className="text-neon-blue font-bold text-lg mb-2">ذكاء اصطناعي متقدم</h4>
              <p className="text-gray-300 text-sm">
                نظام QUANTUM AI TRADING PLATFORM المدعوم بالذكاء الاصطناعي التكيفي
              </p>
            </div>
            <div className="text-center p-6 bg-steel-blue/50 rounded-2xl border border-neon-blue/20">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="text-neon-blue font-bold text-lg mb-2">سرعة فائقة</h4>
              <p className="text-gray-300 text-sm">
                تنفيذ أوامر في أقل من 50 مللي ثانية على فريم الدقيقة
              </p>
            </div>
            <div className="text-center p-6 bg-steel-blue/50 rounded-2xl border border-neon-blue/20">
              <div className="text-3xl mb-3">🛡️</div>
              <h4 className="text-neon-blue font-bold text-lg mb-2">حماية متقدمة</h4>
              <p className="text-gray-300 text-sm">
                نظام إدارة مخاطر متطور وحماية من تقلبات السوق
              </p>
            </div>
          </div>

          {/* ملاحظة هامة */}
          <div className="text-center mt-12">
            <div className="bg-neon-green/10 border border-neon-green/30 rounded-xl p-6 max-w-2xl mx-auto">
              <h4 className="text-neon-green font-bold text-lg mb-2">🎯 ملاحظة هامة للتجار</h4>
              <p className="text-gray-300">
                <strong>الباقة الاحترافية موصى بها بشدة</strong> للمتداولين المحترفين - توفر مراقبة 30 عملة في الوقت الحقيقي 
                مع دعم 10 منصات تداول وذكاء اصطناعي تكيفي متقدم لتحقيق أقصى استفادة من نظام QUANTUM AI TRADING PLATFORM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* النماذج المنبثقة */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
}

export default App;