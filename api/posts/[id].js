import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          team_recruit_info(*),
          player_seeking_info(*),
          division_create_info(*)
        `)
        .eq('id', id);
      
      if (error) throw error;
      
      if (!posts || posts.length === 0) {
        return res.status(404).json({ error: '投稿が見つかりません' });
      }
      
      const data = posts[0];
      
      // 関連データをフラット化
      const flattened = { ...data };
      
      // チーム募集情報をマージ
      if (data.team_recruit_info && data.team_recruit_info.length > 0) {
        const teamInfo = data.team_recruit_info[0];
        Object.assign(flattened, teamInfo);
      }
      
      // プレイヤー募集情報をマージ
      if (data.player_seeking_info && data.player_seeking_info.length > 0) {
        const playerInfo = data.player_seeking_info[0];
        Object.assign(flattened, playerInfo);
      }
      
      // ディビジョン作成情報をマージ
      if (data.division_create_info && data.division_create_info.length > 0) {
        const divisionInfo = data.division_create_info[0];
        Object.assign(flattened, divisionInfo);
      }
      
      // 不要なネストした配列を削除
      delete flattened.team_recruit_info;
      delete flattened.player_seeking_info;
      delete flattened.division_create_info;
      
      res.status(200).json(flattened);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { pin } = req.body;
      
      console.log('削除リクエスト:', { id, pin });
      
      // 投稿とPIN確認
      const { data: posts, error: postError } = await supabase
        .from('posts')
        .select('delete_pin')
        .eq('id', id);
      
      if (postError) {
        console.error('投稿取得エラー:', postError);
        throw postError;
      }
      
      if (!posts || posts.length === 0) {
        return res.status(404).json({ error: '投稿が見つかりません' });
      }
      
      const post = posts[0];
      if (post.delete_pin !== pin) {
        return res.status(403).json({ error: 'PINが正しくありません' });
      }
      
      // CASCADE削除により、関連する詳細テーブルのデータも自動削除される
      const { data, error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('削除エラー:', error);
        throw error;
      }
      
      console.log('削除成功:', data);
      res.status(200).json({ message: '投稿が削除されました' });
    } catch (error) {
      console.error('削除処理エラー:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
