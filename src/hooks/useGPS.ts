import { useState, useEffect, useRef, useCallback } from 'react';

interface GPSPosition {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

interface UseGPSOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  trackingInterval?: number;
  autoInitialize?: boolean;
}

interface UseGPSReturn {
  currentPosition: GPSPosition | null;
  positions: GPSPosition[];
  isTracking: boolean;
  isGPSReady: boolean;
  error: string | null;
  accuracy: number | null;
  permissionStatus: string | null;
  connectionAttempts: number;
  startTracking: () => void;
  stopTracking: () => void;
  clearPositions: () => void;
  getDistance: () => number;
  getAverageSpeed: () => number;
  getDuration: () => number;
  initializeGPS: () => void;
  requestPermission: () => Promise<void>;
  retryConnection: () => void;
}

export const useGPS = (options: UseGPSOptions = {}): UseGPSReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 30000, // 增加到30秒
    maximumAge = 0,
    trackingInterval = 1000,
    autoInitialize = false
  } = options;

  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [positions, setPositions] = useState<GPSPosition[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isGPSReady, setIsGPSReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const initWatchIdRef = useRef<number | null>(null);
  const isTrackingRef = useRef<boolean>(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 同步 isTracking 状态到 ref
  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  // 检查GPS支持
  const isGPSSupported = useCallback(() => {
    return 'geolocation' in navigator;
  }, []);

  // 检查权限状态
  const checkPermissionStatus = useCallback(async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);
        console.log('GPS权限状态:', permission.state);
        
        // 监听权限状态变化
        permission.onchange = () => {
          setPermissionStatus(permission.state);
          console.log('GPS权限状态变化:', permission.state);
        };
        
        return permission.state;
      } catch (error) {
        console.warn('无法检查GPS权限状态:', error);
        return 'unknown';
      }
    }
    return 'unknown';
  }, []);

  // 请求权限
  const requestPermission = useCallback(async () => {
    if (!isGPSSupported()) {
      setError('您的设备不支持GPS定位');
      return;
    }

    try {
      // 先检查当前权限状态
      const currentStatus = await checkPermissionStatus();
      
      if (currentStatus === 'denied') {
        setError('GPS权限被拒绝。请在浏览器设置中允许位置访问，然后刷新页面。');
        return;
      }

      // 尝试获取位置来触发权限请求
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false, // 首次请求使用低精度
          timeout: 10000,
          maximumAge: 0
        });
      });

      console.log('GPS权限获取成功');
      handlePositionUpdate(position);
    } catch (error: any) {
      console.error('GPS权限请求失败:', error);
      handlePositionError(error);
    }
  }, [isGPSSupported, checkPermissionStatus]);

  // 计算两点间距离（米）
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // 地球半径（米）
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  // 获取总距离
  const getDistance = useCallback((): number => {
    if (positions.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < positions.length; i++) {
      totalDistance += calculateDistance(
        positions[i-1].lat, positions[i-1].lng,
        positions[i].lat, positions[i].lng
      );
    }
    return totalDistance;
  }, [positions, calculateDistance]);

  // 获取平均速度（km/h）
  const getAverageSpeed = useCallback((): number => {
    const distance = getDistance(); // 米
    const duration = getDuration(); // 秒
    
    if (duration === 0) return 0;
    
    return (distance / 1000) / (duration / 3600); // km/h
  }, [getDistance]);

  // 获取持续时间（秒）
  const getDuration = useCallback((): number => {
    if (positions.length < 2) return 0;
    
    const startTime = positions[0].timestamp;
    const endTime = positions[positions.length - 1].timestamp;
    
    return (endTime - startTime) / 1000;
  }, [positions]);

  // 处理位置更新
  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    console.log('GPS位置更新:', position);
    
    const newPosition: GPSPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: position.timestamp,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed || undefined,
      heading: position.coords.heading || undefined
    };

    setCurrentPosition(newPosition);
    setAccuracy(position.coords.accuracy);
    setError(null);
    setIsGPSReady(true);
    setConnectionAttempts(0); // 重置连接尝试次数

    // 只有在追踪状态下才添加到路径
    if (isTrackingRef.current) {
      setPositions(prev => {
        // 过滤掉精度太低的点（大于50米）
        if (newPosition.accuracy && newPosition.accuracy > 50) {
          console.log('GPS精度太低，跳过此点:', newPosition.accuracy);
          return prev;
        }

        // 如果是第一个点，直接添加
        if (prev.length === 0) {
          return [newPosition];
        }

        // 检查与上一个点的距离，避免添加太近的点
        const lastPosition = prev[prev.length - 1];
        const distance = calculateDistance(
          lastPosition.lat, lastPosition.lng,
          newPosition.lat, newPosition.lng
        );
        
        // 如果距离小于5米且时间间隔小于5秒，不添加
        if (distance < 5 && (newPosition.timestamp - lastPosition.timestamp) < 5000) {
          return prev;
        }

        return [...prev, newPosition];
      });
    }
  }, [calculateDistance]);

  // 处理位置错误
  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    console.error('GPS错误:', error);
    
    let errorMessage = '';
    let shouldRetry = false;
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'GPS权限被拒绝。请允许位置访问并刷新页面。';
        setPermissionStatus('denied');
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'GPS位置信息不可用。请检查设备GPS设置。';
        shouldRetry = true;
        break;
      case error.TIMEOUT:
        errorMessage = 'GPS定位超时。正在重试...';
        shouldRetry = true;
        break;
      default:
        errorMessage = '获取GPS位置时发生未知错误。';
        shouldRetry = true;
        break;
    }
    
    setError(errorMessage);
    setIsGPSReady(false);
    
    // 增加连接尝试次数
    setConnectionAttempts(prev => prev + 1);
    
    // 如果应该重试且尝试次数少于5次，则自动重试
    if (shouldRetry && connectionAttempts < 5) {
      console.log(`GPS连接失败，${3000}ms后重试 (第${connectionAttempts + 1}次)`);
      retryTimeoutRef.current = setTimeout(() => {
        retryConnection();
      }, 3000);
    }
  }, [connectionAttempts]);

  // 重试连接
  const retryConnection = useCallback(() => {
    console.log('重试GPS连接...');
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    initializeGPS();
  }, []);

  // 初始化GPS定位（降级策略）
  const initializeGPS = useCallback(async () => {
    if (!isGPSSupported()) {
      setError('您的设备不支持GPS定位');
      setIsGPSReady(false);
      return;
    }

    console.log('初始化GPS定位...');
    setError(null);
    setIsGPSReady(false);

    // 先检查权限状态
    const permissionState = await checkPermissionStatus();
    
    if (permissionState === 'denied') {
      setError('GPS权限被拒绝。请在浏览器设置中允许位置访问。');
      return;
    }

    // 降级策略：先尝试高精度，失败后尝试低精度
    const tryGetPosition = async (highAccuracy: boolean) => {
      const options: PositionOptions = {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? timeout : 15000, // 低精度模式使用较短超时
        maximumAge: maximumAge
      };

      console.log(`尝试GPS定位 (高精度: ${highAccuracy})...`);

      return new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    try {
      // 首先尝试高精度定位
      let position: GeolocationPosition;
      
      try {
        position = await tryGetPosition(enableHighAccuracy);
        console.log('高精度GPS定位成功');
      } catch (highAccuracyError) {
        console.warn('高精度GPS定位失败，尝试低精度模式:', highAccuracyError);
        
        // 如果高精度失败，尝试低精度
        position = await tryGetPosition(false);
        console.log('低精度GPS定位成功');
      }

      handlePositionUpdate(position);

      // 开始监听位置变化
      const watchOptions: PositionOptions = {
        enableHighAccuracy: false, // 监听时使用低精度以提高稳定性
        timeout: 20000,
        maximumAge: 5000
      };

      initWatchIdRef.current = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        handlePositionError,
        watchOptions
      );

    } catch (error: any) {
      console.error('GPS初始化失败:', error);
      handlePositionError(error);
    }
  }, [isGPSSupported, enableHighAccuracy, timeout, maximumAge, handlePositionUpdate, handlePositionError, checkPermissionStatus]);

  // 开始追踪（记录路径）
  const startTracking = useCallback(() => {
    if (!isGPSSupported()) {
      setError('您的设备不支持GPS定位');
      return;
    }

    console.log('开始GPS追踪...');
    setIsTracking(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: false, // 追踪时使用低精度以提高稳定性
      timeout: 20000,
      maximumAge: 1000
    };

    // 如果还没有初始化GPS，先初始化
    if (!isGPSReady) {
      initializeGPS();
    }

    // 开始持续监听位置变化
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      options
    );

    // 设置定时器定期获取位置（作为备用）
    intervalIdRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        handlePositionUpdate,
        handlePositionError,
        options
      );
    }, trackingInterval);
  }, [
    isGPSSupported,
    trackingInterval,
    handlePositionUpdate,
    handlePositionError,
    isGPSReady,
    initializeGPS
  ]);

  // 停止追踪
  const stopTracking = useCallback(() => {
    console.log('停止GPS追踪...');
    setIsTracking(false);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    // 保持GPS初始化状态，继续监听位置
  }, []);

  // 清除位置记录
  const clearPositions = useCallback(() => {
    setPositions([]);
  }, []);

  // 自动初始化GPS
  useEffect(() => {
    if (autoInitialize) {
      console.log('自动初始化GPS...');
      // 延迟一点时间以确保组件完全挂载
      setTimeout(() => {
        initializeGPS();
      }, 1000);
    }

    // 组件卸载时清理
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
      if (initWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(initWatchIdRef.current);
      }
      if (retryTimeoutRef.current !== null) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [autoInitialize, initializeGPS]);

  return {
    currentPosition,
    positions,
    isTracking,
    isGPSReady,
    error,
    accuracy,
    permissionStatus,
    connectionAttempts,
    startTracking,
    stopTracking,
    clearPositions,
    getDistance,
    getAverageSpeed,
    getDuration,
    initializeGPS,
    requestPermission,
    retryConnection
  };
}