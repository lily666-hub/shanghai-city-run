import React, { useEffect, useRef, useState } from 'react';

interface MapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  showCurrentLocation?: boolean;
  route?: Array<[number, number]>;
}

const Map: React.FC<MapProps> = ({
  center = [121.4737, 31.2304], // 上海市中心
  zoom = 13,
  height = '400px',
  onLocationUpdate,
  showCurrentLocation = false,
  route = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 检查高德地图API是否已加载
  const checkAMapLoaded = () => {
    return typeof window !== 'undefined' && (window as any).AMap;
  };

  // 加载高德地图API
  const loadAMapScript = () => {
    return new Promise((resolve, reject) => {
      if (checkAMapLoaded()) {
        resolve((window as any).AMap);
        return;
      }

      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_AMAP_API_KEY || 'your_amap_api_key_here';
      script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${apiKey}&plugin=AMap.Geolocation`;
      script.async = true;
      
      script.onload = () => {
        if (checkAMapLoaded()) {
          resolve((window as any).AMap);
        } else {
          reject(new Error('高德地图API加载失败'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('高德地图API加载失败'));
      };
      
      document.head.appendChild(script);
    });
  };

  // 初始化地图
  const initMap = async () => {
    try {
      const AMap = await loadAMapScript() as any;
      
      if (!mapRef.current) return;

      const map = new AMap.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        mapStyle: 'amap://styles/normal',
        viewMode: '3D',
        pitch: 0
      });

      setMapInstance(map);
      setIsMapLoaded(true);

      // 如果需要显示当前位置
      if (showCurrentLocation) {
        getCurrentLocation(map);
      }

      // 如果有路线数据，绘制路线
      if (route.length > 0) {
        drawRoute(map, route);
      }

    } catch (error) {
      console.error('地图初始化失败:', error);
    }
  };

  // 获取当前位置
  const getCurrentLocation = (map: any) => {
    const geolocation = new (window as any).AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      convert: true,
      showButton: true,
      buttonPosition: 'LB',
      buttonOffset: new (window as any).AMap.Pixel(10, 20),
      showMarker: true,
      showCircle: true,
      panToLocation: true,
      zoomToAccuracy: true
    });

    geolocation.getCurrentPosition((status: string, result: any) => {
      if (status === 'complete') {
        const location = {
          lat: result.position.lat,
          lng: result.position.lng
        };
        setCurrentLocation(location);
        onLocationUpdate?.(location);
      } else {
        console.error('定位失败:', result.message);
      }
    });

    map.addControl(geolocation);
  };

  // 绘制路线
  const drawRoute = (map: any, routePoints: Array<[number, number]>) => {
    if (routePoints.length < 2) return;

    const polyline = new (window as any).AMap.Polyline({
      path: routePoints,
      strokeColor: '#3366FF',
      strokeWeight: 6,
      strokeOpacity: 0.8,
      lineJoin: 'round',
      lineCap: 'round'
    });

    map.add(polyline);
    map.setFitView([polyline]);
  };

  useEffect(() => {
    initMap();
    
    return () => {
      if (mapInstance) {
        mapInstance.destroy();
      }
    };
  }, []);

  // 当路线数据更新时重新绘制
  useEffect(() => {
    if (mapInstance && route.length > 0) {
      mapInstance.clearMap();
      drawRoute(mapInstance, route);
    }
  }, [route, mapInstance]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="w-full rounded-lg overflow-hidden"
      />
      
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">地图加载中...</p>
          </div>
        </div>
      )}

      {currentLocation && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-2 text-sm">
          <p className="text-gray-600">
            当前位置: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default Map;