const { createClient } = require('@supabase/supabase-js');

// Supabaseクライアントの初期化
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 投稿一覧取得
module.exports = async (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
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
        const { error: playerError } = await supabase
          .from('player_seeking_info')
          .insert([{
            post_id: postId,
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
          }]);
        
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
};
