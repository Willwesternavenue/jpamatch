const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

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

// ミドルウェア設定
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// メール送信設定
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 投稿一覧取得
app.get('/api/posts', async (req, res) => {
  try {
    console.log('投稿一覧取得リクエスト');
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('投稿一覧取得成功:', data.length, '件');
    res.json(data);
  } catch (error) {
    console.error('投稿一覧取得エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

// 新規投稿作成
app.post('/api/posts', async (req, res) => {
  try {
    const { 
      title, 
      content, 
      author_email, 
      author_name, 
      post_type,
      delete_pin,
      // All possible fields from all forms
      nickname, needed_players, team_location, team_location_detail, team_jpa_history, team_skill_level, team_game_type, team_frequency, team_availability, team_self_intro,
      player_count, player_gender, player_age, player_location, player_experience, jpa_history, jpa_history_text, player_level, player_game_type, player_frequency, player_availability, player_self_intro,
      division_location, division_shop, division_teams, division_game_type, division_day
    } = req.body;
    
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

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert([
        {
          title, content, author_email, author_name, post_type, delete_pin,
          nickname, needed_players, team_location, team_location_detail, team_jpa_history: filteredTeamJpaHistory, team_skill_level: filteredTeamSkillLevel, team_game_type: filteredTeamGameType, team_frequency: filteredTeamFrequency, team_availability, team_self_intro,
          player_count, player_gender: filteredPlayerGender, player_age: filteredPlayerAge, player_location, player_experience, jpa_history, jpa_history_text, player_level: filteredPlayerLevel, player_game_type: filteredPlayerGameType, player_frequency: filteredPlayerFrequency, player_availability, player_self_intro,
          division_location, division_shop, division_teams, division_game_type: filteredDivisionGameType, division_day
        }
      ])
      .select();
    
    if (postError) throw postError;
    
    const postId = postData[0].id;
    
    res.status(201).json({ 
      success: true, 
      message: '投稿が作成されました',
      postId: postId 
    });
  } catch (error) {
    console.error('投稿作成エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

// 個別投稿取得
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: '投稿が見つかりません' });
    }
    
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 投稿削除
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;
    
    console.log('削除リクエスト:', { id, pin });
    
    // PINを確認
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('delete_pin')
      .eq('id', id);
    
    if (fetchError) throw fetchError;
    
    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: '投稿が見つかりません' });
    }
    
    if (posts[0].delete_pin !== pin) {
      return res.status(401).json({ error: 'PINが正しくありません' });
    }
    
    // 投稿を削除
    const { data: deleteData, error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .select();
    
    if (deleteError) throw deleteError;
    
    console.log('削除成功: 投稿ID', id, '削除されたデータ:', deleteData);
    
    // 削除確認のため、同じIDで投稿を検索
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', id);
    
    console.log('削除確認: 投稿ID', id, '残存データ:', verifyData);
    
    res.json({ success: true, message: '投稿が削除されました' });
  } catch (error) {
    console.error('削除エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

// 連絡フォーム送信
app.post('/api/contact', async (req, res) => {
  try {
    const { postId, senderName, senderEmail, message } = req.body;
    
    // 投稿情報を取得
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('title, author_email, author_name')
      .eq('id', postId)
      .single();
    
    if (postError) throw postError;
    
    // 連絡履歴を保存
    const { error: logError } = await supabase
      .from('contact_logs')
      .insert([{
        post_id: postId,
        sender_name: senderName,
        sender_email: senderEmail,
        message: message
      }]);
    
    if (logError) throw logError;
    
    // メール送信
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: post.author_email,
      subject: `JPAMatch - 投稿への連絡: ${post.title}`,
      html: `
        <h2>JPAMatch からの連絡</h2>
        <p>投稿「${post.title}」に連絡がありました。</p>
        <h3>連絡者情報</h3>
        <p><strong>お名前:</strong> ${senderName}</p>
        <p><strong>メールアドレス:</strong> ${senderEmail}</p>
        <h3>メッセージ</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: '連絡が送信されました' });
  } catch (error) {
    console.error('連絡送信エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

// 静的ファイルの提供（APIルートの後に配置）
app.use(express.static('.', { index: ['index.html'], dotfiles: 'ignore' }));

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});