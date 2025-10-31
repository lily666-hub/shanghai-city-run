// 网络状态检测工具
export class NetworkUtils {
  /**
   * 检测网络连接状态
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * 检测Supabase连接状态
   */
  static async checkSupabaseConnection(): Promise<boolean> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        return false;
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 检测AI服务连接状态
   */
  static async checkAIServiceConnection(): Promise<{
    kimi: boolean;
    deepseek: boolean;
  }> {
    const results = {
      kimi: false,
      deepseek: false,
    };

    // 检测Kimi连接
    try {
      const kimiKey = import.meta.env.VITE_KIMI_API_KEY;
      if (kimiKey && !kimiKey.includes('placeholder')) {
        const response = await fetch('https://api.moonshot.cn/v1/models', {
          headers: {
            'Authorization': `Bearer ${kimiKey}`,
          },
        });
        results.kimi = response.ok;
      }
    } catch {
      results.kimi = false;
    }

    // 检测DeepSeek连接
    try {
      const deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      if (deepseekKey && !deepseekKey.includes('placeholder')) {
        const response = await fetch('https://api.deepseek.com/models', {
          headers: {
            'Authorization': `Bearer ${deepseekKey}`,
          },
        });
        results.deepseek = response.ok;
      }
    } catch {
      results.deepseek = false;
    }

    return results;
  }

  /**
   * 获取网络状态描述
   */
  static async getNetworkStatus(): Promise<{
    online: boolean;
    supabase: boolean;
    ai: { kimi: boolean; deepseek: boolean };
    description: string;
  }> {
    const online = this.isOnline();
    const supabase = await this.checkSupabaseConnection();
    const ai = await this.checkAIServiceConnection();

    let description = '';
    if (!online) {
      description = '网络连接断开，正在使用离线模式';
    } else if (!supabase && !ai.kimi && !ai.deepseek) {
      description = '服务连接异常，正在使用本地模式';
    } else if (!supabase) {
      description = '数据库连接异常，对话将保存到本地';
    } else if (!ai.kimi && !ai.deepseek) {
      description = 'AI服务连接异常，部分功能可能受限';
    } else {
      description = '所有服务连接正常';
    }

    return {
      online,
      supabase,
      ai,
      description,
    };
  }

  /**
   * 监听网络状态变化
   */
  static onNetworkChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

/**
 * 错误类型分类
 */
export const ErrorTypes = {
  NETWORK: 'network',
  DATABASE: 'database',
  AI_SERVICE: 'ai_service',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown',
} as const;

export type ErrorType = typeof ErrorTypes[keyof typeof ErrorTypes];

/**
 * 错误分析工具
 */
export class ErrorAnalyzer {
  /**
   * 分析错误类型
   */
  static analyzeError(error: any): {
    type: ErrorType;
    message: string;
    suggestion: string;
  } {
    const errorMessage = error?.message || error?.toString() || '未知错误';
    
    // 网络错误
    if (
      errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('Failed to fetch') ||
      !navigator.onLine
    ) {
      return {
        type: ErrorTypes.NETWORK,
        message: '网络连接异常',
        suggestion: '请检查网络连接，或继续使用离线模式',
      };
    }

    // 数据库错误
    if (
      errorMessage.includes('supabase') ||
      errorMessage.includes('database') ||
      errorMessage.includes('uuid') ||
      errorMessage.includes('PGRST')
    ) {
      return {
        type: ErrorTypes.DATABASE,
        message: '数据库连接异常',
        suggestion: '数据将保存到本地，网络恢复后会自动同步',
      };
    }

    // AI服务错误
    if (
      errorMessage.includes('API') ||
      errorMessage.includes('kimi') ||
      errorMessage.includes('deepseek') ||
      errorMessage.includes('AI服务')
    ) {
      return {
        type: ErrorTypes.AI_SERVICE,
        message: 'AI服务连接异常',
        suggestion: '正在尝试使用备用AI服务，或稍后重试',
      };
    }

    // 验证错误
    if (
      errorMessage.includes('validation') ||
      errorMessage.includes('required') ||
      errorMessage.includes('invalid')
    ) {
      return {
        type: ErrorTypes.VALIDATION,
        message: '输入验证失败',
        suggestion: '请检查输入内容是否正确',
      };
    }

    // 未知错误
    return {
      type: ErrorTypes.UNKNOWN,
      message: '操作失败',
      suggestion: '请稍后重试，如问题持续请联系技术支持',
    };
  }
}