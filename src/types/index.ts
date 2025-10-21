// 用户相关类型
export interface User {
  id: string;
  email: string;
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
  createdAt: string;
  updatedAt: string;
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