const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Supabaseクライアントの初期化
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// メール送信の設定
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
    
    res.json(flattenedData);
  } catch (error) {
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
    
    res.json(postData[0]);
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
});

// 投稿詳細取得
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
    
    // 関連データをフラット化
    const flattened = { ...posts[0] };
    
    // チーム募集情報をマージ
    if (posts[0].team_recruit_info && posts[0].team_recruit_info.length > 0) {
      const teamInfo = posts[0].team_recruit_info[0];
      Object.assign(flattened, teamInfo);
    }
    
    // プレイヤー募集情報をマージ
    if (posts[0].player_seeking_info && posts[0].player_seeking_info.length > 0) {
      const playerInfo = posts[0].player_seeking_info[0];
      Object.assign(flattened, playerInfo);
    }
    
    // ディビジョン作成情報をマージ
    if (posts[0].division_create_info && posts[0].division_create_info.length > 0) {
      const divisionInfo = posts[0].division_create_info[0];
      Object.assign(flattened, divisionInfo);
    }
    
    // 不要なネストした配列を削除
    delete flattened.team_recruit_info;
    delete flattened.player_seeking_info;
    delete flattened.division_create_info;
    
    res.json(flattened);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// メール送信
app.post('/api/contact', async (req, res) => {
  try {
    const { postId, senderEmail, senderName, message, postTitle, postType } = req.body;
    
    // 投稿者情報を取得
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('author_email, author_name')
      .eq('id', postId)
      .single();
    
    if (postError) throw postError;
    
    // 投稿タイプに応じたメール件名
    let subject;
    if (postType === 'team-recruit') {
      subject = `【ビリヤードチーム募集】「${postTitle}」への加入希望`;
    } else if (postType === 'player-seeking') {
      subject = `【ビリヤードチーム加入希望】「${postTitle}」へのチーム募集`;
    } else {
      subject = `【ビリヤード仲間探し】投稿「${postTitle}」への連絡`;
    }
    
    // メール送信
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: post.author_email,
      subject: subject,
      html: `
        <h2>JPAMatch ビリヤード仲間探し掲示板からの連絡</h2>
        <p><strong>投稿タイトル:</strong> ${postTitle}</p>
        <p><strong>投稿タイプ:</strong> ${postType === 'team-recruit' ? 'チーム募集' : postType === 'player-seeking' ? 'チーム加入希望' : '一般投稿'}</p>
        <p><strong>連絡者:</strong> ${senderName} (${senderEmail})</p>
        <p><strong>メッセージ:</strong></p>
        <p>${message}</p>
        <hr>
        <p>このメールはJPAMatchビリヤード仲間探し掲示板システムから自動送信されています。</p>
        <p>返信する場合は、上記の連絡者メールアドレスに直接返信してください。</p>
        <p>ビリヤードを通じて素晴らしい仲間との出会いがありますように！</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'メールが正常に送信されました' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 投稿削除（PIN検証付き）
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;
    
    // 投稿とPIN確認
    const { data: posts, error: postError } = await supabase
      .from('posts')
      .select('delete_pin')
      .eq('id', id.toString());
    
    if (postError) {
      console.error('投稿取得エラー:', postError);
      throw postError;
    }
    
    if (!posts || posts.length === 0) {
      console.log('投稿が見つかりません:', { id, posts });
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
      .eq('id', id.toString());
    
    if (error) {
      console.error('削除エラー:', error);
      throw error;
    }
    
    console.log('削除成功:', data);
    res.json({ message: '投稿が削除されました' });
  } catch (error) {
    console.error('削除処理エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
