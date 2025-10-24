-- 智能路线推荐系统数据库结构
-- 创建用户偏好表
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    difficulty_preference VARCHAR(20) DEFAULT 'moderate' CHECK (difficulty_preference IN ('easy', 'moderate', 'hard')),
    distance_range JSONB DEFAULT '{"min": 2, "max": 10}',
    terrain_preferences JSONB DEFAULT '["park", "street", "trail"]',
    time_preferences JSONB DEFAULT '["morning", "evening"]',
    weather_preferences JSONB DEFAULT '{"avoid_rain": true, "prefer_cool": true}',
    fitness_level INTEGER DEFAULT 5 CHECK (fitness_level BETWEEN 1 AND 10),
    running_goals JSONB DEFAULT '["fitness", "exploration"]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建路线表
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    gps_coordinates JSONB NOT NULL,
    distance FLOAT NOT NULL,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    terrain_type VARCHAR(50),
    features JSONB DEFAULT '{}',
    avg_rating FLOAT DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    elevation_gain FLOAT DEFAULT 0,
    estimated_duration INTEGER, -- 预估时间（分钟）
    safety_rating INTEGER DEFAULT 5 CHECK (safety_rating BETWEEN 1 AND 5),
    lighting_quality VARCHAR(20) DEFAULT 'good' CHECK (lighting_quality IN ('poor', 'fair', 'good', 'excellent')),
    weather_suitability JSONB DEFAULT '{"sunny": true, "rainy": false, "hot": true, "cold": true}',
    time_suitability JSONB DEFAULT '{"morning": true, "afternoon": true, "evening": true, "night": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建跑步历史表（扩展现有runs表功能）
CREATE TABLE IF NOT EXISTS running_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    route_id UUID REFERENCES routes(id),
    distance FLOAT NOT NULL,
    duration INTEGER NOT NULL, -- 秒
    avg_pace FLOAT, -- 分钟/公里
    max_speed FLOAT,
    calories_burned INTEGER,
    heart_rate_avg INTEGER,
    heart_rate_max INTEGER,
    gps_data JSONB,
    weather_condition VARCHAR(50),
    temperature FLOAT,
    humidity INTEGER,
    air_quality_index INTEGER,
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    effort_level INTEGER CHECK (effort_level BETWEEN 1 AND 10),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建路线反馈表
CREATE TABLE IF NOT EXISTS route_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    tags JSONB DEFAULT '[]',
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
    scenery_rating INTEGER CHECK (scenery_rating BETWEEN 1 AND 5),
    safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
    crowd_level VARCHAR(20) CHECK (crowd_level IN ('empty', 'light', 'moderate', 'busy', 'crowded')),
    helpful_count INTEGER DEFAULT 0,
    weather_during_run VARCHAR(50),
    time_of_day VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建推荐记录表
CREATE TABLE IF NOT EXISTS route_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    confidence_score FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
    reasoning JSONB NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    weather_factor JSONB,
    time_factor VARCHAR(20),
    difficulty_match_score FLOAT,
    preference_match_score FLOAT,
    novelty_score FLOAT,
    user_clicked BOOLEAN DEFAULT FALSE,
    user_completed BOOLEAN DEFAULT FALSE,
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户活动统计表
CREATE TABLE IF NOT EXISTS user_activity_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_runs INTEGER DEFAULT 0,
    total_distance FLOAT DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    avg_pace FLOAT DEFAULT 0,
    favorite_terrain VARCHAR(50),
    favorite_time VARCHAR(20),
    fitness_improvement_score FLOAT DEFAULT 0,
    consistency_score FLOAT DEFAULT 0,
    exploration_score FLOAT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_running_history_user_id ON running_history(user_id);
