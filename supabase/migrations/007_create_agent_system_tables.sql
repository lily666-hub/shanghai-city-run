-- 智能体系统数据库表结构
-- 创建时间：2024-01-20
-- 支持三个专业化智能体：RouteAgent、ChallengeAgent、SafetyAgent

-- 1. 智能体类型枚举表
CREATE TABLE IF NOT EXISTS agent_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capabilities JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 智能体对话会话表
CREATE TABLE IF NOT EXISTS agent_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL REFERENCES agent_types(id),
    session_id VARCHAR(100) NOT NULL, -- 用于关联前端会话
    title VARCHAR(255),
    context_data JSONB DEFAULT '{}', -- 存储对话上下文
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 智能体消息表
CREATE TABLE IF NOT EXISTS agent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'agent', 'system')),
    content TEXT NOT NULL,
    message_type VARCHAR(30) DEFAULT 'text' CHECK (message_type IN ('text', 'recommendation', 'alert', 'challenge', 'route')),
    metadata JSONB DEFAULT '{}', -- 存储额外信息如推荐数据、挑战详情等
    confidence_score FLOAT DEFAULT 0.0 CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 用户智能体偏好表
CREATE TABLE IF NOT EXISTS user_agent_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL REFERENCES agent_types(id),
    preferences JSONB DEFAULT '{}', -- 存储个性化偏好
    interaction_style VARCHAR(30) DEFAULT 'balanced' CHECK (interaction_style IN ('formal', 'casual', 'encouraging', 'balanced')),
    notification_settings JSONB DEFAULT '{"enabled": true, "frequency": "normal"}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, agent_type)
);

-- 5. 挑战推荐表
CREATE TABLE IF NOT EXISTS challenge_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_type VARCHAR(50) NOT NULL CHECK (challenge_type IN ('distance', 'time', 'frequency', 'route_exploration', 'social', 'seasonal')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value FLOAT, -- 目标值（距离、时间等）
    target_unit VARCHAR(20), -- 单位（km、minutes、times等）
    difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
    duration_days INTEGER DEFAULT 7 CHECK (duration_days > 0),
    reward_points INTEGER DEFAULT 0,
    conditions JSONB DEFAULT '{}', -- 完成条件
    progress_tracking JSONB DEFAULT '{}', -- 进度跟踪数据
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'expired', 'declined')),
    recommended_by VARCHAR(50) DEFAULT 'challenge_agent',
    confidence_score FLOAT DEFAULT 0.0 CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. 路线推荐表（扩展现有功能）
CREATE TABLE IF NOT EXISTS agent_route_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    route_id VARCHAR(50), -- 对应Routes.tsx中的路线ID
    recommendation_reason TEXT,
    personalization_factors JSONB DEFAULT '{}', -- 个性化因素
    weather_context JSONB DEFAULT '{}', -- 天气上下文
    safety_context JSONB DEFAULT '{}', -- 安全上下文
    difficulty_match_score FLOAT DEFAULT 0.0 CHECK (difficulty_match_score BETWEEN 0.0 AND 1.0),
    preference_match_score FLOAT DEFAULT 0.0 CHECK (preference_match_score BETWEEN 0.0 AND 1.0),
    overall_confidence FLOAT DEFAULT 0.0 CHECK (overall_confidence BETWEEN 0.0 AND 1.0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
    feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
    feedback_comment TEXT,
    recommended_by VARCHAR(50) DEFAULT 'route_agent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 7. 安全建议表
CREATE TABLE IF NOT EXISTS safety_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('route_safety', 'time_safety', 'weather_safety', 'equipment', 'emergency_prep', 'general')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    action_required BOOLEAN DEFAULT FALSE,
    location_context JSONB DEFAULT '{}', -- 位置相关上下文
    time_context JSONB DEFAULT '{}', -- 时间相关上下文
    user_context JSONB DEFAULT '{}', -- 用户相关上下文
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'dismissed', 'expired')),
    recommended_by VARCHAR(50) DEFAULT 'safety_agent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- 8. 跨智能体协调记录表
