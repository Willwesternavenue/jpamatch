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
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.status(200).json(data);
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
        // チーム募集用フィールド
        team_level,
        needed_players,
        team_location,
        team_frequency,
        // チーム加入希望用フィールド
        player_level,
        player_experience,
        player_location,
        player_availability
      } = req.body;
      
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title,
            content,
            author_email,
            author_name,
            post_type,
            // チーム募集用フィールド
            team_level,
            needed_players,
            team_location,
            team_frequency,
            // チーム加入希望用フィールド
            player_level,
            player_experience,
            player_location,
            player_availability,
            created_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) throw error;
      res.status(200).json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