CREATE INDEX IF NOT EXISTS idx_running_history_completed_at ON running_history(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_running_history_route_id ON running_history(route_id);
CREATE INDEX IF NOT EXISTS idx_route_feedback_route_id ON route_feedback(route_id);
CREATE INDEX IF NOT EXISTS idx_route_feedback_rating ON route_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_route_feedback_user_id ON route_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_routes_difficulty ON routes(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_routes_distance ON routes(distance);
CREATE INDEX IF NOT EXISTS idx_routes_terrain ON routes(terrain_type);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON route_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON route_recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_confidence ON route_recommendations(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_activity_stats(user_id);

-- 设置RLS策略
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE running_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_stats ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own history" ON running_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON running_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own history" ON running_history FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" ON route_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feedback" ON route_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feedback" ON route_feedback FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recommendations" ON route_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recommendations" ON route_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON route_recommendations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stats" ON user_activity_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON user_activity_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_activity_stats FOR UPDATE USING (auth.uid() = user_id);

-- 路线表公开可读，但只有认证用户可以查看详细信息
CREATE POLICY "Anyone can view routes" ON routes FOR SELECT USING (true);

-- 路线反馈公开可读（用于显示其他用户评价）
CREATE POLICY "Anyone can view route feedback" ON route_feedback FOR SELECT USING (true);

-- 授权
GRANT SELECT ON routes TO anon, authenticated;
GRANT SELECT ON route_feedback TO anon, authenticated;
GRANT ALL ON user_preferences, running_history, route_recommendations, user_activity_stats TO authenticated;
GRANT INSERT, UPDATE ON route_feedback TO authenticated;

-- 初始化示例路线数据
INSERT INTO routes (name, description, gps_coordinates, distance, difficulty_level, terrain_type, features, estimated_duration, safety_rating, lighting_quality, weather_suitability, time_suitability) VALUES
('外滩滨江步道', '沿黄浦江的经典跑步路线，可欣赏浦江两岸美景，平坦易跑，适合各个水平的跑者', 
 '[{"lat": 31.2304, "lng": 121.4737}, {"lat": 31.2404, "lng": 121.4837}, {"lat": 31.2454, "lng": 121.4887}]', 
 5.2, 3, 'waterfront', '{"scenic": true, "flat": true, "lighting": "excellent", "landmarks": ["外滩", "东方明珠", "金茂大厦"], "restrooms": true, "water_fountains": true}', 
 35, 5, 'excellent', '{"sunny": true, "rainy": false, "hot": true, "cold": true}', '{"morning": true, "afternoon": true, "evening": true, "night": true}'),

('世纪公园环路', '上海最大的城市公园内的跑步环路，绿树成荫，空气清新，是晨跑的绝佳选择', 
 '[{"lat": 31.2072, "lng": 121.5533}, {"lat": 31.2172, "lng": 121.5633}, {"lat": 31.2122, "lng": 121.5683}]', 
 3.8, 2, 'park', '{"green": true, "peaceful": true, "air_quality": "excellent", "shade": true, "wildlife": true, "restrooms": true}', 
 25, 5, 'good', '{"sunny": true, "rainy": true, "hot": true, "cold": true}', '{"morning": true, "afternoon": true, "evening": true, "night": false}'),

('陆家嘴金融区', '现代化商务区跑步路线，高楼林立的都市风光，有一定挑战性的坡度变化', 
 '[{"lat": 31.2352, "lng": 121.5057}, {"lat": 31.2452, "lng": 121.5157}, {"lat": 31.2402, "lng": 121.5207}]', 
 4.5, 4, 'urban', '{"modern": true, "challenging": true, "night_view": "spectacular", "elevation_change": true, "business_district": true}', 
 30, 4, 'excellent', '{"sunny": true, "rainy": false, "hot": false, "cold": true}', '{"morning": true, "afternoon": false, "evening": true, "night": true}'),

('徐家汇公园绿道', '城市中的绿色氧吧，适合轻松跑和恢复性训练，路面平整，环境优美', 
 '[{"lat": 31.1886, "lng": 121.4335}, {"lat": 31.1936, "lng": 121.4385}, {"lat": 31.1986, "lng": 121.4335}]', 
 2.8, 1, 'park', '{"beginner_friendly": true, "flat": true, "green": true, "quiet": true, "family_friendly": true}', 
 20, 5, 'good', '{"sunny": true, "rainy": true, "hot": true, "cold": true}', '{"morning": true, "afternoon": true, "evening": true, "night": false}'),

('黄浦江西岸艺术区', '沿江艺术文化路线，结合艺术欣赏与跑步锻炼，中等难度，风景独特', 
 '[{"lat": 31.1654, "lng": 121.4654}, {"lat": 31.1754, "lng": 121.4754}, {"lat": 31.1804, "lng": 121.4804}]', 
 6.5, 5, 'waterfront', '{"artistic": true, "cultural": true, "scenic": true, "museums": true, "galleries": true, "moderate_hills": true}', 
 45, 4, 'good', '{"sunny": true, "rainy": false, "hot": true, "cold": true}', '{"morning": true, "afternoon": true, "evening": true, "night": false}'),

('静安雕塑公园环线', '市中心的艺术公园，短距离高质量跑步体验，适合午休时间的快速锻炼', 
 '[{"lat": 31.2286, "lng": 121.4486}, {"lat": 31.2336, "lng": 121.4536}, {"lat": 31.2286, "lng": 121.4586}]', 
 2.2, 2, 'park', '{"art": true, "central": true, "convenient": true, "sculptures": true, "short_distance": true}', 
 15, 5, 'excellent', '{"sunny": true, "rainy": true, "hot": true, "cold": true}', '{"morning": true, "afternoon": true, "evening": true, "night": true}'),

('复旦大学校园路线', '学术氛围浓厚的校园跑步路线，有一定起伏，适合挑战自我的跑者', 
 '[{"lat": 31.2989, "lng": 121.5015}, {"lat": 31.3039, "lng": 121.5065}, {"lat": 31.3089, "lng": 121.5015}]', 
 4.2, 6, 'campus', '{"academic": true, "hills": true, "challenging": true, "historic": true, "tree_lined": true}', 
 35, 4, 'good', '{"sunny": true, "rainy": false, "hot": false, "cold": true}', '{"morning": true, "afternoon": false, "evening": true, "night": false}'),

('上海植物园慢跑道', '专业的植物园慢跑道，四季花卉变化，空气质量极佳，适合放松身心', 
 '[{"lat": 31.1486, "lng": 121.4386}, {"lat": 31.1536, "lng": 121.4436}, {"lat": 31.1586, "lng": 121.4486}]', 
 3.5, 2, 'botanical', '{"flowers": true, "seasonal_beauty": true, "air_quality": "excellent", "peaceful": true, "educational": true}', 
 25, 5, 'good', '{"sunny": true, "rainy": true, "hot": true, "cold": true}', '{"morning": true, "afternoon": true, "evening": false, "night": false}');

-- 创建触发器函数来自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建触发器
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_activity_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();