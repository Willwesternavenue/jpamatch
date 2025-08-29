-- JPAMatch ビリヤードチーム仲間探し掲示板用のテーブル作成

-- 投稿テーブル
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_name VARCHAR(100),
    author_email VARCHAR(255) NOT NULL,
    post_type VARCHAR(20) NOT NULL DEFAULT 'general',
    -- チーム募集用フィールド
    team_level VARCHAR(20),
    needed_players INTEGER,
    team_location VARCHAR(255),
    team_frequency VARCHAR(20),
    -- チーム加入希望用フィールド
    player_level VARCHAR(20),
    player_experience VARCHAR(20),
    player_location VARCHAR(255),
    player_availability VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 投稿テーブルのインデックス
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_author_email ON posts(author_email);
CREATE INDEX idx_posts_post_type ON posts(post_type);
CREATE INDEX idx_posts_team_level ON posts(team_level);
CREATE INDEX idx_posts_player_level ON posts(player_level);
CREATE INDEX idx_posts_team_location ON posts(team_location);
CREATE INDEX idx_posts_player_location ON posts(player_location);

-- 投稿テーブルのRLS（Row Level Security）設定
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが投稿を読み取り可能
CREATE POLICY "Anyone can view posts" ON posts
    FOR SELECT USING (true);

-- 認証されたユーザーのみ投稿作成可能
CREATE POLICY "Authenticated users can create posts" ON posts
    FOR INSERT WITH CHECK (true);

-- 投稿者のみ投稿更新・削除可能
CREATE POLICY "Post authors can update posts" ON posts
    FOR UPDATE USING (true);

CREATE POLICY "Post authors can delete posts" ON posts
    FOR DELETE USING (true);

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新日時トリガーの作成
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入（チーム募集）
INSERT INTO posts (title, content, author_name, author_email, post_type, team_level, needed_players, team_location, team_frequency) VALUES
(
    'ビリヤードクラブ エース',
    '8人制ビリヤードチーム「エース」のメンバーを募集しています。現在5名で活動中で、3名のメンバーを探しています。初心者から上級者まで歓迎です。週1回、新宿のビリヤードホールで練習しています。大会にも参加予定です。',
    '田中太郎',
    'tanaka@example.com',
    'team-recruit',
    'mixed',
    3,
    '東京都新宿区',
    'weekly'
),
(
    'ビリヤードチーム スター',
    '上級者向けのビリヤードチーム「スター」です。現在6名で活動中で、2名の上級者を募集しています。週2回の練習と月1回の大会参加を予定しています。経験3年以上の方を歓迎します。',
    '山田花子',
    'yamada@example.com',
    'team-recruit',
    'advanced',
    2,
    '東京都渋谷区',
    'biweekly'
);

-- サンプルデータの挿入（チーム加入希望）
INSERT INTO posts (title, content, author_name, author_email, post_type, player_level, player_experience, player_location, player_availability) VALUES
(
    'ビリヤードチームに加入希望',
    'ビリヤードを始めて2年目の中級者です。8人制のチームに加入したいと考えています。新宿・渋谷エリアで活動しているチームを探しています。週末の活動が可能です。一緒に練習して上達していきたいです。',
    '佐藤次郎',
    'sato@example.com',
    'player-seeking',
    'intermediate',
    '1-3',
    '東京都新宿区周辺',
    'weekend'
),
(
    '初心者ですがチームに加入したい',
    'ビリヤードを始めて半年の初心者です。初心者歓迎のチームを探しています。東京都内で活動しているチームで、平日夜または週末に活動できるところを希望します。一生懸命練習してチームに貢献したいと思います。',
    '鈴木一郎',
    'suzuki@example.com',
    'player-seeking',
    'beginner',
    'less-than-1',
    '東京都内',
    'weekday-evening'
);
