-- AI智能路线推荐系统数据表 V2
-- 创建时间: 2024-01-20
-- 描述: 为AI智能路线推荐功能创建相关数据表（兼容现有user_preferences表）

-- 1. 路线推荐表 (route_recommendations)
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

-- 2. 推荐反馈表 (recommendation_feedback)
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

-- 3. 跑步历史表 (running_history)
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

-- 4. 路线评分表 (route_ratings)
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
GRANT ALL PRIVILEGES ON route_recommendations TO authenticated;
GRANT SELECT ON route_recommendations TO anon;

GRANT ALL PRIVILEGES ON recommendation_feedback TO authenticated;
GRANT SELECT ON recommendation_feedback TO anon;

GRANT ALL PRIVILEGES ON running_history TO authenticated;
GRANT SELECT ON running_history TO anon;

GRANT ALL PRIVILEGES ON route_ratings TO authenticated;
GRANT SELECT ON route_ratings TO anon;

-- 创建一些示例跑步历史记录（使用现有表结构）
-- 注意：现有的running_history表使用duration而不是duration_minutes，route_id是UUID类型
-- 这里暂时跳过示例数据插入，因为需要匹配现有的表结构

-- 创建一些示例路线评分
-- 注意：需要真实的用户ID，这里暂时跳过示例数据插入
-- 用户可以在使用应用时自然生成这些数据

-- 创建触发器函数，自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建触发器
CREATE TRIGGER update_route_ratings_updated_at 
    BEFORE UPDATE ON route_ratings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();