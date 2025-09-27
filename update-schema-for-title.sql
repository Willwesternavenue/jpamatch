-- タイトルフィールドの更新（15文字以内制限）
-- 既存のpostsテーブルを更新

-- 1. タイトルフィールドの制約を追加（15文字以内）
ALTER TABLE posts 
ADD CONSTRAINT title_length_check CHECK (LENGTH(title) <= 15);

-- 2. 既存のタイトルが15文字を超える場合は更新（必要に応じて）
-- 例：既存の長いタイトルを15文字以内に短縮
UPDATE posts 
SET title = CASE 
    WHEN LENGTH(title) > 15 THEN LEFT(title, 12) || '...'
    ELSE title
END;

-- 3. タイトルフィールドのNOT NULL制約確認（既に存在するはず）
-- ALTER TABLE posts ALTER COLUMN title SET NOT NULL;

-- 4. インデックスの追加（タイトル検索用）
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);

-- 5. 連絡ログテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS contact_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    sender_name VARCHAR(100) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 連絡ログテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_contact_logs_post_id ON contact_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_contact_logs_created_at ON contact_logs(created_at);

-- 7. RLSの設定（連絡ログテーブル）
ALTER TABLE contact_logs ENABLE ROW LEVEL SECURITY;

-- 8. 連絡ログのポリシー（既に存在する場合はスキップ）
DO $$
BEGIN
    -- 連絡ログの表示権限
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_logs' AND policyname = 'Contact logs are viewable by post owner') THEN
        CREATE POLICY "Contact logs are viewable by post owner" ON contact_logs FOR SELECT USING (
            EXISTS (SELECT 1 FROM posts WHERE posts.id = contact_logs.post_id AND posts.author_email = auth.jwt() ->> 'email')
        );
    END IF;
    
    -- 連絡ログの作成権限
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_logs' AND policyname = 'Users can create contact logs') THEN
        CREATE POLICY "Users can create contact logs" ON contact_logs FOR INSERT WITH CHECK (true);
    END IF;
END $$;
