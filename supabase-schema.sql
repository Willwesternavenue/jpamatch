-- JPAMatch データベース設計
-- Supabase PostgreSQL スキーマ

-- 投稿タイプの列挙型
CREATE TYPE post_type_enum AS ENUM ('team-recruit', 'player-seeking', 'division-create');

-- 地域の列挙型
CREATE TYPE region_enum AS ENUM (
    'hokkaido', 'tohoku', 'kanto', 'capital', 'tokai', 
    'hokuriku', 'kansai', 'chugoku', 'shikoku', 'kyushu', 'okinawa'
);

-- 性別の列挙型
CREATE TYPE gender_enum AS ENUM ('male', 'female');

-- 年齢の列挙型
CREATE TYPE age_enum AS ENUM ('10s', '20s', '30s', '40s', '50s', '60s+');

-- ゲーム種目の列挙型
CREATE TYPE game_type_enum AS ENUM ('8ball', '9ball', 'both');

-- 活動頻度の列挙型
CREATE TYPE frequency_enum AS ENUM ('weekly', 'biweekly', 'monthly', 'flexible');

-- スキルレベルの列挙型
CREATE TYPE skill_level_enum AS ENUM ('1', '2', '3', '4', '5', '6', '7', '8', '9');

-- JPA参加歴の列挙型
CREATE TYPE jpa_history_enum AS ENUM ('none', 'yes');

-- 活動曜日の列挙型
CREATE TYPE day_enum AS ENUM ('weekday', 'weekend', 'decide', 'other');

-- メイン投稿テーブル
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    post_type post_type_enum NOT NULL,
    delete_pin VARCHAR(4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- チーム募集情報テーブル
CREATE TABLE team_recruit_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    team_nickname VARCHAR(100),
    needed_players VARCHAR(10),
    team_location region_enum,
    team_location_detail VARCHAR(255),
    team_jpa_history jpa_history_enum,
    team_skill_level VARCHAR(50),
    team_game_type game_type_enum,
    team_frequency VARCHAR(50),
    team_availability VARCHAR(100),
    team_self_intro TEXT
);

-- チーム加入希望情報テーブル
CREATE TABLE player_seeking_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    player_nickname VARCHAR(100),
    player_count VARCHAR(50),
    player_gender gender_enum,
    player_age age_enum,
    player_location region_enum,
    player_experience TEXT,
    jpa_history jpa_history_enum,
    jpa_history_text TEXT,
    player_level skill_level_enum,
    player_game_type game_type_enum,
    player_frequency VARCHAR(50),
    player_availability VARCHAR(100),
    player_self_intro TEXT
);

-- ディビジョン作成情報テーブル
CREATE TABLE division_create_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    division_location region_enum,
    division_shop VARCHAR(255),
    division_teams VARCHAR(50),
    division_game_type game_type_enum,
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
CREATE INDEX idx_team_recruit_location ON team_recruit_info(team_location);
CREATE INDEX idx_player_seeking_location ON player_seeking_info(player_location);
CREATE INDEX idx_division_create_location ON division_create_info(division_location);

-- Row Level Security (RLS) の設定
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_recruit_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_seeking_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE division_create_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_logs ENABLE ROW LEVEL SECURITY;

-- 投稿の読み取り権限（全員）
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);

-- 投稿の作成権限（認証されたユーザー）
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (true);

-- 投稿の更新権限（作成者のみ）
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (author_email = auth.jwt() ->> 'email');

-- 投稿の削除権限（作成者のみ）
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (author_email = auth.jwt() ->> 'email');

-- 関連テーブルの権限
CREATE POLICY "Team recruit info is viewable by everyone" ON team_recruit_info FOR SELECT USING (true);
CREATE POLICY "Team recruit info is manageable by post owner" ON team_recruit_info FOR ALL USING (
    EXISTS (SELECT 1 FROM posts WHERE posts.id = team_recruit_info.post_id AND posts.author_email = auth.jwt() ->> 'email')
);

CREATE POLICY "Player seeking info is viewable by everyone" ON player_seeking_info FOR SELECT USING (true);
CREATE POLICY "Player seeking info is manageable by post owner" ON player_seeking_info FOR ALL USING (
    EXISTS (SELECT 1 FROM posts WHERE posts.id = player_seeking_info.post_id AND posts.author_email = auth.jwt() ->> 'email')
);

CREATE POLICY "Division create info is viewable by everyone" ON division_create_info FOR SELECT USING (true);
CREATE POLICY "Division create info is manageable by post owner" ON division_create_info FOR ALL USING (
    EXISTS (SELECT 1 FROM posts WHERE posts.id = division_create_info.post_id AND posts.author_email = auth.jwt() ->> 'email')
);

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

