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
const transporter = nodemailer.createTransporter({
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
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
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
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 投稿詳細取得
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    res.json(data);
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

// 投稿削除
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { author_email } = req.body;
    
    // 投稿者確認
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('author_email')
      .eq('id', id)
      .single();
    
    if (postError) throw postError;
    
    if (post.author_email !== author_email) {
      return res.status(403).json({ error: '投稿の削除権限がありません' });
    }
    
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: '投稿が削除されました' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
