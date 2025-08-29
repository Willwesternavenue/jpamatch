# JPAMatch - ビリヤードチーム仲間探し掲示板

8人制ビリヤードチームの仲間探しのための掲示板サービスです。チームが足りないメンバーを探す場合と、メンバーが加入できるチームを探す場合の両方に対応しています。

## 機能

- **🏆 チーム募集**: チームが不足メンバーを募集
- **👤 チーム加入希望**: プレイヤーがチームへの加入を希望
- **投稿タイプ別表示**: チーム募集と加入希望を分けて表示
- **詳細情報表示**: レベル、経験年数、活動地域、頻度などの詳細情報
- **投稿フィルター**: 投稿タイプ別の絞り込み表示
- **メール連絡機能**: 投稿者への直接メール送信
- **投稿管理**: 自分の投稿の編集・削除
- **レスポンシブデザイン**: モバイル対応
- **青と赤のカラーテーマ**: 美しいグラデーションデザイン

## 技術スタック

- **バックエンド**: Vercel Functions (Serverless)
- **データベース**: Supabase
- **フロントエンド**: HTML + CSS + JavaScript
- **メール送信**: Nodemailer
- **デプロイ**: Vercel

## セットアップ

### ローカル開発

1. 依存関係のインストール
```bash
npm install
```

2. 環境変数の設定
`.env`ファイルを作成し、以下の値を設定してください：
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

3. Supabaseの設定
- Supabaseプロジェクトを作成
- `supabase-setup.sql`を実行してテーブル作成
- 以下のテーブルが作成されます：
  - `posts` (id, title, content, author_email, author_name, post_type, team_level, needed_players, team_location, team_frequency, player_level, player_experience, player_location, player_availability, created_at, updated_at)

4. サーバーの起動
```bash
npm run dev
```

5. ブラウザで `http://localhost:3000` にアクセス

### Vercelデプロイ

1. **Vercel CLIのインストール**
```bash
npm i -g vercel
```

2. **Vercelにログイン**
```bash
vercel login
```

3. **環境変数の設定**
VercelダッシュボードまたはCLIで以下の環境変数を設定：
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

4. **デプロイ**
```bash
vercel
```

5. **本番環境へのデプロイ**
```bash
vercel --prod
```

## 使用方法

### チーム募集の投稿
1. 「🏆 チーム募集」ボタンをクリック
2. チーム名、募集内容、レベル、必要な人数、活動地域、頻度を入力
3. 代表者名とメールアドレスを入力
4. 「チーム募集を投稿」ボタンをクリック

### チーム加入希望の投稿
1. 「👤 チーム加入希望」ボタンをクリック
2. タイトル、自己紹介・希望内容、自分のレベル、経験年数を入力
3. 希望する地域、活動可能時間を入力
4. お名前とメールアドレスを入力
5. 「加入希望を投稿」ボタンをクリック

### 投稿の閲覧・連絡
1. 投稿一覧から興味のある投稿を確認
2. タイトルをクリックして詳細を表示
3. 「連絡する」ボタンで投稿者にメール送信
4. フィルターボタンで投稿タイプ別に絞り込み

## データベース構造

### 投稿テーブル (posts)
- **基本情報**: id, title, content, author_name, author_email, post_type, created_at, updated_at
- **チーム募集用**: team_level, needed_players, team_location, team_frequency
- **加入希望用**: player_level, player_experience, player_location, player_availability

### 投稿タイプ
- `team-recruit`: チーム募集
- `player-seeking`: チーム加入希望

## カラーテーマ

- **青系**: #3498db, #2980b9 (チーム加入希望、ボタン、リンク)
- **赤系**: #e74c3c, #c0392b (チーム募集、アクセント)
- **グラデーション**: 美しい背景とボタンのグラデーション効果

## ファイル構成

```
├── api/                    # Vercel Functions
│   ├── posts.js           # 投稿一覧・作成API
│   ├── posts/[id].js      # 個別投稿取得・削除API
│   └── contact.js         # メール送信API
├── public/                 # 静的ファイル
│   ├── index.html         # メインHTML
│   ├── styles.css         # スタイルシート
│   └── script.js          # フロントエンドJS
├── server.js               # ローカル開発用サーバー
├── vercel.json            # Vercel設定
├── package.json           # 依存関係
└── supabase-setup.sql     # データベース設定
```

## ライセンス

MIT
