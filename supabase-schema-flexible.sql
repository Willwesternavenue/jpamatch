-- JPAMatch データベース設計（柔軟版 - ENUMなし）
-- Supabase PostgreSQL スキーマ

-- メイン投稿テーブル（全フィールド統合版）
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    post_type VARCHAR(20) NOT NULL CHECK (post_type IN ('team-recruit', 'player-seeking', 'division-create')),
    delete_pin VARCHAR(4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 共通フィールド
    nickname VARCHAR(100) NOT NULL,  -- チーム募集: team_nickname, チーム探し: player_nickname
    
    -- チーム募集専用フィールド
    needed_players VARCHAR(10),
    team_location VARCHAR(20) CHECK (team_location IN ('hokkaido', 'tohoku', 'kanto', 'capital', 'tokai', 'hokuriku', 'kansai', 'chugoku', 'shikoku', 'kyushu', 'okinawa')),
    team_location_detail VARCHAR(255),
    team_jpa_history VARCHAR(20) CHECK (team_jpa_history IN ('none', 'yes', 'participating', 'suspended', 'planned')),
    team_skill_level VARCHAR(50),
    team_game_type VARCHAR(10) CHECK (team_game_type IN ('8ball', '9ball', 'both')),
    team_frequency VARCHAR(50),
    team_availability VARCHAR(100),
    team_self_intro TEXT,
    
    -- チーム探し専用フィールド
    player_count VARCHAR(50),
    player_gender VARCHAR(10) CHECK (player_gender IN ('male', 'female')),
    player_age VARCHAR(10) CHECK (player_age IN ('10s', '20s', '30s', '40s', '50s', '60s+')),
    player_location VARCHAR(20) CHECK (player_location IN ('hokkaido', 'tohoku', 'kanto', 'capital', 'tokai', 'hokuriku', 'kansai', 'chugoku', 'shikoku', 'kyushu', 'okinawa')),
    player_location_detail VARCHAR(255),
    player_experience TEXT,
    jpa_history VARCHAR(20) CHECK (jpa_history IN ('none', 'yes', 'participating', 'suspended', 'planned')),
    jpa_history_text TEXT,
    player_level VARCHAR(10) CHECK (player_level IN ('1', '2', '3', '4', '5', '6', '7', '8', '9')),
    player_game_type VARCHAR(10) CHECK (player_game_type IN ('8ball', '9ball', 'both')),
    player_frequency VARCHAR(50),
    player_availability VARCHAR(100),
    player_self_intro TEXT,
    
    -- ディビジョン作成専用フィールド
    division_location VARCHAR(20) CHECK (division_location IN ('hokkaido', 'tohoku', 'kanto', 'capital', 'tokai', 'hokuriku', 'kansai', 'chugoku', 'shikoku', 'kyushu', 'okinawa')),
    division_shop VARCHAR(255),
    division_teams VARCHAR(50),
    division_game_type VARCHAR(10) CHECK (division_game_type IN ('8ball', '9ball', 'both')),
    division_day VARCHAR(100)
);

-- 連絡履歴テーブル
CREATE TABLE contact_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    sender_name VARCHAR(100) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_posts_post_type ON posts(post_type);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_author_email ON posts(author_email);
CREATE INDEX idx_posts_team_location ON posts(team_location);
CREATE INDEX idx_posts_player_location ON posts(player_location);
CREATE INDEX idx_posts_division_location ON posts(division_location);

-- Row Level Security (RLS) の設定
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_logs ENABLE ROW LEVEL SECURITY;

-- 投稿の読み取り権限（全員）
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);

-- 投稿の作成権限（認証されたユーザー）
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (true);

-- 投稿の更新権限（作成者のみ）
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (author_email = auth.jwt() ->> 'email');

-- 投稿の削除権限（作成者のみ）
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (author_email = auth.jwt() ->> 'email');

-- 連絡履歴の権限
CREATE POLICY "Contact logs are viewable by post owner" ON contact_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM posts WHERE posts.id = contact_logs.post_id AND posts.author_email = auth.jwt() ->> 'email')
);
CREATE POLICY "Users can create contact logs" ON contact_logs FOR INSERT WITH CHECK (true);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
