const { createClient } = require('@supabase/supabase-js');

// Supabaseクライアントの初期化
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    SUPABASE_URL: !!supabaseUrl,
    SUPABASE_ANON_KEY: !!supabaseKey
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 投稿一覧取得
export default async function handler(req, res) {
  console.log('API posts.js called:', req.method, req.url);
  console.log('Environment variables check:', {
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY
  });

  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      res.status(200).json(data);
    } catch (error) {
      console.error('GET /api/posts error:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      console.log('POST /api/posts - Request body:', JSON.stringify(req.body, null, 2));
      
      const { 
        title, 
        content, 
        author_email, 
        author_name, 
        post_type,
        delete_pin,
        // チーム募集用フィールド
        nickname,
        needed_players,
        team_location,
        team_location_detail,
        team_jpa_history,
        team_skill_level,
        team_game_type,
        team_frequency,
        team_availability,
        team_self_intro,
        // チーム加入希望用フィールド
        player_count,
        player_gender,
        player_age,
        player_location,
        player_location_detail,
        player_experience,
        jpa_history,
        jpa_history_text,
        player_level,
        player_game_type,
        player_frequency,
        player_availability,
        player_self_intro,
        // ディビジョン作成用フィールド
        division_location,
        division_shop,
        division_teams,
        division_game_type,
        division_day
      } = req.body;
      
      console.log('Creating post with data:', {
        title, content, author_email, author_name, post_type, delete_pin
      });
      
      // 投稿データを作成（空の値をフィルタリング）
      const postData = {
        title,
        content,
        author_email,
        author_name,
        post_type,
        delete_pin
      };
      
      // 投稿タイプに応じてフィールドを追加
      if (post_type === 'team-recruit') {
        postData.nickname = nickname;
        postData.needed_players = needed_players;
        postData.team_location = team_location;
        postData.team_location_detail = team_location_detail;
        postData.team_jpa_history = team_jpa_history;
        postData.team_skill_level = team_skill_level;
        postData.team_game_type = team_game_type;
        postData.team_frequency = team_frequency;
        postData.team_availability = team_availability;
        postData.team_self_intro = team_self_intro;
      } else if (post_type === 'player-seeking') {
        postData.nickname = nickname;
        postData.player_count = player_count;
        postData.player_location = player_location;
        postData.player_location_detail = player_location_detail;
        postData.player_experience = player_experience;
        postData.jpa_history = jpa_history;
        postData.jpa_history_text = jpa_history_text;
        postData.player_availability = player_availability;
        postData.player_self_intro = player_self_intro;
        
        // 空でない値のみ追加
        if (player_gender && player_gender !== '') postData.player_gender = player_gender;
        if (player_age && player_age !== '') postData.player_age = player_age;
        if (player_level && player_level !== '') postData.player_level = player_level;
        if (player_game_type && player_game_type !== '') postData.player_game_type = player_game_type;
        if (player_frequency && player_frequency !== '') postData.player_frequency = player_frequency;
      } else if (post_type === 'division-create') {
        postData.division_location = division_location;
        postData.division_shop = division_shop;
        postData.division_teams = division_teams;
        postData.division_game_type = division_game_type;
        postData.division_day = division_day;
      }
      
      console.log('Final post data:', postData);
      
      // 投稿を作成
      const { data: createdPost, error: postError } = await supabase
        .from('posts')
        .insert([postData])
        .select();
        
      console.log('Post creation result:', { createdPost, postError });
      
      if (postError) throw postError;
      
      res.status(200).json(createdPost[0]);
    } catch (error) {
      console.error('投稿作成エラー:', error);
      console.error('エラーの詳細:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
