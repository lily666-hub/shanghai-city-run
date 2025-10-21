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
}

interface UseGPSReturn {
  currentPosition: GPSPosition | null;
  positions: GPSPosition[];
  isTracking: boolean;
  error: string | null;
  accuracy: number | null;
  startTracking: () => void;
  stopTracking: () => void;
  clearPositions: () => void;
  getDistance: () => number;
  getAverageSpeed: () => number;
  getDuration: () => number;
}

export const useGPS = (options: UseGPSOptions = {}): UseGPSReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    trackingInterval = 1000
  } = options;

  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [positions, setPositions] = useState<GPSPosition[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // 检查GPS支持
  const isGPSSupported = useCallback(() => {
    return 'geolocation' in navigator;
  }, []);

  // 计算两点间距离（米）
  const calculateDistance = useCallback((pos1: GPSPosition, pos2: GPSPosition): number => {
    const R = 6371e3; // 地球半径（米）
    const φ1 = pos1.lat * Math.PI / 180;
    const φ2 = pos2.lat * Math.PI / 180;
    const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
    const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }, []);

  // 获取总距离
  const getDistance = useCallback((): number => {
    if (positions.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < positions.length; i++) {
      totalDistance += calculateDistance(positions[i-1], positions[i]);
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
    const newPosition: GPSPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: Date.now(),
      accuracy: position.coords.accuracy,
      speed: position.coords.speed || undefined,
      heading: position.coords.heading || undefined
    };

    setCurrentPosition(newPosition);
    setAccuracy(position.coords.accuracy);
    setError(null);

    // 只有在追踪状态下才添加到路径
    if (isTracking) {
      setPositions(prev => {
        // 过滤掉精度太低的点（大于50米）
        if (newPosition.accuracy && newPosition.accuracy > 50) {
          return prev;
        }

        // 如果是第一个点，直接添加
        if (prev.length === 0) {
          return [newPosition];
        }

        // 检查与上一个点的距离，避免添加太近的点
        const lastPosition = prev[prev.length - 1];
        const distance = calculateDistance(lastPosition, newPosition);
        
        // 如果距离小于5米且时间间隔小于5秒，不添加
        if (distance < 5 && (newPosition.timestamp - lastPosition.timestamp) < 5000) {
          return prev;
        }

        return [...prev, newPosition];
      });
    }
  }, [isTracking, calculateDistance]);

  // 处理位置错误
  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = '';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = '用户拒绝了位置访问请求';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = '位置信息不可用';
        break;
      case error.TIMEOUT:
        errorMessage = '获取位置信息超时';
        break;
      default:
        errorMessage = '获取位置信息时发生未知错误';
        break;
    }
    setError(errorMessage);
    console.error('GPS错误:', errorMessage);
  }, []);

  // 开始追踪
  const startTracking = useCallback(() => {
    if (!isGPSSupported()) {
      setError('您的设备不支持GPS定位');
      return;
    }

    setIsTracking(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    };

    // 立即获取一次位置
    navigator.geolocation.getCurrentPosition(
      handlePositionUpdate,
      handlePositionError,
      options
    );

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
    enableHighAccuracy,
    timeout,
    maximumAge,
    trackingInterval,
    handlePositionUpdate,
    handlePositionError
  ]);

  // 停止追踪
  const stopTracking = useCallback(() => {
    setIsTracking(false);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  // 清除位置记录
  const clearPositions = useCallback(() => {
    setPositions([]);
    setCurrentPosition(null);
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    currentPosition,
    positions,
    isTracking,
    error,
    accuracy,
    startTracking,
    stopTracking,
    clearPositions,
    getDistance,
    getAverageSpeed,
    getDuration
  };
}