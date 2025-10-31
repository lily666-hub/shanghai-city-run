// 用户相关类型
export interface User {
  id: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatarUrl?: string;
  height?: number;
  weight?: number;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  runningExperience?: string;
  weeklyGoal?: number;
  monthlyGoal?: number;
  interestTags?: string[];
  // 安全评估相关字段
  is_female_verified?: boolean;
  emergency_contacts?: EmergencyContact[];
  safety_preferences?: SafetyPreferences;
  createdAt: string;
  updatedAt: string;
}

// 注册方式类型
export type RegisterMethod = 'email' | 'phone';

// 手机号验证码相关类型
export interface PhoneVerification {
  phone: string;
  code: string;
  expiresAt: number;
}

// 跑步记录类型
export interface Run {
  id: string;
  user_id: string;
  userId?: string; // 兼容字段
  route_id?: string;
  route_data: {
    coordinates: [number, number][];
    start_location?: [number, number];
    end_location?: [number, number];
  };
  route?: number[][]; // 兼容字段
  distance: number;
  duration: number;
  average_pace: number;
  averageSpeed?: number; // 兼容字段
  calories?: number;
  startTime?: number; // 兼容字段
  endTime?: number; // 兼容字段
  status?: 'idle' | 'running' | 'paused' | 'completed';
  // 安全评估相关字段
  safety_score?: number;
  risk_factors?: string[];
  emergency_triggered?: boolean;
  created_at: string;
}

// 路线类型
export interface Route {
  id: string;
  name: string;
  description?: string;
  route_data: {
    coordinates: [number, number][];
    waypoints?: [number, number][];
  };
  distance: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  rating: number;
  // 安全评估相关字段
  female_friendly?: boolean;
  avg_safety_score?: number;
  safety_features?: string[];
  created_at: string;
}

// 个人最佳记录类型
export interface PersonalRecord {
  id: string;
  user_id: string;
  distance: number;
  best_time: number;
  achieved_at: string;
}

// 路线评分类型
export interface RouteRating {
  id: string;
  user_id: string;
  route_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// 挑战赛类型
export interface Challenge {
  id: string;
  name: string;
  type: string;
  rules: {
    distance?: number;
    duration?: number;
    target?: number;
  };
  start_date: string;
  end_date: string;
  created_at: string;
}

// 挑战赛参与者类型
export interface ChallengeParticipant {
  id: string;
  user_id: string;
  challenge_id: string;
  best_result?: number;
  joined_at: string;
}

// === 安全评估系统类型定义 ===

// 位置历史记录
export interface LocationHistory {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy: number | null;
  speed?: number | null;
  heading?: number | null;
  recorded_at: string;
  battery_level?: number | null;
  network_type?: string | null;
}

// 安全评估记录
export interface SafetyAssessment {
  id: string;
  location_id?: string;
  user_id?: string;
  latitude: number;
  longitude: number;
  safety_score: number;
  time_slot: TimeSlot;
  risk_factors: RiskFactor[];
  environmental_data?: EnvironmentalData;
  assessed_at: string;
}

// 路线安全评分
export interface RouteSafetyScore {
  id: string;
  route_id: string;
  time_slot: TimeSlot;
  safety_score: number;
  risk_analysis: RiskAnalysis;
  updated_at: string;
}

// 紧急事件
export interface EmergencyEvent {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  emergency_type: EmergencyType;
  status: EmergencyStatus;
  description?: string;
  created_at: string;
  resolved_at?: string;
}

// 紧急联系人
export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
}

// 安全偏好设置
export interface SafetyPreferences {
  auto_emergency_timeout: number; // 自动触发紧急求救的超时时间（分钟）
  location_sharing_enabled: boolean;
  night_mode_enabled: boolean;
  female_only_routes: boolean;
  risk_tolerance: 'low' | 'medium' | 'high';
  notification_settings: {
    emergency_alerts: boolean;
    safety_warnings: boolean;
    route_suggestions: boolean;
  };
}

// 时间段类型
export type TimeSlot = 'early_morning' | 'morning' | 'late_morning' | 'afternoon' | 'evening' | 'night' | 'late_night';

// 紧急事件类型
export type EmergencyType = 'personal_safety' | 'medical' | 'accident' | 'harassment' | 'lost' | 'other';

// 紧急事件状态
export type EmergencyStatus = 'active' | 'resolved' | 'cancelled' | 'false_alarm';