-- サンプルデータの挿入（開発用）
INSERT INTO posts (title, content, author_name, author_email, post_type, delete_pin) VALUES
('ビリヤードクラブ エース', '初心者から上級者まで幅広く募集しています。週1回の練習で、楽しくビリヤードを楽しみましょう！', '田中太郎', 'tanaka@example.com', 'team-recruit', '1234'),
('関西ビリヤード愛好会', '関西地区で活動しているビリヤード愛好会です。中級者以上を募集しています。', '佐藤花子', 'sato@example.com', 'team-recruit', '5678'),
('チーム加入希望 - ビリヤード太郎', 'ニックネーム: ビリヤード太郎\n参加希望人数: 1人\n活動可能地域: 関東\nビリヤード歴: 2年程度の経験があります\nJPA参加歴: なし', '山田次郎', 'yamada@example.com', 'player-seeking', '9999'),
('チーム加入希望 - ビリヤード花子', 'ニックネーム: ビリヤード花子\n参加希望人数: 2人\n活動可能地域: 首都圏\nビリヤード歴: 初心者ですが頑張ります\nJPA参加歴: なし', '鈴木花子', 'suzuki@example.com', 'player-seeking', '1111'),
('ディビジョン作成希望 - 東海', '活動地域: 東海\n募集チーム数: 3チーム\nプレー種目: どちらでも\n主な活動店舗: ビリヤードOops!\n活動曜日: 土日祝', '高橋一郎', 'takahashi@example.com', 'division-create', '2222'),
('ディビジョン作成希望 - 九州', '活動地域: 九州\n募集チーム数: 2チーム\nプレー種目: 8ボール\n活動曜日: これから決める', '伊藤美咲', 'ito@example.com', 'division-create', '3333');

-- チーム募集情報のサンプルデータ
INSERT INTO team_recruit_info (post_id, team_nickname, needed_players, team_location, team_location_detail, team_jpa_history, team_skill_level, team_game_type, team_frequency, team_availability, team_self_intro)
SELECT p.id, 'ビリヤードクラブ エース', '2', 'kanto', '東京都新宿区', 'participating', '4-5', 'both', 'weekly', 'weekend', '初心者から上級者まで幅広く募集しています'
FROM posts p WHERE p.title = 'ビリヤードクラブ エース';

INSERT INTO team_recruit_info (post_id, team_nickname, needed_players, team_location, team_location_detail, team_jpa_history, team_skill_level, team_game_type, team_frequency, team_availability, team_self_intro)
SELECT p.id, '関西ビリヤード愛好会', '3', 'kansai', '大阪府大阪市', 'participating', '5-7', 'both', 'biweekly', 'weekend', '関西地区で活動しているビリヤード愛好会です'
FROM posts p WHERE p.title = '関西ビリヤード愛好会';

-- チーム加入希望情報のサンプルデータ
INSERT INTO player_seeking_info (post_id, player_nickname, player_count, player_gender, player_age, player_location, player_experience, jpa_history, jpa_history_text, player_level, player_game_type, player_frequency, player_availability, player_self_intro)
SELECT p.id, 'ビリヤード太郎', '1', 'male', '30s', 'kanto', '2年間の経験があります', 'none', '', '4', 'both', '1-per-week', 'weekend', '経験豊富なプレイヤーです'
FROM posts p WHERE p.title = 'チーム加入希望 - ビリヤード太郎';

INSERT INTO player_seeking_info (post_id, player_nickname, player_count, player_gender, player_age, player_location, player_experience, jpa_history, jpa_history_text, player_level, player_game_type, player_frequency, player_availability, player_self_intro)
SELECT p.id, 'ビリヤード花子', '2', 'female', '20s', 'capital', '初心者ですが頑張ります', 'none', '', '2', '8ball', 'biweekly', 'weekend', '初心者ですが一生懸命頑張ります'
FROM posts p WHERE p.title = 'チーム加入希望 - ビリヤード花子';

-- ディビジョン作成情報のサンプルデータ
INSERT INTO division_create_info (post_id, division_location, division_shop, division_teams, division_game_type, division_day)
SELECT p.id, 'tokai', 'ビリヤードOops!', '3', 'both', 'weekend'
FROM posts p WHERE p.title = 'ディビジョン作成希望 - 東海';

INSERT INTO division_create_info (post_id, division_location, division_teams, division_game_type, division_day)
SELECT p.id, 'kyushu', '2', '8ball', 'decide'
FROM posts p WHERE p.title = 'ディビジョン作成希望 - 九州';
