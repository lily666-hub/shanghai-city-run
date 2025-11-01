import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeLocation } from '../types';
import { AmapLoader } from '../utils/amapLoader';

interface EnhancedGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  trackingInterval?: number;
  useAmapFirst?: boolean; // 是否优先使用高德定位
}

interface UseEnhancedGeolocationReturn {
  location: RealtimeLocation | null;
  error: string | null;
  isTracking: boolean;
  accuracy: number | null;
  locationMethod: 'amap' | 'browser' | 'default' | null;
  startTracking: () => void;
  stopTracking: () => void;
  getCurrentPosition: () => Promise<RealtimeLocation>;
  getFormattedLocation: () => Promise<{
    latitude: number;
    longitude: number;
    address: string;
    accuracy?: number;
    method: string;
  }>;
}

// 默认位置（上海市中心）
const DEFAULT_POSITION = {
  latitude: 31.2304,
  longitude: 121.4737,
  address: '上海市中心（默认位置）'
};

export const useEnhancedGeolocation = (options: EnhancedGeolocationOptions = {}): UseEnhancedGeolocationReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 300000, // 5分钟缓存
    trackingInterval = 5000,
    useAmapFirst = true
  } = options;

  const [location, setLocation] = useState<RealtimeLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locationMethod, setLocationMethod] = useState<'amap' | 'browser' | 'default' | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const amapGeoRef = useRef<any>(null);

  // 检查高德地图API是否可用
  const isAmapAvailable = useCallback(() => {
    const available = typeof window !== 'undefined' && window.AMap;
    console.log('🗺️ 高德地图API可用性检查:', {
      windowExists: typeof window !== 'undefined',
      amapExists: !!window.AMap,
      available
    });
    return available;
  }, []);

  // 高德地图定位
  const getAmapLocation = useCallback((): Promise<RealtimeLocation> => {
    return new Promise(async (resolve, reject) => {
      console.log('🗺️ 开始高德地图定位...');
      
      try {
        // 首先确保高德地图API已加载
        await AmapLoader.loadAmap();
        console.log('✅ 高德地图API加载确认完成');
      } catch (loadError) {
        console.error('❌ 高德地图API加载失败:', loadError);
        reject(new Error(`高德地图API加载失败: ${loadError.message}`));
        return;
      }
      
      if (!isAmapAvailable()) {
        const error = new Error('高德地图API不可用');
        console.error('❌ 高德地图API检查失败:', error);
        reject(error);
        return;
      }

      console.log('🔌 加载高德地图定位插件...');
      window.AMap.plugin('AMap.Geolocation', () => {
        console.log('✅ 高德地图定位插件加载成功');
        
        const geolocation = new window.AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: timeout,
          maximumAge: maximumAge,
          showButton: false,
          showMarker: false,
          panToLocation: false
        });

        amapGeoRef.current = geolocation;
        console.log('⚙️ 高德定位配置:', {
          enableHighAccuracy: true,
          timeout,
          maximumAge
        });

        geolocation.getCurrentPosition((status: string, result: any) => {
          console.log('📍 高德定位回调:', { status, result });
          
          if (status === 'complete') {
            const position: RealtimeLocation = {
              latitude: result.position.lat,
              longitude: result.position.lng,
              altitude: result.position.altitude || null,
              accuracy: result.accuracy || null,
              speed: null,
              heading: null,
              timestamp: new Date()
            };
            
            console.log('✅ 高德定位成功:', position);
            setLocationMethod('amap');
            resolve(position);
          } else {
            const errorMsg = `高德定位失败: ${result?.message || result?.info || status}`;
            console.warn('⚠️ 高德定位失败:', { status, result, errorMsg });
            reject(new Error(errorMsg));
          }
        });
      });
    });
  }, [timeout, maximumAge, isAmapAvailable]);

  // 浏览器原生定位
  const getBrowserLocation = useCallback((): Promise<RealtimeLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理定位'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy,
        timeout,
        maximumAge
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: RealtimeLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading,
            timestamp: new Date(position.timestamp)
          };
          
          console.log('✅ 浏览器定位成功:', location);
          setLocationMethod('browser');
          resolve(location);
        },
        (error) => {
          console.warn('⚠️ 浏览器定位失败:', error);
          reject(new Error(`浏览器定位失败: ${error.message}`));
        },
        options
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge]);

  // 多层定位策略
  const getCurrentPosition = useCallback(async (): Promise<RealtimeLocation> => {
    console.log('🗺️ 开始多层定位...');
    
    try {
      // 第一层：尝试高德定位
      if (useAmapFirst && isAmapAvailable()) {
        try {
          const amapLocation = await getAmapLocation();
          setLocation(amapLocation);
          setAccuracy(amapLocation.accuracy);
          setError(null);
          return amapLocation;
        } catch (amapError) {
          console.warn('高德定位失败，尝试浏览器定位...', amapError);
        }
      }

      // 第二层：尝试浏览器定位
      try {
        const browserLocation = await getBrowserLocation();
        setLocation(browserLocation);
        setAccuracy(browserLocation.accuracy);
        setError(null);
        return browserLocation;
      } catch (browserError) {
        console.warn('浏览器定位失败，使用默认位置...', browserError);
      }

      // 第三层：使用默认位置
      const defaultLocation: RealtimeLocation = {
        latitude: DEFAULT_POSITION.latitude,
        longitude: DEFAULT_POSITION.longitude,
        altitude: null,
        accuracy: null,
        speed: null,
        heading: null,
        timestamp: new Date()
      };

      console.log('🏙️ 使用默认位置:', defaultLocation);
      setLocationMethod('default');
      setLocation(defaultLocation);
      setAccuracy(null);
      setError('无法获取精确位置，已使用默认位置');
      
      return defaultLocation;
    } catch (error) {
      console.error('❌ 定位完全失败:', error);
      setError('定位服务不可用');
      throw error;
    }
  }, [useAmapFirst, isAmapAvailable, getAmapLocation, getBrowserLocation]);

  // 获取格式化的位置信息（用于RouteAgent）
  const getFormattedLocation = useCallback(async () => {
    try {
      const position = await getCurrentPosition();
      
      let address = '';
      let method = '';
      
      switch (locationMethod) {
        case 'amap':
          address = `高德定位: 纬度 ${position.latitude.toFixed(4)}, 经度 ${position.longitude.toFixed(4)}`;
          method = '高德地图定位';
          break;
        case 'browser':
          address = `浏览器定位: 纬度 ${position.latitude.toFixed(4)}, 经度 ${position.longitude.toFixed(4)}`;
          method = '浏览器定位';
          break;
        case 'default':
          address = DEFAULT_POSITION.address;
          method = '默认位置';
          break;
        default:
          address = `纬度 ${position.latitude.toFixed(4)}, 经度 ${position.longitude.toFixed(4)}`;
          method = '未知定位方式';
      }

      return {
        latitude: position.latitude,
        longitude: position.longitude,
        address,
        accuracy: position.accuracy || undefined,
        method
      };
    } catch (error) {
      // 如果所有定位都失败，返回默认位置
      return {
        latitude: DEFAULT_POSITION.latitude,
        longitude: DEFAULT_POSITION.longitude,
        address: DEFAULT_POSITION.address,
        method: '默认位置（定位失败）'
      };
    }
  }, [getCurrentPosition, locationMethod]);

  // 开始位置追踪
  const startTracking = useCallback(() => {
    if (isTracking) return;

    setIsTracking(true);
    
    // 立即获取一次位置
    getCurrentPosition().catch(console.error);

    // 设置定期更新
    intervalIdRef.current = setInterval(() => {
      getCurrentPosition().catch(console.error);
    }, trackingInterval);

    // 如果支持，使用watchPosition进行实时追踪
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const location: RealtimeLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading,
            timestamp: new Date(position.timestamp)
          };
          
          setLocation(location);
          setAccuracy(position.coords.accuracy);
          setLocationMethod('browser');
        },
        (error) => {
          console.warn('位置追踪错误:', error);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge
        }
      );
    }
  }, [isTracking, getCurrentPosition, trackingInterval, enableHighAccuracy, timeout, maximumAge]);

  // 停止位置追踪
  const stopTracking = useCallback(() => {
    setIsTracking(false);

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    location,
    error,
    isTracking,
    accuracy,
    locationMethod,
    startTracking,
    stopTracking,
    getCurrentPosition,
    getFormattedLocation
  };
};