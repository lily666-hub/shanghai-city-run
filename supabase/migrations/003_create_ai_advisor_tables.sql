-- 创建AI智能安全顾问相关表
-- 基于技术架构文档的数据模型设计

-- 创建AI对话表
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    ai_provider VARCHAR(50) NOT NULL CHECK (ai_provider IN ('kimi', 'deepseek')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_emergency BOOLEAN DEFAULT FALSE,
    conversation_type VARCHAR(50) DEFAULT 'general' CHECK (conversation_type IN ('general', 'women_safety', 'emergency', 'analysis'))
);

-- 创建AI消息表
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSON DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confidence_score FLOAT DEFAULT 0.0
);

-- 创建AI上下文表
CREATE TABLE ai_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    location_data JSON DEFAULT '{}',
    user_context JSON DEFAULT '{}',
    safety_context JSON DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建安全档案表
CREATE TABLE safety_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    gender VARCHAR(20),
    preferences JSON DEFAULT '{}',
    emergency_contacts JSON DEFAULT '[]',
    safety_settings JSON DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX idx_ai_conversations_type ON ai_conversations(conversation_type);
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at DESC);
CREATE INDEX idx_ai_context_conversation_id ON ai_context(conversation_id);
CREATE INDEX idx_safety_profiles_user_id ON safety_profiles(user_id);

-- 设置RLS (Row Level Security)
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_profiles ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- AI对话表策略
CREATE POLICY "用户只能查看自己的对话" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的对话" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的对话" ON ai_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- AI消息表策略
CREATE POLICY "用户只能查看自己对话的消息" ON ai_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_conversations 
            WHERE ai_conversations.id = ai_messages.conversation_id 
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "用户只能在自己的对话中创建消息" ON ai_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_conversations 
            WHERE ai_conversations.id = ai_messages.conversation_id 
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- AI上下文表策略
CREATE POLICY "用户只能查看自己对话的上下文" ON ai_context
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_conversations 
            WHERE ai_conversations.id = ai_context.conversation_id 
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "用户只能在自己的对话中创建上下文" ON ai_context
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_conversations 
            WHERE ai_conversations.id = ai_context.conversation_id 
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- 安全档案表策略
CREATE POLICY "用户只能查看自己的安全档案" ON safety_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的安全档案" ON safety_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的安全档案" ON safety_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 设置权限
GRANT SELECT, INSERT, UPDATE ON ai_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_context TO authenticated;
GRANT SELECT, INSERT, UPDATE ON safety_profiles TO authenticated;

-- 为匿名用户提供基础查询权限（用于公开的安全建议）
GRANT SELECT ON ai_conversations TO anon;
GRANT SELECT ON ai_messages TO anon;

-- 创建触发器函数：自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建触发器
CREATE TRIGGER update_ai_conversations_updated_at 
    BEFORE UPDATE ON ai_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_profiles_updated_at 
    BEFORE UPDATE ON safety_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初始化示例数据（仅在有用户时插入）
-- 这部分数据将在用户首次使用AI功能时动态创建

-- 创建AI对话统计视图
CREATE VIEW ai_conversation_stats AS
SELECT 
    user_id,
    COUNT(*) as total_conversations,
    COUNT(CASE WHEN conversation_type = 'women_safety' THEN 1 END) as women_safety_conversations,
    COUNT(CASE WHEN conversation_type = 'emergency' THEN 1 END) as emergency_conversations,
    COUNT(CASE WHEN is_emergency = true THEN 1 END) as emergency_sessions,
    MAX(created_at) as last_conversation_at
FROM ai_conversations
GROUP BY user_id;

-- 为视图设置权限
GRANT SELECT ON ai_conversation_stats TO authenticated;