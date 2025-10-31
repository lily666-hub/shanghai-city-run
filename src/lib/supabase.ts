import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// 检查是否使用了占位符值
const isPlaceholder = supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder');

if (isPlaceholder) {
  console.warn('⚠️ 使用的是Supabase占位符配置。请在.env文件中配置真实的Supabase URL和密钥。');
  console.warn('📝 配置步骤：');
  console.warn('1. 在Supabase控制台创建项目');
  console.warn('2. 复制项目URL和anon key');
  console.warn('3. 在.env文件中更新VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY');
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // 禁用邮箱确认要求，允许用户直接登录
    flowType: 'pkce'
  }
});

// 数据库类型定义
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email?: string;
          phone?: string;
          nickname: string;
          avatar_url?: string;
          height?: number;
          weight?: number;
          birth_date?: string;
          gender?: 'male' | 'female' | 'other';
          running_experience?: 'beginner' | 'intermediate' | 'advanced';
          weekly_goal?: number;
          monthly_goal?: number;
          interest_tags?: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string;
          phone?: string;
          nickname: string;
          avatar_url?: string;
          height?: number;
          weight?: number;
          birth_date?: string;
          gender?: 'male' | 'female' | 'other';
          running_experience?: 'beginner' | 'intermediate' | 'advanced';
          weekly_goal?: number;
          monthly_goal?: number;
          interest_tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string;
          nickname?: string;
          avatar_url?: string;
          height?: number;
          weight?: number;
          birth_date?: string;
          gender?: 'male' | 'female' | 'other';
          running_experience?: 'beginner' | 'intermediate' | 'advanced';
          weekly_goal?: number;
          monthly_goal?: number;
          interest_tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      runs: {
        Row: {
          id: string;
          user_id: string;
          title?: string;
          distance: number;
          duration: number;
          pace: number;
          calories: number;
          route_data?: any;
          start_time: string;
          end_time: string;
          status: 'completed' | 'paused' | 'cancelled';
          weather?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          distance: number;
          duration: number;
          pace: number;
          calories: number;
          route_data?: any;
          start_time: string;
          end_time: string;
          status?: 'completed' | 'paused' | 'cancelled';
          weather?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          distance?: number;
          duration?: number;
          pace?: number;
          calories?: number;
          route_data?: any;
          start_time?: string;
          end_time?: string;
          status?: 'completed' | 'paused' | 'cancelled';
          weather?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      routes: {
        Row: {
          id: string;
          name: string;
          description?: string;
          distance: number;
          difficulty: 'easy' | 'medium' | 'hard';
          interest_tags: string[];
          route_data: any;
          rating: number;
          rating_count: number;
          created_by: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          distance: number;
          difficulty: 'easy' | 'medium' | 'hard';
          interest_tags: string[];
          route_data: any;
          rating?: number;
          rating_count?: number;
          created_by: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          distance?: number;
          difficulty?: 'easy' | 'medium' | 'hard';
          interest_tags?: string[];
          route_data?: any;
          rating?: number;
          rating_count?: number;
          created_by?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};