/**
 * المخططات الحية المتقدمة - الإصدار 3.0
 * مخططات تداول متطورة مع تحليلات فورية وأداء محسن
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

// مكتبات المخططات
import { 
  createChart, 
  CrosshairMode,
  PriceScaleMode 
} from 'lightweight-charts';
import { TechnicalAnalysis } from '../../utils/technicalAnalysis';

// الخدمات
import WebSocketService from '../../services/websocketService';
import ChartDataService from '../../services/chartDataService';
import PerformanceMonitor from '../../services/PerformanceMonitor';

// المكونات
import ChartControls from './ChartControls';
import ChartIndicators from './ChartIndicators';
import TimeframeSelector from './TimeframeSelector';
import ChartLegend from './ChartLegend';
import LoadingState from '../common/LoadingState';

// الإجراءات
import { updateChartData, setChartLoading } from '../../store/tradingSlice';

/**
 * مكون المخططات الحية المتقدم
 */
const LiveCharts = ({ 
  symbols = ['BTCUSDT', 'ETHUSDT'],
  defaultSymbol = 'BTCUSDT',
  interval = '1h',
  height = 500,
  showControls = true,
  showIndicators = true,
  theme = 'dark'
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // المراجع
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const wsServiceRef = useRef(null);
  
  // الحالة
  const [currentSymbol, setCurrentSymbol] = useState(defaultSymbol);
  const [currentInterval, setCurrentInterval] = useState(interval);
  const [isChartReady, setIsChartReady] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [indicators, setIndicators] = useState({
    sma: true,
    ema: false,
    rsi: false,
    macd: false,
    bollinger: false
  });
  const [chartTheme, setChartTheme] = useState(theme);
  const [crosshairData, setCrosshairData] = useState(null);

  // الخدمات
  const chartDataService = useMemo(() => new ChartDataService(), []);
  const performanceMonitor = useMemo(() => new PerformanceMonitor(), []);
  const technicalAnalysis = useMemo(() => new TechnicalAnalysis(), []);

  // البيانات من Redux
  const { chartData: reduxChartData, isLoading } = useSelector(state => state.trading);

  /**
   * تهيئة المخطط
   */
  const initializeChart = useCallback(() => {
    if (!chartContainerRef.current) return;

    try {
      // تنظيف المخطط السابق إن وجد
      if (chartRef.current) {
        chartRef.current.remove();
      }

      // إنشاء المخطط الجديد
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: height,
        layout: {
          backgroundColor: chartTheme === 'dark' ? '#131722' : '#FFFFFF',
          textColor: chartTheme === 'dark' ? '#D9D9D9' : '#191919',
        },
        grid: {
          vertLines: { color: chartTheme === 'dark' ? '#2B2B43' : '#F0F3FA' },
          horzLines: { color: chartTheme === 'dark' ? '#2B2B43' : '#F0F3FA' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: chartTheme === 'dark' ? '#2B2B43' : '#E1ECF2',
          mode: PriceScaleMode.Normal,
        },
        timeScale: {
          borderColor: chartTheme === 'dark' ? '#2B2B43' : '#E1ECF2',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      // إضافة سلسلة الشموع
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // إضافة سلسلة الحجم
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      // حفظ المراجع
      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;
      volumeSeriesRef.current = volumeSeries;

      // إعداد مستمع الأحداث
      setupChartEvents(chart);

      setIsChartReady(true);
      
      // بدء مراقبة أداء المخطط
      performanceMonitor.startChartMonitoring();

    } catch (error) {
      console.error('❌ خطأ في تهيئة المخطط:', error);
    }
  }, [height, chartTheme, performanceMonitor]);

  /**
   * إعداد أحداث المخطط
   */
  const setupChartEvents = (chart) => {
    chart.subscribeCrosshairMove(param => {
      if (param.point) {
        handleCrosshairMove(param);
      }
    });

    chart.subscribeClick(param => {
      handleChartClick(param);
    });

    // إعادة التحجيم عند تغيير حجم النافذة
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    
    // تنظيف المستمع عند إلغاء التثبيت
    return () => window.removeEventListener('resize', handleResize);
  };

  /**
   * معالج حركة المؤشر
   */
  const handleCrosshairMove = useCallback((param) => {
    if (!param.time || !param.point) return;

    const price = param.seriesPrices.get(candlestickSeriesRef.current);
    if (price) {
      setCrosshairData({
        time: param.time,
        price: price,
        point: param.point,
      });
    }
  }, []);

  /**
   * معالج النقر على المخطط
   */
  const handleChartClick = useCallback((param) => {
    // يمكن إضافة وظائف إضافية هنا
    console.log('Chart clicked:', param);
  }, []);

  /**
   * تحميل بيانات المخطط
   */
  const loadChartData = useCallback(async (symbol, timeframe) => {
    try {
      dispatch(setChartLoading(true));

      const data = await chartDataService.getChartData(symbol, timeframe);
      
      // تطبيق المؤشرات التقنية
      const enhancedData = await applyTechnicalIndicators(data, indicators);
      
      setChartData(enhancedData);
      dispatch(updateChartData(enhancedData));

      // تحديث المخطط إذا كان جاهزاً
      if (candlestickSeriesRef.current && volumeSeriesRef.current) {
        candlestickSeriesRef.current.setData(enhancedData.candles);
        volumeSeriesRef.current.setData(enhancedData.volume);
      }

    } catch (error) {
      console.error('❌ خطأ في تحميل بيانات المخطط:', error);
    } finally {
      dispatch(setChartLoading(false));
    }
  }, [dispatch, chartDataService, indicators]);

  /**
   * تطبيق المؤشرات التقنية
   */
  const applyTechnicalIndicators = useCallback(async (data, activeIndicators) => {
    const enhancedData = { ...data };
    
    try {
      if (activeIndicators.sma) {
        enhancedData.indicators = {
          ...enhancedData.indicators,
          sma: technicalAnalysis.calculateSMA(data.candles, 20)
        };
      }

      if (activeIndicators.ema) {
        enhancedData.indicators = {
          ...enhancedData.indicators,
          ema: technicalAnalysis.calculateEMA(data.candles, 20)
        };
      }

      if (activeIndicators.rsi) {
        enhancedData.indicators = {
          ...enhancedData.indicators,
          rsi: technicalAnalysis.calculateRSI(data.candles, 14)
        };
      }

      if (activeIndicators.macd) {
        enhancedData.indicators = {
          ...enhancedData.indicators,
          macd: technicalAnalysis.calculateMACD(data.candles)
        };
      }

      if (activeIndicators.bollinger) {
        enhancedData.indicators = {
          ...enhancedData.indicators,
          bollinger: technicalAnalysis.calculateBollingerBands(data.candles, 20)
        };
      }

    } catch (error) {
      console.error('❌ خطأ في تطبيق المؤشرات التقنية:', error);
    }

    return enhancedData;
  }, [technicalAnalysis]);

  /**
   * إعداد خدمة WebSocket للبيانات الحية
   */
  const setupWebSocket = useCallback(() => {
    if (!wsServiceRef.current) {
      wsServiceRef.current = new WebSocketService();
    }

    wsServiceRef.current.connect({
      symbols: [currentSymbol],
      onCandleUpdate: (candleData) => {
        handleLiveCandleUpdate(candleData);
      },
      onPriceUpdate: (priceData) => {
        handleLivePriceUpdate(priceData);
      },
      onError: (error) => {
        console.error('WebSocket error in charts:', error);
      }
    });

    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
    };
  }, [currentSymbol]);

  /**
   * معالج تحديث الشمعة الحية
   */
  const handleLiveCandleUpdate = useCallback((candleData) => {
    if (!candlestickSeriesRef.current || candleData.symbol !== currentSymbol) return;

    // تحديث البيانات المحلية
    setChartData(prevData => {
      const newCandles = [...prevData.candles];
      const lastCandle = newCandles[newCandles.length - 1];
      
      if (lastCandle && lastCandle.time === candleData.time) {
        // تحديث الشمعة الحالية
        newCandles[newCandles.length - 1] = candleData;
      } else {
        // إضافة شمعة جديدة
        newCandles.push(candleData);
      }

      return { ...prevData, candles: newCandles };
    });

    // تحديث المخطط
    candlestickSeriesRef.current.update(candleData);
  }, [currentSymbol]);

  /**
   * معالج تحديث السعر الحي
   */
  const handleLivePriceUpdate = useCallback((priceData) => {
    // تحديث السعر الحي في وسيلة الإيضاح
    if (priceData.symbol === currentSymbol) {
      // يمكن تحديث واجهة السعر الحي هنا
    }
  }, [currentSymbol]);

  /**
   * تأثير التهيئة
   */
  useEffect(() => {
    initializeChart();
    
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
      performanceMonitor.stopChartMonitoring();
    };
  }, [initializeChart, performanceMonitor]);

  /**
   * تأثير تغيير الرمز أو الإطار الزمني
   */
  useEffect(() => {
    if (isChartReady) {
      loadChartData(currentSymbol, currentInterval);
      const cleanupWebSocket = setupWebSocket();
      
      return cleanupWebSocket;
    }
  }, [currentSymbol, currentInterval, isChartReady, loadChartData, setupWebSocket]);

  /**
   * تأثير تحديث البيانات من Redux
   */
  useEffect(() => {
    if (reduxChartData && reduxChartData.symbol === currentSymbol) {
      setChartData(reduxChartData);
    }
  }, [reduxChartData, currentSymbol]);

  /**
   * معالج تغيير الرمز
   */
  const handleSymbolChange = useCallback((newSymbol) => {
    setCurrentSymbol(newSymbol);
  }, []);

  /**
   * معالج تغيير الإطار الزمني
   */
  const handleTimeframeChange = useCallback((newTimeframe) => {
    setCurrentInterval(newTimeframe);
  }, []);

  /**
   * معالج تغيير المؤشرات
   */
  const handleIndicatorsChange = useCallback((newIndicators) => {
    setIndicators(newIndicators);
  }, []);

  /**
   * معالج تغيير السمة
   */
  const handleThemeChange = useCallback((newTheme) => {
    setChartTheme(newTheme);
  }, []);

  // عرض حالة التحميل
  if (isLoading && !chartData.length) {
    return (
      <LoadingState 
        type="chart" 
        message={t('charts.loading')}
        height={height}
      />
    );
  }

  return (
    <div className="live-charts-container" data-testid="live-charts">
      {/* رأس المخطط */}
      {showControls && (
        <div className="chart-header">
          <div className="chart-title">
            <h3>{currentSymbol} {t('charts.liveCharts')}</h3>
            <span className="chart-interval">{currentInterval}</span>
          </div>
          
          <div className="chart-controls">
            <ChartControls
              symbols={symbols}
              currentSymbol={currentSymbol}
              onSymbolChange={handleSymbolChange}
              theme={chartTheme}
              onThemeChange={handleThemeChange}
            />
            
            <TimeframeSelector
              currentTimeframe={currentInterval}
              onTimeframeChange={handleTimeframeChange}
            />
          </div>
        </div>
      )}

      {/* منطقة المخطط */}
      <div 
        ref={chartContainerRef}
        className="chart-container"
        style={{ height: `${height}px` }}
      />

      {/* وسيلة إيضاح المخطط */}
      <ChartLegend
        crosshairData={crosshairData}
        currentSymbol={currentSymbol}
        theme={chartTheme}
      />

      {/* مؤشرات التحليل التقني */}
      {showIndicators && (
        <ChartIndicators
          indicators={indicators}
          onIndicatorsChange={handleIndicatorsChange}
          indicatorData={chartData.indicators}
        />
      )}

      {/* معلومات الأداء (للتصحيح) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="chart-performance-debug">
          <performanceMonitor.ChartDebug />
        </div>
      )}
    </div>
  );
};

// أنواع مخصصة للاستخدام السريع
LiveCharts.TradingView = (props) => (
  <LiveCharts 
    showControls={true}
    showIndicators={true}
    height={600}
    {...props}
  />
);

LiveCharts.MiniView = (props) => (
  <LiveCharts 
    showControls={false}
    showIndicators={false}
    height={300}
    {...props}
  />
);

export default React.memo(LiveCharts);
