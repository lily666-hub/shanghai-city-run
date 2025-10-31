-- 为演示用户创建特殊的RLS策略
-- 这个脚本解决演示用户无法访问数据库的问题

-- 首先，为演示用户创建一个特殊的策略，允许访问AI对话表
CREATE POLICY "演示用户可以访问AI对话" ON ai_conversations
    FOR ALL USING (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid);

-- 为演示用户创建AI消息访问策略
CREATE POLICY "演示用户可以访问AI消息" ON ai_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ai_conversations 
            WHERE ai_conversations.id = ai_messages.conversation_id 
            AND ai_conversations.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
        )
    );

-- 为演示用户创建AI上下文访问策略
CREATE POLICY "演示用户可以访问AI上下文" ON ai_context
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ai_conversations 
            WHERE ai_conversations.id = ai_context.conversation_id 
            AND ai_conversations.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
        )
    );

-- 为演示用户创建安全档案访问策略
CREATE POLICY "演示用户可以访问安全档案" ON safety_profiles
    FOR ALL USING (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid);

-- 或者，我们可以临时禁用RLS（仅用于开发环境）
-- 注意：在生产环境中不要这样做
-- ALTER TABLE ai_conversations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_messages DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_context DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE safety_profiles DISABLE ROW LEVEL SECURITY;