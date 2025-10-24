-- 创建路线反馈表
CREATE TABLE IF NOT EXISTS route_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
  scenery_rating INTEGER CHECK (scenery_rating >= 1 AND scenery_rating <= 5),
  tags TEXT[] DEFAULT '{}',
  comment TEXT,
  would_recommend BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(route_id, user_id)
);

-- 创建用户偏好学习表
CREATE TABLE IF NOT EXISTS user_preference_learning (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'feedback', 'click', 'favorite', 'complete'
  rating INTEGER,
  difficulty_preference INTEGER,
  safety_importance INTEGER,
  scenery_preference INTEGER,
  would_recommend BOOLEAN,
  tags TEXT[] DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户偏好配置表
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  preferred_difficulty_min INTEGER DEFAULT 1,
  preferred_difficulty_max INTEGER DEFAULT 10,
  preferred_distance_min DECIMAL DEFAULT 0,
  preferred_distance_max DECIMAL DEFAULT 50,
  preferred_terrain_types TEXT[] DEFAULT '{}',
  safety_importance DECIMAL DEFAULT 0.5,
  scenery_importance DECIMAL DEFAULT 0.5,
  challenge_seeking DECIMAL DEFAULT 0.5,
  exploration_tendency DECIMAL DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_route_feedback_route_id ON route_feedback(route_id);
CREATE INDEX IF NOT EXISTS idx_route_feedback_user_id ON route_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_route_feedback_rating ON route_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_route_feedback_created_at ON route_feedback(created_at);

CREATE INDEX IF NOT EXISTS idx_user_preference_learning_user_id ON user_preference_learning(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preference_learning_route_id ON user_preference_learning(route_id);
CREATE INDEX IF NOT EXISTS idx_user_preference_learning_action_type ON user_preference_learning(action_type);
CREATE INDEX IF NOT EXISTS idx_user_preference_learning_timestamp ON user_preference_learning(timestamp);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 启用行级安全策略
ALTER TABLE route_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preference_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- route_feedback表的策略
CREATE POLICY "Users can view all feedback" ON route_feedback
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own feedback" ON route_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON route_feedback
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback" ON route_feedback
  FOR DELETE USING (auth.uid() = user_id);

-- user_preference_learning表的策略
CREATE POLICY "Users can view their own learning data" ON user_preference_learning
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning data" ON user_preference_learning
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_preferences表的策略
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- 创建触发器函数来更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建触发器
CREATE TRIGGER update_route_feedback_updated_at 
  BEFORE UPDATE ON route_feedback 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 授权给anon和authenticated角色
GRANT SELECT ON route_feedback TO anon;
GRANT ALL PRIVILEGES ON route_feedback TO authenticated;

GRANT SELECT ON user_preference_learning TO anon;
GRANT ALL PRIVILEGES ON user_preference_learning TO authenticated;

GRANT SELECT ON user_preferences TO anon;
GRANT ALL PRIVILEGES ON user_preferences TO authenticated;