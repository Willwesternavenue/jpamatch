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
        // All possible fields from all forms
        nickname, needed_players, team_location, team_location_detail, team_jpa_history, team_skill_level, team_game_type, team_frequency, team_availability, team_self_intro,
        player_count, player_gender, player_age, player_location, player_location_detail, player_experience, jpa_history, jpa_history_text, player_level, player_game_type, player_frequency, player_availability, player_self_intro,
        division_location, division_shop, division_teams, division_game_type, division_day
      } = req.body;
      
      console.log('Creating post with data:', {
        title, content, author_email, author_name, post_type, delete_pin
      });
      
      // Filter empty strings for ENUMs and optional fields
      const filteredPlayerGender = player_gender && player_gender !== '' ? player_gender : null;
      const filteredPlayerAge = player_age && player_age !== '' ? player_age : null;
      const filteredPlayerLevel = player_level && player_level !== '' ? player_level : null;
      const filteredPlayerGameType = player_game_type && player_game_type !== '' ? player_game_type : null;
      const filteredPlayerFrequency = player_frequency && player_frequency !== '' ? player_frequency : null;
      const filteredTeamJpaHistory = team_jpa_history && team_jpa_history !== '' ? team_jpa_history : null;
      const filteredTeamSkillLevel = team_skill_level && team_skill_level !== '' ? team_skill_level : null;
      const filteredTeamGameType = team_game_type && team_game_type !== '' ? team_game_type : null;
      const filteredTeamFrequency = team_frequency && team_frequency !== '' ? team_frequency : null;
      const filteredDivisionGameType = division_game_type && division_game_type !== '' ? division_game_type : null;

      const sanitizeDetailField = (value) => {
        if (value === undefined || value === null) return null;
        if (typeof value !== 'string') return value;
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
      };

      const sanitizedTeamLocationDetail = sanitizeDetailField(team_location_detail);
      const sanitizedPlayerLocationDetail = sanitizeDetailField(player_location_detail);

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([
          {
            title, content, author_email, author_name, post_type, delete_pin,
            nickname, needed_players, team_location, team_location_detail: sanitizedTeamLocationDetail, team_jpa_history: filteredTeamJpaHistory, team_skill_level: filteredTeamSkillLevel, team_game_type: filteredTeamGameType, team_frequency: filteredTeamFrequency, team_availability, team_self_intro,
            player_count, player_gender: filteredPlayerGender, player_age: filteredPlayerAge, player_location, player_location_detail: sanitizedPlayerLocationDetail, player_experience, jpa_history, jpa_history_text, player_level: filteredPlayerLevel, player_game_type: filteredPlayerGameType, player_frequency: filteredPlayerFrequency, player_availability, player_self_intro,
            division_location, division_shop, division_teams, division_game_type: filteredDivisionGameType, division_day
          }
        ])
        .select();
        
      console.log('Post creation result:', { postData, postError });
      
      if (postError) throw postError;
      
      const postId = postData[0].id;
      
      res.status(201).json({ 
        success: true, 
        message: '投稿が作成されました',
        postId: postId 
      });
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
