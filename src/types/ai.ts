// AI智能安全顾问相关类型定义

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  confidenceScore?: number;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  aiProvider: 'kimi' | 'deepseek';
  conversationType: 'safety' | 'emergency' | 'general' | 'women_safety' | 'route_recommendation';
  isEmergency: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages: AIMessage[];
  lastMessage?: string;
  messageCount?: number;
}

export interface AIContext {
  id?: string;
  conversationId: string;
  locationData: {
    latitude?: number;
    longitude?: number;
    address?: string;
    district?: string;
    safetyLevel?: number;
  };
  userContext: {
    gender?: string;
    age?: number;
    runningExperience?: string;
    preferences?: Record<string, any>;
    userType?: string;
    demographics?: any;
    runningHistory?: any;
    achievements?: any;
  };
  safetyContext: {
    timeOfDay?: string;
    weather?: string;
    crowdLevel?: string;
    lightingCondition?: string;
    emergencyContacts?: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
  };
  userPreferences?: any;
  userHistory?: any[];
  availableRoutes?: any[];
  // 添加缺失的属性
  userLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    district?: string;
  };
  weatherData?: {
    condition?: string;
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    airQuality?: string;
  };
  safetyLevel?: number;
  // 添加更多缺失的属性
  safetyConstraints?: any;
  agentContext?: any;
  activeChallenge?: any;
  currentRoute?: any;
  createdAt: Date;
}

export interface SafetyProfile {
  id: string;
  userId: string;
  gender?: string;
  preferences: {
    preferredTime?: string;
    safetyLevel?: 'low' | 'medium' | 'high';
    aiProvider?: 'kimi' | 'deepseek';
    notifications?: boolean;
  };
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  safetySettings: {
    nightRunning?: boolean;
    buddySystem?: boolean;
    emergencyAutoCall?: boolean;
    shareLocation?: boolean;
  };
  updatedAt: Date;
}

export interface AIProvider {
  name: 'kimi' | 'deepseek';
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface AIRequest {
  message: string;
  context?: Partial<AIContext>;
  conversationId?: string;
  provider?: 'kimi' | 'deepseek';
  conversationType?: 'safety' | 'emergency' | 'general' | 'women_safety' | 'route_recommendation';
}

export interface AIResponse {
  message: string;
  confidence: number;
  suggestions?: string[];
  emergencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  actionRequired?: boolean;
  metadata?: Record<string, any>;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  alertType: 'manual' | 'auto' | 'ai_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  status: 'active' | 'resolved' | 'false_alarm';
  aiAnalysis?: {
    riskAssessment: string;
    recommendedActions: string[];
    confidence: number;
  };
}

export interface WomenSafetyFeature {
  id: string;
  name: string;
  description: string;
  category: 'prevention' | 'detection' | 'response' | 'support';
  isActive: boolean;
  aiEnhanced: boolean;
  settings?: Record<string, any>;
}

export interface SafetyAnalysis {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  improvements: number;
  lastUpdated: string;
  metrics?: {
    safeRoutes: number;
    riskAreas: number;
    avgResponseTime: number;
  };
  recentActivities?: Array<{
    type: 'safe' | 'warning' | 'danger';
    title: string;
    description: string;
    timestamp: string;
  }>;
  routeAnalysis?: Array<{
    name: string;
    riskLevel: 'low' | 'medium' | 'high';
    description: string;
    distance: number;
    safetyScore: number;
    usageCount: number;
  }>;
  behaviorPatterns?: Array<{
    pattern: string;
    description: string;
    frequency: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  recommendations?: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  riskFactors?: Array<{
    factor: string;
    level: 'low' | 'medium' | 'high';
    description: string;
    aiInsight?: string;
  }>;
  locationAnalysis?: {
    safetyScore: number;
    crowdLevel: string;
    lightingCondition: string;
    historicalIncidents: number;
    aiAssessment: string;
  };
  timeAnalysis?: {
    timeOfDay: string;
    riskLevel: 'low' | 'medium' | 'high';
    aiRecommendation: string;
  };
}

export interface AIConversationStats {
  totalConversations: number;
  totalMessages: number;
  activeConversations: number;
  averageResponseTime: number;
  womenSafetyConversations: number;
  emergencyConversations: number;
  emergencySessions: number;
  lastConversationAt?: Date;
}