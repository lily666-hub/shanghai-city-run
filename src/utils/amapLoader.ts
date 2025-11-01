// 高德地图API加载器
export class AmapLoader {
  private static isLoading = false;
  private static isLoaded = false;
  private static loadPromise: Promise<void> | null = null;

  /**
   * 加载高德地图API
   */
  static async loadAmap(): Promise<void> {
    // 如果已经加载，直接返回
    if (this.isLoaded && window.AMap) {
      console.log('✅ 高德地图API已加载');
      return Promise.resolve();
    }

    // 如果正在加载，返回现有的Promise
    if (this.isLoading && this.loadPromise) {
      console.log('⏳ 高德地图API正在加载中...');
      return this.loadPromise;
    }

    // 开始加载
    this.isLoading = true;
    this.loadPromise = this.doLoadAmap();
    
    try {
      await this.loadPromise;
      this.isLoaded = true;
      console.log('✅ 高德地图API加载完成');
    } catch (error) {
      console.error('❌ 高德地图API加载失败:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 执行实际的加载逻辑
   */
  private static doLoadAmap(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🗺️ 开始加载高德地图API...');

      // 检查API密钥
      const apiKey = import.meta.env.VITE_AMAP_API_KEY;
      if (!apiKey) {
        const error = new Error('高德地图API密钥未配置');
        console.error('❌ 配置错误:', error);
        reject(error);
        return;
      }

      console.log('🔑 API密钥已配置:', apiKey.substring(0, 8) + '...');

      // 如果window.AMap已存在，直接resolve
      if (window.AMap) {
        console.log('✅ 高德地图API已存在于window对象');
        resolve();
        return;
      }

      // 创建script标签
      const script = document.createElement('script');
      const scriptUrl = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}&plugin=AMap.Geolocation,AMap.Scale,AMap.ToolBar`;
      
      console.log('📍 加载脚本URL:', scriptUrl);
      
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;

      // 成功回调
      script.onload = () => {
        console.log('✅ 高德地图API脚本加载成功');
        
        // 检查AMap对象是否可用
        if (window.AMap) {
          console.log('✅ 高德地图API对象可用:', {
            version: window.AMap.version || 'unknown',
            plugins: Object.keys(window.AMap).filter(key => key.startsWith('AMap') || key === 'Geolocation')
          });
          resolve();
        } else {
          const error = new Error('高德地图API脚本加载成功但AMap对象不可用');
          console.error('❌ API对象检查失败:', error);
          reject(error);
        }
      };

      // 错误回调
      script.onerror = (event) => {
        const error = new Error('高德地图API脚本加载失败');
        console.error('❌ 脚本加载失败:', { event, scriptUrl });
        reject(error);
      };

      // 超时处理
      const timeout = setTimeout(() => {
        const error = new Error('高德地图API加载超时');
        console.error('❌ 加载超时:', error);
        script.remove();
        reject(error);
      }, 15000); // 15秒超时

      script.onload = () => {
        clearTimeout(timeout);
        if (window.AMap) {
          console.log('✅ 高德地图API加载成功');
          resolve();
        } else {
          const error = new Error('高德地图API脚本加载成功但AMap对象不可用');
          reject(error);
        }
      };

      // 添加到页面
      document.head.appendChild(script);
      console.log('📄 高德地图API脚本已添加到页面');
    });
  }

  /**
   * 检查高德地图API是否可用
   */
  static isAmapAvailable(): boolean {
    const available = typeof window !== 'undefined' && !!window.AMap;
    console.log('🔍 高德地图API可用性检查:', {
      windowExists: typeof window !== 'undefined',
      amapExists: !!window.AMap,
      available
    });
    return available;
  }

  /**
   * 获取加载状态
   */
  static getLoadStatus(): {
    isLoading: boolean;
    isLoaded: boolean;
    isAvailable: boolean;
  } {
    return {
      isLoading: this.isLoading,
      isLoaded: this.isLoaded,
      isAvailable: this.isAmapAvailable()
    };
  }
}

// 声明全局类型
declare global {
  interface Window {
    AMap: any;
  }
}