CREATE TABLE IF NOT EXISTS agent_coordination_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('route_selected', 'challenge_started', 'safety_alert', 'preference_updated', 'cross_agent_sync')),
    source_agent VARCHAR(50) NOT NULL REFERENCES agent_types(id),
    target_agents VARCHAR(200)[], -- 目标智能体数组
    event_data JSONB DEFAULT '{}', -- 事件数据
    coordination_result JSONB DEFAULT '{}', -- 协调结果
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id ON agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_type ON agent_conversations(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_session_id ON agent_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_status ON agent_conversations(status);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_created_at ON agent_conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation_id ON agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_role ON agent_messages(role);
CREATE INDEX IF NOT EXISTS idx_agent_messages_type ON agent_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created_at ON agent_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_agent_preferences_user_id ON user_agent_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agent_preferences_agent_type ON user_agent_preferences(agent_type);

CREATE INDEX IF NOT EXISTS idx_challenge_recommendations_user_id ON challenge_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_recommendations_type ON challenge_recommendations(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenge_recommendations_status ON challenge_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_challenge_recommendations_created_at ON challenge_recommendations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_route_recommendations_user_id ON agent_route_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_route_recommendations_route_id ON agent_route_recommendations(route_id);
CREATE INDEX IF NOT EXISTS idx_agent_route_recommendations_status ON agent_route_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_agent_route_recommendations_confidence ON agent_route_recommendations(overall_confidence DESC);

CREATE INDEX IF NOT EXISTS idx_safety_recommendations_user_id ON safety_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_recommendations_type ON safety_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_safety_recommendations_priority ON safety_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_safety_recommendations_status ON safety_recommendations(status);

CREATE INDEX IF NOT EXISTS idx_agent_coordination_logs_user_id ON agent_coordination_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_coordination_logs_event_type ON agent_coordination_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_agent_coordination_logs_source_agent ON agent_coordination_logs(source_agent);
CREATE INDEX IF NOT EXISTS idx_agent_coordination_logs_created_at ON agent_coordination_logs(created_at DESC);

-- 启用RLS
ALTER TABLE agent_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agent_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_route_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_coordination_logs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 智能体类型表（公开可读）
CREATE POLICY "Anyone can view agent types" ON agent_types
    FOR SELECT USING (true);

-- 智能体对话会话表
CREATE POLICY "Users can view their own agent conversations" ON agent_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent conversations" ON agent_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent conversations" ON agent_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- 智能体消息表
CREATE POLICY "Users can view messages from their conversations" ON agent_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agent_conversations 
            WHERE agent_conversations.id = agent_messages.conversation_id 
            AND agent_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their conversations" ON agent_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM agent_conversations 
            WHERE agent_conversations.id = agent_messages.conversation_id 
            AND agent_conversations.user_id = auth.uid()
        )
    );

-- 用户智能体偏好表
CREATE POLICY "Users can manage their own agent preferences" ON user_agent_preferences
    FOR ALL USING (auth.uid() = user_id);

-- 挑战推荐表
CREATE POLICY "Users can manage their own challenge recommendations" ON challenge_recommendations
    FOR ALL USING (auth.uid() = user_id);

-- 路线推荐表
CREATE POLICY "Users can manage their own route recommendations" ON agent_route_recommendations
    FOR ALL USING (auth.uid() = user_id);

-- 安全建议表
CREATE POLICY "Users can manage their own safety recommendations" ON safety_recommendations
    FOR ALL USING (auth.uid() = user_id);

-- 协调记录表
CREATE POLICY "Users can view their own coordination logs" ON agent_coordination_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create coordination logs" ON agent_coordination_logs
    FOR INSERT WITH CHECK (true);

-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_agent_conversation_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity_at = NOW();
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_agent_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_agent_conversations_activity 
    BEFORE UPDATE ON agent_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_agent_conversation_activity();

CREATE TRIGGER update_user_agent_preferences_timestamp 
    BEFORE UPDATE ON user_agent_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_agent_preferences_timestamp();

-- 插入智能体类型数据
INSERT INTO agent_types (id, name, description, capabilities) VALUES
('route_agent', '路线推荐智能体', '专注于路线规划、地理信息、个性化推荐', 
 '["route_planning", "geographic_analysis", "personalized_recommendations", "weather_integration", "difficulty_assessment"]'),
('challenge_agent', '挑战竞赛智能体', '专注于目标设定、进度跟踪、激励鼓励', 
 '["goal_setting", "progress_tracking", "motivation", "challenge_creation", "achievement_analysis"]'),
('safety_agent', '安全顾问智能体', '专注于安全评估、风险预警、紧急响应', 
 '["safety_assessment", "risk_analysis", "emergency_response", "location_safety", "real_time_monitoring"]')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities;

-- 设置权限
GRANT SELECT ON agent_types TO anon, authenticated;
GRANT ALL PRIVILEGES ON agent_conversations TO authenticated;
GRANT ALL PRIVILEGES ON agent_messages TO authenticated;
GRANT ALL PRIVILEGES ON user_agent_preferences TO authenticated;
GRANT ALL PRIVILEGES ON challenge_recommendations TO authenticated;
GRANT ALL PRIVILEGES ON agent_route_recommendations TO authenticated;
GRANT ALL PRIVILEGES ON safety_recommendations TO authenticated;
GRANT SELECT, INSERT ON agent_coordination_logs TO authenticated;

-- 创建有用的视图
CREATE VIEW user_agent_activity_summary AS
SELECT 
    ac.user_id,
    ac.agent_type,
    COUNT(ac.id) as total_conversations,
    COUNT(am.id) as total_messages,
    MAX(ac.last_activity_at) as last_activity,
    AVG(CASE WHEN am.role = 'agent' AND am.confidence_score > 0 THEN am.confidence_score END) as avg_confidence
FROM agent_conversations ac
LEFT JOIN agent_messages am ON ac.id = am.conversation_id
GROUP BY ac.user_id, ac.agent_type;

CREATE VIEW active_recommendations_summary AS
SELECT 
    user_id,
    'challenge' as recommendation_type,
    COUNT(*) as active_count
FROM challenge_recommendations 
WHERE status = 'active'
GROUP BY user_id
UNION ALL
SELECT 
    user_id,
    'route' as recommendation_type,
    COUNT(*) as active_count
FROM agent_route_recommendations 
WHERE status = 'pending'
GROUP BY user_id
UNION ALL
SELECT 
    user_id,
    'safety' as recommendation_type,
    COUNT(*) as active_count
FROM safety_recommendations 
WHERE status = 'active'
GROUP BY user_id;

-- 为视图设置权限
GRANT SELECT ON user_agent_activity_summary TO authenticated;
GRANT SELECT ON active_recommendations_summary TO authenticated;