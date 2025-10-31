-- 删除 ai_conversations 表的 user_id 外键约束
-- 这样可以允许使用演示用户ID而不需要在 auth.users 表中存在

-- 首先检查并删除现有的外键约束
ALTER TABLE ai_conversations 
DROP CONSTRAINT IF EXISTS ai_conversations_user_id_fkey;

-- 确保 user_id 列仍然是 UUID 类型但不再有外键约束
-- 这样应用可以使用演示用户ID或真实用户ID