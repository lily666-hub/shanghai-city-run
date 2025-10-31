-- AI智能路线推荐系统数据表
-- 创建时间: 2024-01-20
-- 描述: 为AI智能路线推荐功能创建相关数据表

-- 1. 用户偏好表 (user_preferences)
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    running_preferences JSONB DEFAULT '{}',
    safety_preferences JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- 每个用户只有一条偏好记录
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated_at ON user_preferences(updated_at DESC);

-- 2. 路线推荐表 (route_recommendations)
CREATE TABLE IF NOT EXISTS route_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    route_id VARCHAR(50) NOT NULL, -- 对应Routes.tsx中的路线ID
    recommendation_type VARCHAR(50) DEFAULT 'daily',
    confidence_score FLOAT NOT NULL DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    reasoning TEXT,
    context JSONB DEFAULT '{}',
    ai_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_route_recommendations_user_id ON route_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_route_recommendations_route_id ON route_recommendations(route_id);
CREATE INDEX IF NOT EXISTS idx_route_recommendations_created_at ON route_recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_recommendations_confidence ON route_recommendations(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_route_recommendations_type ON route_recommendations(recommendation_type);

-- 3. 推荐反馈表 (recommendation_feedback)
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES route_recommendations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    is_used BOOLEAN DEFAULT FALSE,
    usage_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_recommendation_id ON recommendation_feedback(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_rating ON recommendation_feedback(rating DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_created_at ON recommendation_feedback(created_at DESC);

-- 4. 跑步历史表 (running_history)
CREATE TABLE IF NOT EXISTS running_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    route_id VARCHAR(50), -- 对应Routes.tsx中的路线ID，可为空（自定义路线）
    distance FLOAT NOT NULL CHECK (distance > 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    performance_data JSONB DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_running_history_user_id ON running_history(user_id);
CREATE INDEX IF NOT EXISTS idx_running_history_route_id ON running_history(route_id);
CREATE INDEX IF NOT EXISTS idx_running_history_completed_at ON running_history(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_running_history_distance ON running_history(distance);

-- 5. 路线评分表 (route_ratings)
CREATE TABLE IF NOT EXISTS route_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    route_id VARCHAR(50) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, route_id) -- 每个用户对每条路线只能评分一次
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_route_ratings_route_id ON route_ratings(route_id);
CREATE INDEX IF NOT EXISTS idx_route_ratings_user_id ON route_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_route_ratings_rating ON route_ratings(rating DESC);
CREATE INDEX IF NOT EXISTS idx_route_ratings_created_at ON route_ratings(created_at DESC);

-- 权限设置
GRANT ALL PRIVILEGES ON user_preferences TO authenticated;
GRANT SELECT ON user_preferences TO anon;

GRANT ALL PRIVILEGES ON route_recommendations TO authenticated;
GRANT SELECT ON route_recommendations TO anon;

GRANT ALL PRIVILEGES ON recommendation_feedback TO authenticated;
GRANT SELECT ON recommendation_feedback TO anon;

GRANT ALL PRIVILEGES ON running_history TO authenticated;
GRANT SELECT ON running_history TO anon;

GRANT ALL PRIVILEGES ON route_ratings TO authenticated;
GRANT SELECT ON route_ratings TO anon;

-- 初始化示例数据
-- 为演示用户创建默认偏好设置
INSERT INTO user_preferences (user_id, running_preferences, safety_preferences, notification_preferences) VALUES
('00000000-0000-0000-0000-000000000001', '{
    "difficulty": "medium",
    "preferredDistance": "5km",
    "timeOfDay": "morning",
    "routeTypes": ["park", "waterfront"],
    "avoidTraffic": true,
    "preferredWeather": ["sunny", "cloudy"],
    "maxElevation": 50
}', '{
    "nightRunning": false,
    "buddySystem": true,
    "emergencyContacts": true,
    "safetyAlerts": true,
    "avoidIsolatedAreas": true
}', '{
    "aiRecommendations": true,
    "weatherAlerts": true,
    "routeUpdates": true,
    "frequency": "daily",
    "pushNotifications": true
}')
ON CONFLICT (user_id) DO NOTHING;

-- 创建一些示例跑步历史记录
INSERT INTO running_history (user_id, route_id, distance, duration_minutes, performance_data, completed_at) VALUES
('00000000-0000-0000-0000-000000000001', '1', 5.2, 32, '{"avgPace": "6:10", "maxSpeed": 12.5, "calories": 280, "heartRate": {"avg": 145, "max": 165}}', NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000001', '2', 3.8, 25, '{"avgPace": "6:35", "maxSpeed": 11.8, "calories": 210, "heartRate": {"avg": 140, "max": 160}}', NOW() - INTERVAL '3 days'),
('00000000-0000-0000-0000-000000000001', '3', 6.5, 45, '{"avgPace": "6:55", "maxSpeed": 10.2, "calories": 350, "heartRate": {"avg": 150, "max": 170}}', NOW() - INTERVAL '1 week')
ON CONFLICT DO NOTHING;

-- 创建一些示例路线评分
INSERT INTO route_ratings (user_id, route_id, rating, review_text, tags) VALUES
('00000000-0000-0000-0000-000000000001', '1', 5, '外滩的景色真的很棒，跑步体验非常好！', '["景色优美", "路面平整", "适合晨跑"]'),
('00000000-0000-0000-0000-000000000001', '2', 4, '世纪公园环境很好，就是人有点多。', '["环境优美", "空气清新", "人流较多"]'),
('00000000-0000-0000-0000-000000000001', '3', 4, '都市跑步的感觉很棒，有挑战性。', '["都市风光", "有挑战性", "交通便利"]')
ON CONFLICT DO NOTHING;

-- 创建触发器函数，自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建触发器
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_ratings_updated_at 
    BEFORE UPDATE ON route_ratings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();