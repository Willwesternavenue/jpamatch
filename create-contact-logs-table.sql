-- 連絡ログテーブルの作成
CREATE TABLE IF NOT EXISTS contact_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    sender_name VARCHAR(100) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_contact_logs_post_id ON contact_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_contact_logs_created_at ON contact_logs(created_at);

-- RLSの無効化（開発用）
ALTER TABLE contact_logs DISABLE ROW LEVEL SECURITY;
