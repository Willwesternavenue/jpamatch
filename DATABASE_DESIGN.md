# JPAMatch データベース設計書

## 概要
JPAMatchは3つの投稿タイプ（チーム募集、チーム加入希望、ディビジョン作成）を管理するビリヤード仲間探し掲示板のデータベース設計です。

## テーブル構成

### 1. メインテーブル

#### posts（投稿メインテーブル）
```sql
- id: UUID (主キー)
- title: VARCHAR(255) - 投稿タイトル
- content: TEXT - 投稿内容
- author_name: VARCHAR(100) - 投稿者名（非公開）
- author_email: VARCHAR(255) - 投稿者メール（非公開）
- post_type: post_type_enum - 投稿タイプ
- created_at: TIMESTAMP - 作成日時
- updated_at: TIMESTAMP - 更新日時
```

### 2. 投稿タイプ別テーブル

#### team_recruit_info（チーム募集情報）
```sql
- id: UUID (主キー)
- post_id: UUID (外部キー → posts.id)
- team_level: VARCHAR(50) - チームレベル
- needed_players: VARCHAR(10) - 募集人数
- team_location: region_enum - 活動地域
- team_frequency: frequency_enum - 活動頻度
```

#### player_seeking_info（チーム加入希望情報）
```sql
- id: UUID (主キー)
- post_id: UUID (外部キー → posts.id)
- player_nickname: VARCHAR(100) - ニックネーム
- player_count: VARCHAR(50) - 参加希望人数
- player_gender: gender_enum - 性別
- player_age: age_enum - 年齢
- player_location: region_enum - 活動可能地域
- player_experience: TEXT - ビリヤード歴
- jpa_history: jpa_history_enum - JPA参加歴
- jpa_history_text: TEXT - JPA参加歴詳細
- player_level: skill_level_enum - スキルレベル
- player_game_type: game_type_enum - プレー種目
- player_frequency: VARCHAR(50) - 参加可能頻度
- player_availability: VARCHAR(100) - 参加可能曜日
```

#### division_create_info（ディビジョン作成情報）
```sql
- id: UUID (主キー)
- post_id: UUID (外部キー → posts.id)
- division_location: region_enum - 活動地域
- division_shop: VARCHAR(255) - 主な活動店舗
- division_teams: VARCHAR(50) - 募集チーム数
- division_game_type: game_type_enum - プレー種目
- division_day: VARCHAR(100) - 活動曜日
```

### 3. その他テーブル

#### contact_logs（連絡履歴）
```sql
- id: UUID (主キー)
- post_id: UUID (外部キー → posts.id)
- sender_name: VARCHAR(100) - 送信者名
- sender_email: VARCHAR(255) - 送信者メール
- message: TEXT - メッセージ内容
- sent_at: TIMESTAMP - 送信日時
```

## 列挙型（ENUM）

### post_type_enum
- `team-recruit`: チーム募集
- `player-seeking`: チーム加入希望
- `division-create`: ディビジョン作成

### region_enum
- `hokkaido`: 北海道
- `tohoku`: 東北
- `kanto`: 関東
- `capital`: 首都圏
- `tokai`: 東海
- `hokuriku`: 北陸
- `kansai`: 関西
- `chugoku`: 中国
- `shikoku`: 四国
- `kyushu`: 九州
- `okinawa`: 沖縄

### gender_enum
- `male`: 男
- `female`: 女

### age_enum
- `10s`: 10代
- `20s`: 20代
- `30s`: 30代
- `40s`: 40代
- `50s`: 50代
- `60s+`: 60代以上

### game_type_enum
- `8ball`: 8ボール
- `9ball`: 9ボール
- `both`: どちらでも

### frequency_enum
- `weekly`: 週1回
- `biweekly`: 週2回
- `monthly`: 月1回
- `flexible`: 不定期

### skill_level_enum
- `1`: 1（女性ビギナー）
- `2`: 2（ビギナー）
- `3`: 3（Cクラス）
- `4`: 4（Cクラス上）
- `5`: 5（Bクラス下）
- `6`: 6（Bクラス）
- `7`: 7（Bクラス上）
- `8`: 8（Aクラス）
- `9`: 9（Aクラス上）

### jpa_history_enum
- `none`: なし
- `yes`: あり

### day_enum
- `weekday`: 平日
- `weekend`: 土日祝
- `decide`: これから決める
- `other`: その他

## セキュリティ設定

### Row Level Security (RLS)
- 投稿の読み取り: 全員可能
- 投稿の作成: 認証されたユーザー
- 投稿の更新・削除: 作成者のみ
- 連絡履歴の読み取り: 投稿作成者のみ

### インデックス
- 投稿タイプ別検索
- 作成日時順ソート
- 地域別検索
- 投稿者メール検索

## 運用上の考慮事項

### 1. データの整合性
- 外部キー制約により、投稿削除時に関連データも自動削除
- 列挙型により、無効な値の入力を防止

### 2. パフォーマンス
- 適切なインデックス設定
- 投稿タイプ別のテーブル分割により、クエリ効率を向上

### 3. プライバシー保護
- 投稿者名・メールは非公開
- RLSにより、投稿者以外は連絡履歴を閲覧不可

### 4. 拡張性
- 新しい投稿タイプの追加が容易
- 地域や選択肢の追加に対応

## サンプルデータ
各テーブルにサンプルデータを含んでおり、開発・テスト時に利用可能です。