// 风险因素类型
export type RiskFactor = 'poor_lighting' | 'isolated_area' | 'high_crime_rate' | 'heavy_traffic' | 'construction_zone' | 'weather_conditions' | 'crowd_density';

// 风险因素详细信息
export interface RiskFactorDetail {
  type: RiskFactor;
  level: 'low' | 'medium' | 'high';
  description: string;
  weight: number;
}

// 环境数据
export interface EnvironmentalData {
  lighting_level: number; // 0-100
  crowd_density: number; // 0-100
  weather_condition: string;
  temperature: number;
  visibility: number; // 0-100
  noise_level: number; // 0-100
}

// 风险分析
export interface RiskAnalysis {
  overall_risk: number; // 0-10
  risk_factors: RiskFactor[];
  recommendations: string[];
  safe_alternatives?: string[];
}

// 实时位置数据
export interface RealtimeLocation {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: Date;
}

// 安全路线推荐
export interface SafeRouteRecommendation {
  route_id: string;
  safety_score: number;
  estimated_time: number;
  risk_points: Array<{
    latitude: number;
    longitude: number;
    risk_level: 'low' | 'medium' | 'high';
    description: string;
  }>;
  safety_features: string[];
  female_friendly: boolean;
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: 'location_update' | 'emergency_alert' | 'safety_warning' | 'route_update';
  payload: any;
  timestamp: string;
  user_id: string;
}

// 安全报告
export interface SafetyReport {
  id: string;
  user_id: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'route_specific';
  period_start: string;
  period_end: string;
  total_runs: number;
  avg_safety_score: number;
  risk_incidents: number;
  safe_routes_used: number;
  recommendations: string[];
  generated_at: string;
}

// 女性专区功能
export interface WomenSafetyFeature {
  id: string;
  feature_type: 'buddy_system' | 'safe_route' | 'emergency_network' | 'community_alert';
  name: string;
  description: string;
  is_active: boolean;
  participants?: string[]; // user_ids
  created_at: string;
}

// 结伴跑步匹配
export interface BuddyMatch {
  id: string;
  requester_id: string;
  matched_user_id?: string;
  preferred_time: string;
  preferred_route?: string;
  safety_level_required: 'standard' | 'high' | 'maximum';
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  created_at: string;
}

// 兴趣标签选项
export const INTEREST_TAGS = [
  '历史建筑',
  '现代艺术',
  '自然风光',
  '市井烟火气',
  '江景',
  '公园',
  '城市景观',
  '文化古迹',
  '商业区',
  '住宅区'
] as const;

export type InterestTag = typeof INTEREST_TAGS[number];

// 难度级别
export const DIFFICULTY_LEVELS = {
  easy: { label: '简单', color: 'text-green-600' },
  medium: { label: '中等', color: 'text-yellow-600' },
  hard: { label: '困难', color: 'text-red-600' }
} as const;

// 安全等级
export const SAFETY_LEVELS = {
  high: { label: '高安全', color: 'text-green-600', score: 8 },
  medium: { label: '中等安全', color: 'text-yellow-600', score: 5 },
  low: { label: '低安全', color: 'text-red-600', score: 2 }
} as const;

// 时间段标签
export const TIME_SLOTS = {
  morning: { label: '早晨 (6:00-10:00)', icon: '🌅' },
  afternoon: { label: '下午 (10:00-18:00)', icon: '☀️' },
  evening: { label: '傍晚 (18:00-22:00)', icon: '🌆' },
  night: { label: '夜晚 (22:00-6:00)', icon: '🌙' }
} as const;

// 跑步状态
export type RunStatus = 'idle' | 'running' | 'paused' | 'completed';

// 统计数据类型
export interface RunStats {
  total_runs: number;
  total_distance: number;
  total_duration: number;
  average_pace: number;
  best_pace: number;
  total_calories: number;
  // 安全统计
  avg_safety_score?: number;
  emergency_incidents?: number;
  safe_routes_completed?: number;
}

// API响应类型
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

// 分页类型
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// 安全评估API请求类型
export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

export interface SafeRouteRequest {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  timeSlot: TimeSlot;
  userType?: 'female' | 'general';
}

export interface EmergencyRequest {
  latitude: number;
  longitude: number;
  emergencyType: EmergencyType;
  message?: string;
}