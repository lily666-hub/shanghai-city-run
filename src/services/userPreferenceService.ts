import { supabase } from '../lib/supabase';
import type { 
  UserPreference, 
  RunningPreferences, 
  SafetyPreferences, 
  NotificationPreferences 
} from '../types/routeRecommendation';

/**
 * 用户偏好管理服务
 * 负责管理用户的跑步偏好、安全偏好和通知偏好
 */
export class UserPreferenceService {
  /**
   * 获取用户的所有偏好设置
   */
  async getUserPreferences(userId: string): Promise<{
    running?: RunningPreferences;
    safety?: SafetyPreferences;
    notification?: NotificationPreferences;
  }> {
    try {
      console.log('🔍 获取用户偏好设置:', { userId });

      // 先检查现有数据库结构
      const { data: existingData, error: existingError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (existingError) {
        console.error('❌ 获取用户偏好失败:', existingError);
        throw existingError;
      }

      // 如果使用旧的数据库结构
      if (existingData && existingData.length > 0 && 'preference_type' in existingData[0]) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error('❌ 获取用户偏好失败:', error);
          throw error;
        }

        // 将数据按类型分组
        const preferences: any = {};
        data?.forEach(pref => {
          preferences[pref.preference_type] = pref.preferences;
        });

        return preferences;
      } else {
        // 使用新的数据库结构
        const { data, error } = await supabase
          .from('user_preferences')
          .select('running_preferences, safety_preferences, notification_preferences')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ 获取用户偏好失败:', error);
          throw error;
        }

        return {
          running: data?.running_preferences || this.getDefaultRunningPreferences(),
          safety: data?.safety_preferences || this.getDefaultSafetyPreferences(),
          notification: data?.notification_preferences || this.getDefaultNotificationPreferences()
        };
      }
    } catch (error) {
      console.error('❌ 用户偏好服务错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户的跑步偏好
   */
  async getRunningPreferences(userId: string): Promise<RunningPreferences | null> {
    try {
      console.log('🏃 获取跑步偏好:', { userId });

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .eq('preference_type', 'running')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ 获取跑步偏好失败:', error);
        throw error;
      }

      const preferences = data?.preferences as RunningPreferences;
      console.log('✅ 跑步偏好获取成功:', preferences);

      return preferences || this.getDefaultRunningPreferences();
    } catch (error) {
      console.error('❌ 跑步偏好服务错误:', error);
      return this.getDefaultRunningPreferences();
    }
  }

  /**
   * 更新用户的跑步偏好
   */
  async updateRunningPreferences(userId: string, preferences: RunningPreferences): Promise<void> {
    try {
      console.log('📝 更新跑步偏好:', { userId, preferences });

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preference_type: 'running',
          preferences: preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,preference_type'
        });

      if (error) {
        console.error('❌ 更新跑步偏好失败:', error);
        throw error;
      }

      console.log('✅ 跑步偏好更新成功');
    } catch (error) {
      console.error('❌ 跑步偏好更新错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户的安全偏好
   */
  async getSafetyPreferences(userId: string): Promise<SafetyPreferences | null> {
    try {
      console.log('🛡️ 获取安全偏好:', { userId });

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .eq('preference_type', 'safety')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ 获取安全偏好失败:', error);
        throw error;
      }

      const preferences = data?.preferences as SafetyPreferences;
      console.log('✅ 安全偏好获取成功:', preferences);

      return preferences || this.getDefaultSafetyPreferences();
    } catch (error) {
      console.error('❌ 安全偏好服务错误:', error);
      return this.getDefaultSafetyPreferences();
    }
  }

  /**
   * 更新用户的安全偏好
   */
  async updateSafetyPreferences(userId: string, preferences: SafetyPreferences): Promise<void> {
    try {
      console.log('📝 更新安全偏好:', { userId, preferences });

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preference_type: 'safety',
          preferences: preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,preference_type'
        });

      if (error) {
        console.error('❌ 更新安全偏好失败:', error);
        throw error;
      }

      console.log('✅ 安全偏好更新成功');
    } catch (error) {
      console.error('❌ 安全偏好更新错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户的通知偏好
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      console.log('🔔 获取通知偏好:', { userId });

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .eq('preference_type', 'notification')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ 获取通知偏好失败:', error);
        throw error;
      }

      const preferences = data?.preferences as NotificationPreferences;
      console.log('✅ 通知偏好获取成功:', preferences);

      return preferences || this.getDefaultNotificationPreferences();
    } catch (error) {
      console.error('❌ 通知偏好服务错误:', error);
      return this.getDefaultNotificationPreferences();
    }
  }

  /**
   * 更新用户的通知偏好
   */
  async updateNotificationPreferences(userId: string, preferences: NotificationPreferences): Promise<void> {
    try {
      console.log('📝 更新通知偏好:', { userId, preferences });

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preference_type: 'notification',
          preferences: preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,preference_type'
        });

      if (error) {
        console.error('❌ 更新通知偏好失败:', error);
        throw error;
      }

      console.log('✅ 通知偏好更新成功');
    } catch (error) {
      console.error('❌ 通知偏好更新错误:', error);
      throw error;
    }
  }

  /**
   * 保存用户偏好设置
   */
  async saveUserPreferences(userId: string, updatedPreferences: Partial<UserPreference>): Promise<void> {
     try {
       console.log('💾 保存用户偏好:', { userId, updatedPreferences });

       const { error } = await supabase
         .from('user_preferences')
         .upsert({
           user_id: userId,
           running_preferences: (updatedPreferences as any).running,
           safety_preferences: (updatedPreferences as any).safety,
           notification_preferences: (updatedPreferences as any).notification,
           updated_at: new Date().toISOString()
         }, {
           onConflict: 'user_id'
         });

       if (error) {
         console.error('❌ 保存用户偏好失败:', error);
         throw error;
       }

       console.log('✅ 用户偏好保存成功');
     } catch (error) {
       console.error('❌ 保存用户偏好错误:', error);
       throw error;
     }
   }

  /**
   * 删除用户的所有偏好设置
   */
  async deleteUserPreferences(userId: string): Promise<void> {
    try {
      console.log('🗑️ 删除用户偏好:', { userId });

      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('❌ 删除用户偏好失败:', error);
        throw error;
      }

      console.log('✅ 用户偏好删除成功');
    } catch (error) {
      console.error('❌ 删除用户偏好错误:', error);
      throw error;
    }
  }

  /**
   * 基于用户历史数据智能推断偏好
   */
  async inferPreferencesFromHistory(userId: string): Promise<Partial<RunningPreferences>> {
    try {
      console.log('🧠 智能推断用户偏好:', { userId });

      // 获取用户跑步历史
      const { data: history, error } = await supabase
        .from('running_history')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ 获取跑步历史失败:', error);
        throw error;
      }

      if (!history || history.length === 0) {
        console.log('📊 无跑步历史，返回默认偏好');
        return {};
      }

      // 分析历史数据
      const distances = history.map(h => h.distance);
      const durations = history.map(h => h.duration_minutes);
      const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

      // 推断偏好距离
      let preferredDistance = '5km';
      if (avgDistance < 3) {
        preferredDistance = '3km以下';
      } else if (avgDistance <= 5) {
        preferredDistance = '3-5km';
      } else if (avgDistance <= 10) {
        preferredDistance = '5-10km';
      } else {
        preferredDistance = '10km以上';
      }

      // 推断难度偏好
      let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
      const avgPace = avgDuration / avgDistance; // 分钟/公里
      if (avgPace > 7) {
        difficulty = 'easy';
      } else if (avgPace < 5) {
        difficulty = 'hard';
      }

      const inferredPreferences: Partial<RunningPreferences> = {
        preferredDistance,
        difficulty: [difficulty]
      };

      console.log('✅ 偏好推断完成:', inferredPreferences);
      return inferredPreferences;
    } catch (error) {
      console.error('❌ 偏好推断错误:', error);
      return {};
    }
  }

  /**
   * 获取默认跑步偏好
   */
  private getDefaultRunningPreferences(): RunningPreferences {
    return {
      difficulty: ['medium'],
      preferredDistance: '5km',
      timeOfDay: ['morning'],
      routeTypes: ['park', 'waterfront'],
      avoidTraffic: true,
      preferredWeather: ['sunny', 'cloudy'],
      maxElevation: 100
    };
  }

  /**
   * 获取默认安全偏好
   */
  private getDefaultSafetyPreferences(): SafetyPreferences {
    return {
      nightRunning: false,
      buddySystem: false,
      emergencyContacts: true,
      safetyAlerts: true,
      avoidIsolatedAreas: true
    };
  }

  /**
   * 获取默认通知偏好
   */
  private getDefaultNotificationPreferences(): NotificationPreferences {
    return {
      aiRecommendations: true,
      weatherAlerts: true,
      routeUpdates: true,
      frequency: 'daily',
      pushNotifications: true,
      quietHours: {
        start: '22:00',
        end: '08:00'
      }
    };
  }

  /**
   * 验证偏好设置的有效性
   */
  validatePreferences(preferences: any, type: 'running' | 'safety' | 'notification'): boolean {
    try {
      switch (type) {
        case 'running':
          return this.validateRunningPreferences(preferences);
        case 'safety':
          return this.validateSafetyPreferences(preferences);
        case 'notification':
          return this.validateNotificationPreferences(preferences);
        default:
          return false;
      }
    } catch (error) {
      console.error('❌ 偏好验证错误:', error);
      return false;
    }
  }

  private validateRunningPreferences(prefs: RunningPreferences): boolean {
    const validDifficulties = ['easy', 'medium', 'hard'];
    const validTimesOfDay = ['morning', 'afternoon', 'evening', 'night'];
    
    return (
      Array.isArray(prefs.difficulty) &&
      typeof prefs.preferredDistance === 'string' &&
      Array.isArray(prefs.timeOfDay) &&
      Array.isArray(prefs.routeTypes) &&
      typeof prefs.avoidTraffic === 'boolean' &&
      Array.isArray(prefs.preferredWeather) &&
      typeof prefs.maxElevation === 'number'
    );
  }

  private validateSafetyPreferences(prefs: SafetyPreferences): boolean {
    return (
      typeof prefs.nightRunning === 'boolean' &&
      typeof prefs.buddySystem === 'boolean' &&
      typeof prefs.emergencyContacts === 'boolean' &&
      typeof prefs.safetyAlerts === 'boolean' &&
      typeof prefs.avoidIsolatedAreas === 'boolean'
    );
  }

  private validateNotificationPreferences(prefs: NotificationPreferences): boolean {
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    
    return (
      typeof prefs.aiRecommendations === 'boolean' &&
      typeof prefs.weatherAlerts === 'boolean' &&
      typeof prefs.routeUpdates === 'boolean' &&
      validFrequencies.includes(prefs.frequency) &&
      typeof prefs.pushNotifications === 'boolean'
    );
  }
}

// 创建单例实例
export const userPreferenceService = new UserPreferenceService();