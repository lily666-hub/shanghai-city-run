-- 安全评估系统数据库表结构
-- 创建时间：2024-01-20

-- 创建用户安全配置表（因为auth.users表不能直接修改）
CREATE TABLE IF NOT EXISTS user_safety_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_female_verified BOOLEAN DEFAULT FALSE,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  safety_preferences JSONB DEFAULT '{
    "enable_real_time_tracking": true,
    "share_location_with_emergency_contacts": true,
    "enable_safety_alerts": true,
    "preferred_safety_level": "medium",
    "enable_women_only_features": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 创建位置历史表
CREATE TABLE IF NOT EXISTS location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(6, 2),
    speed DECIMAL(6, 2),
    heading DECIMAL(6, 2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 创建安全评估表
CREATE TABLE IF NOT EXISTS safety_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES location_history(id),
    user_id UUID REFERENCES auth.users(id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    safety_score DECIMAL(3, 2) CHECK (safety_score >= 0 AND safety_score <= 10),
    time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening', 'night')),
    risk_factors JSONB DEFAULT '[]',
    environmental_data JSONB DEFAULT '{}',
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 扩展路线表，添加安全评估相关字段
ALTER TABLE routes ADD COLUMN IF NOT EXISTS female_friendly BOOLEAN DEFAULT FALSE;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS avg_safety_score DECIMAL(3, 2);
ALTER TABLE routes ADD COLUMN IF NOT EXISTS safety_features JSONB DEFAULT '[]';

-- 创建路线安全评分表
CREATE TABLE IF NOT EXISTS route_safety_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening', 'night')),
    safety_score DECIMAL(3, 2) CHECK (safety_score >= 0 AND safety_score <= 10),
    risk_analysis JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建紧急事件表
CREATE TABLE IF NOT EXISTS emergency_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    emergency_type VARCHAR(50) NOT NULL CHECK (emergency_type IN ('personal_safety', 'medical', 'accident', 'harassment', 'lost', 'other')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 创建紧急联系人表
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建安全报告表
CREATE TABLE IF NOT EXISTS safety_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'route_specific')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    total_runs INTEGER DEFAULT 0,
    avg_safety_score DECIMAL(3, 2),
    risk_incidents INTEGER DEFAULT 0,
    safe_routes_used INTEGER DEFAULT 0,
    recommendations JSONB DEFAULT '[]',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建女性专区功能表
CREATE TABLE IF NOT EXISTS women_safety_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_type VARCHAR(30) NOT NULL CHECK (feature_type IN ('buddy_system', 'safe_route', 'emergency_network', 'community_alert')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    participants JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建结伴跑步匹配表
CREATE TABLE IF NOT EXISTS buddy_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    matched_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    preferred_time VARCHAR(50),
    preferred_route VARCHAR(255),
    safety_level_required VARCHAR(20) DEFAULT 'standard' CHECK (safety_level_required IN ('standard', 'high', 'maximum')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 扩展跑步记录表，添加安全评估相关字段（使用running_history表）
ALTER TABLE running_history ADD COLUMN IF NOT EXISTS safety_score DECIMAL(3, 2);
ALTER TABLE running_history ADD COLUMN IF NOT EXISTS risk_factors JSONB DEFAULT '[]';
ALTER TABLE running_history ADD COLUMN IF NOT EXISTS emergency_triggered BOOLEAN DEFAULT FALSE;

-- 创建索引以提高查询性能

-- 用户安全配置表索引
CREATE INDEX IF NOT EXISTS idx_user_safety_profiles_user_id ON user_safety_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_safety_profiles_is_female_verified ON user_safety_profiles(is_female_verified);

-- 位置历史表索引
CREATE INDEX IF NOT EXISTS idx_location_history_user_id ON location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_location_history_recorded_at ON location_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_history_location ON location_history(latitude, longitude);

-- 安全评估表索引
CREATE INDEX IF NOT EXISTS idx_safety_assessments_location_id ON safety_assessments(location_id);
CREATE INDEX IF NOT EXISTS idx_safety_assessments_user_id ON safety_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_assessments_time_slot ON safety_assessments(time_slot);
CREATE INDEX IF NOT EXISTS idx_safety_assessments_safety_score ON safety_assessments(safety_score DESC);
CREATE INDEX IF NOT EXISTS idx_safety_assessments_assessed_at ON safety_assessments(assessed_at DESC);

-- 路线安全评分表索引
CREATE INDEX IF NOT EXISTS idx_route_safety_scores_route_id ON route_safety_scores(route_id);
CREATE INDEX IF NOT EXISTS idx_route_safety_scores_time_slot ON route_safety_scores(time_slot);
CREATE INDEX IF NOT EXISTS idx_route_safety_scores_safety_score ON route_safety_scores(safety_score DESC);

-- 路线表索引
CREATE INDEX IF NOT EXISTS idx_routes_female_friendly ON routes(female_friendly);
CREATE INDEX IF NOT EXISTS idx_routes_avg_safety_score ON routes(avg_safety_score DESC);

-- 紧急事件表索引
CREATE INDEX IF NOT EXISTS idx_emergency_events_user_id ON emergency_events(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_status ON emergency_events(status);
CREATE INDEX IF NOT EXISTS idx_emergency_events_created_at ON emergency_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_events_location ON emergency_events(latitude, longitude);

-- 紧急联系人表索引
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_is_primary ON emergency_contacts(is_primary);

-- 安全报告表索引
CREATE INDEX IF NOT EXISTS idx_safety_reports_user_id ON safety_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_reports_report_type ON safety_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_safety_reports_generated_at ON safety_reports(generated_at DESC);

-- 结伴跑步匹配表索引
CREATE INDEX IF NOT EXISTS idx_buddy_matches_requester_id ON buddy_matches(requester_id);
CREATE INDEX IF NOT EXISTS idx_buddy_matches_matched_user_id ON buddy_matches(matched_user_id);
CREATE INDEX IF NOT EXISTS idx_buddy_matches_status ON buddy_matches(status);
CREATE INDEX IF NOT EXISTS idx_buddy_matches_created_at ON buddy_matches(created_at DESC);

-- 插入示例安全路线数据（暂时跳过created_by字段，因为可能没有用户数据）
INSERT INTO routes (name, description, gps_coordinates, distance, difficulty_level, terrain_type, features, avg_rating, total_ratings, female_friendly, avg_safety_score, safety_features) VALUES
('外滩安全夜跑路线', '专为女性设计的安全夜跑路线，全程监控覆盖，照明充足', 
 '{"coordinates": [[121.4737, 31.2304], [121.4787, 31.2354]], "waypoints": [[121.4737, 31.2304], [121.4787, 31.2354]]}', 
 3.2, 3, 'urban', '["江景", "城市景观", "24小时监控", "充足照明", "安保巡逻", "紧急呼叫点"]', 
 4.8, 156, true, 8.5, '["24小时监控", "充足照明", "安保巡逻", "紧急呼叫点"]'),

('人民公园女性专属路线', '女性专属安全跑步路线，环境优美，安全系数高', 
 '{"coordinates": [[121.4751, 31.2317], [121.4801, 31.2367]], "waypoints": [[121.4751, 31.2317], [121.4801, 31.2367]]}', 
 2.8, 2, 'park', '["公园", "自然风光", "女性专用时段", "安全志愿者", "紧急求助设施", "良好照明"]', 
 4.9, 203, true, 9.2, '["女性专用时段", "安全志愿者", "紧急求助设施", "良好照明"]'),

('陆家嘴安全商务区路线', '商务区安全跑步路线，人流密集，安全保障好', 
 '{"coordinates": [[121.4990, 31.2396], [121.5040, 31.2446]], "waypoints": [[121.4990, 31.2396], [121.5040, 31.2446]]}', 
 4.1, 5, 'urban', '["商业区", "现代艺术", "商务区安保", "人流密集", "监控完善"]', 
 4.6, 89, false, 7.8, '["商务区安保", "人流密集", "监控完善"]')
ON CONFLICT (id) DO NOTHING;

-- 插入时间段安全评分数据
INSERT INTO route_safety_scores (route_id, time_slot, safety_score, risk_analysis) 
SELECT r.id, 'morning', 9.0, '{"lighting": "excellent", "crowd": "high", "police_patrol": "active", "risk_level": "low"}'
FROM routes r WHERE r.female_friendly = true
ON CONFLICT DO NOTHING;

INSERT INTO route_safety_scores (route_id, time_slot, safety_score, risk_analysis) 
SELECT r.id, 'afternoon', 8.5, '{"lighting": "good", "crowd": "very_high", "police_patrol": "active", "risk_level": "low"}'
FROM routes r WHERE r.female_friendly = true
ON CONFLICT DO NOTHING;

INSERT INTO route_safety_scores (route_id, time_slot, safety_score, risk_analysis) 
SELECT r.id, 'evening', 7.5, '{"lighting": "moderate", "crowd": "medium", "police_patrol": "regular", "risk_level": "medium"}'
FROM routes r WHERE r.female_friendly = true
ON CONFLICT DO NOTHING;

INSERT INTO route_safety_scores (route_id, time_slot, safety_score, risk_analysis) 
SELECT r.id, 'night', 6.0, '{"lighting": "limited", "crowd": "low", "police_patrol": "reduced", "risk_level": "high"}'
FROM routes r WHERE r.female_friendly = true
ON CONFLICT DO NOTHING;

-- 插入女性专区功能数据
INSERT INTO women_safety_features (feature_type, name, description, is_active) VALUES
('buddy_system', '结伴跑步系统', '为女性用户提供安全的结伴跑步匹配服务', true),
('safe_route', '女性专属路线', '经过安全认证的女性专用跑步路线', true),
('emergency_network', '紧急响应网络', '24小时女性安全紧急响应服务', true),
('community_alert', '社区安全预警', '女性跑步者安全信息共享平台', true)
ON CONFLICT DO NOTHING;

-- 设置行级安全策略 (RLS)
ALTER TABLE user_safety_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_safety_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE women_safety_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_matches ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略

-- 用户安全配置表策略
CREATE POLICY "Users can manage own safety profiles" ON user_safety_profiles
    FOR ALL USING (auth.uid() = user_id);

-- 位置历史表策略
CREATE POLICY "Users can view own location history" ON location_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own location history" ON location_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 安全评估表策略
CREATE POLICY "Users can view own safety assessments" ON safety_assessments
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert safety assessments" ON safety_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 路线安全评分表策略（所有用户可查看）
CREATE POLICY "Anyone can view route safety scores" ON route_safety_scores
    FOR SELECT USING (true);

-- 紧急事件表策略
CREATE POLICY "Users can view own emergency events" ON emergency_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency events" ON emergency_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency events" ON emergency_events
    FOR UPDATE USING (auth.uid() = user_id);

-- 紧急联系人表策略
CREATE POLICY "Users can manage own emergency contacts" ON emergency_contacts
    FOR ALL USING (auth.uid() = user_id);

-- 安全报告表策略
CREATE POLICY "Users can view own safety reports" ON safety_reports
    FOR SELECT USING (auth.uid() = user_id);

-- 女性专区功能表策略（所有用户可查看）
CREATE POLICY "Anyone can view women safety features" ON women_safety_features
    FOR SELECT USING (true);

-- 结伴跑步匹配表策略
CREATE POLICY "Users can view relevant buddy matches" ON buddy_matches
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can insert own buddy match requests" ON buddy_matches
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update relevant buddy matches" ON buddy_matches
    FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = matched_user_id);

-- 授予权限
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 特别授权：允许匿名用户查看路线安全评分和女性专区功能
GRANT SELECT ON route_safety_scores TO anon;
GRANT SELECT ON women_safety_features TO anon;
GRANT SELECT ON routes TO anon;

-- 创建触发器函数：自动更新路线平均安全评分
CREATE OR REPLACE FUNCTION update_route_avg_safety_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE routes 
    SET avg_safety_score = (
        SELECT AVG(safety_score) 
        FROM route_safety_scores 
        WHERE route_id = COALESCE(NEW.route_id, OLD.route_id)
    )
    WHERE id = COALESCE(NEW.route_id, OLD.route_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_route_avg_safety_score
    AFTER INSERT OR UPDATE OR DELETE ON route_safety_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_route_avg_safety_score();

-- 创建触发器函数：自动更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表创建更新时间戳触发器
CREATE TRIGGER trigger_update_user_safety_profiles_updated_at
    BEFORE UPDATE ON user_safety_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_route_safety_scores_updated_at
    BEFORE UPDATE ON route_safety_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建函数：获取用户当前安全状态
CREATE OR REPLACE FUNCTION get_user_safety_status(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    latest_location RECORD;
    recent_assessment RECORD;
BEGIN
    -- 获取最新位置
    SELECT * INTO latest_location
    FROM location_history
    WHERE user_id = user_uuid
    ORDER BY recorded_at DESC
    LIMIT 1;
    
    -- 获取最近的安全评估
    SELECT * INTO recent_assessment
    FROM safety_assessments
    WHERE user_id = user_uuid
    ORDER BY assessed_at DESC
    LIMIT 1;
    
    -- 构建结果
    result := json_build_object(
        'user_id', user_uuid,
        'latest_location', row_to_json(latest_location),
        'recent_assessment', row_to_json(recent_assessment),
        'safety_status', CASE 
            WHEN recent_assessment.safety_score >= 8 THEN 'safe'
            WHEN recent_assessment.safety_score >= 5 THEN 'warning'
            ELSE 'danger'
        END,
        'last_updated', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：获取时间段安全评估
CREATE OR REPLACE FUNCTION get_time_slot_safety(area_lat DECIMAL, area_lng DECIMAL, target_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
    result JSON;
    hourly_scores JSON[];
    i INTEGER;
    time_slot VARCHAR;
    avg_score DECIMAL;
BEGIN
    -- 初始化24小时评分数组
    hourly_scores := ARRAY[]::JSON[];
    
    -- 计算每个小时的安全评分
    FOR i IN 0..23 LOOP
        -- 确定时间段
        time_slot := CASE 
            WHEN i >= 6 AND i < 10 THEN 'morning'
            WHEN i >= 10 AND i < 18 THEN 'afternoon'
            WHEN i >= 18 AND i < 22 THEN 'evening'
            ELSE 'night'
        END;
        
        -- 获取该时间段的平均安全评分
        SELECT AVG(safety_score) INTO avg_score
        FROM safety_assessments
        WHERE time_slot = time_slot
        AND latitude BETWEEN area_lat - 0.01 AND area_lat + 0.01
        AND longitude BETWEEN area_lng - 0.01 AND area_lng + 0.01
        AND DATE(assessed_at) = target_date;
        
        -- 如果没有数据，使用默认评分
        IF avg_score IS NULL THEN
            avg_score := CASE time_slot
                WHEN 'morning' THEN 8.0
                WHEN 'afternoon' THEN 8.5
                WHEN 'evening' THEN 6.5
                WHEN 'night' THEN 4.0
            END;
        END IF;
        
        hourly_scores := array_append(hourly_scores, json_build_object(
            'hour', i,
            'time_slot', time_slot,
            'safety_score', avg_score,
            'recommendation', CASE 
                WHEN avg_score >= 8 THEN 'recommended'
                WHEN avg_score >= 6 THEN 'caution'
                ELSE 'not_recommended'
            END
        ));
    END LOOP;
    
    -- 构建最终结果
    result := json_build_object(
        'area', json_build_object('latitude', area_lat, 'longitude', area_lng),
        'date', target_date,
        'hourly_scores', hourly_scores,
        'generated_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授予函数执行权限
GRANT EXECUTE ON FUNCTION get_user_safety_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_time_slot_safety(DECIMAL, DECIMAL, DATE) TO authenticated, anon;

COMMENT ON TABLE user_safety_profiles IS '用户安全配置表';
COMMENT ON TABLE location_history IS '用户位置历史记录表';
COMMENT ON TABLE safety_assessments IS '安全评估记录表';
COMMENT ON TABLE route_safety_scores IS '路线安全评分表';
COMMENT ON TABLE emergency_events IS '紧急事件记录表';
COMMENT ON TABLE emergency_contacts IS '紧急联系人表';
COMMENT ON TABLE safety_reports IS '安全报告表';
COMMENT ON TABLE women_safety_features IS '女性专区功能表';
COMMENT ON TABLE buddy_matches IS '结伴跑步匹配表';