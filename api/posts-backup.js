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
        .select(`
          *,
          team_recruit_info(*),
          player_seeking_info(*),
          division_create_info(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // 関連データをフラット化
      const flattenedData = data.map(post => {
        const flattened = { ...post };
        
        // チーム募集情報をマージ
        if (post.team_recruit_info && post.team_recruit_info.length > 0) {
          const teamInfo = post.team_recruit_info[0];
          Object.assign(flattened, teamInfo);
        }
        
        // プレイヤー募集情報をマージ
        if (post.player_seeking_info && post.player_seeking_info.length > 0) {
          const playerInfo = post.player_seeking_info[0];
          Object.assign(flattened, playerInfo);
        }
        
        // ディビジョン作成情報をマージ
        if (post.division_create_info && post.division_create_info.length > 0) {
          const divisionInfo = post.division_create_info[0];
          Object.assign(flattened, divisionInfo);
        }
        
        // 不要なネストした配列を削除
        delete flattened.team_recruit_info;
        delete flattened.player_seeking_info;
        delete flattened.division_create_info;
        
        return flattened;
      });
      
      res.status(200).json(flattenedData);
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
        team_nickname,
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
        player_nickname,
        player_count,
        player_gender,
        player_age,
        player_location,
        player_experience,
        jpa_history,
        jpa_history_text,
        player_level,
        player_game_type,
        player_frequency,
        player_availability,
        player_self_intro
      } = req.body;
      
      console.log('Creating post with data:', {
        title, content, author_email, author_name, post_type, delete_pin
      });
      
      // まず投稿を作成
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([
          {
            title,
            content,
            author_email,
            author_name,
            post_type,
            delete_pin
          }
        ])
        .select();
        
      console.log('Post creation result:', { postData, postError });
      
      if (postError) throw postError;
      
      const postId = postData[0].id;
      
      // 投稿タイプに応じて詳細情報を挿入
      if (post_type === 'team-recruit') {
        const { error: teamError } = await supabase
          .from('team_recruit_info')
          .insert([{
            post_id: postId,
            team_nickname,
            needed_players,
            team_location,
            team_location_detail,
            team_jpa_history,
            team_skill_level,
            team_game_type,
            team_frequency,
            team_availability,
            team_self_intro
          }]);
        
        if (teamError) throw teamError;
      }
      
      if (post_type === 'player-seeking') {
        // 空の値をフィルタリングしてINSERTデータを作成
        const playerInsertData = {
          post_id: postId,
          player_nickname,
          player_count,
          player_location,
          player_experience,
          jpa_history,
          jpa_history_text,
          player_availability,
          player_self_intro
        };
        
        // 空でない値のみ追加
        if (player_gender && player_gender !== '') playerInsertData.player_gender = player_gender;
        if (player_age && player_age !== '') playerInsertData.player_age = player_age;
        if (player_level && player_level !== '') playerInsertData.player_level = player_level;
        if (player_game_type && player_game_type !== '') playerInsertData.player_game_type = player_game_type;
        if (player_frequency && player_frequency !== '') playerInsertData.player_frequency = player_frequency;
        
        console.log('Player seeking insert data:', playerInsertData);
        
        const { error: playerError } = await supabase
          .from('player_seeking_info')
          .insert([playerInsertData]);
        
        if (playerError) throw playerError;
      }
      
      res.status(200).json(postData[0]);
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
