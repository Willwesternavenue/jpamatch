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

// 静的ファイルの提供
app.use(express.static('.', { index: ['index.html'], dotfiles: 'ignore' }));

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
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw deleteError;
    
    console.log('削除成功:', deleteError);
    res.json({ success: true, message: '投稿が削除されました' });
  } catch (error) {
    console.error('削除エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

// 連絡フォーム送信
app.post('/api/contact', async (req, res) => {
  try {
    const { postId, senderName, senderEmail, message, postTitle, postType } = req.body;
    
    // 投稿情報を取得
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('title, author_email, author_name')
      .eq('id', postId)
      .single();
    
    if (postError) throw postError;
    
    // 投稿タイプに応じたメール件名
    let subject;
    let postTypeText;
    if (postType === 'team-recruit') {
      subject = `【ビリヤードチーム募集】「${postTitle}」への加入希望`;
      postTypeText = 'チーム募集';
    } else if (postType === 'player-seeking') {
      subject = `【ビリヤードチーム加入希望】「${postTitle}」へのチーム募集`;
      postTypeText = 'チーム加入希望';
    } else {
      subject = `【ビリヤード仲間探し】投稿「${postTitle}」への連絡`;
      postTypeText = '一般投稿';
    }
    
    // 投稿者への連絡メール
    const contactMailOptions = {
      from: process.env.EMAIL_USER,
      to: post.author_email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🏆 JPAMatch ビリヤード仲間探し</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #2c3e50; margin-top: 0;">新しい連絡が届きました！</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #3498db; margin-top: 0;">📋 投稿情報</h3>
              <p><strong>投稿タイトル:</strong> ${postTitle}</p>
              <p><strong>投稿タイプ:</strong> ${postTypeText}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #27ae60; margin-top: 0;">👤 連絡者情報</h3>
              <p><strong>お名前:</strong> ${senderName}</p>
              <p><strong>メールアドレス:</strong> ${senderEmail}</p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">💬 メッセージ</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${senderEmail}" style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                📧 返信する
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #7f8c8d; font-size: 14px; text-align: center;">
              このメールはJPAMatchビリヤード仲間探し掲示板システムから自動送信されています。<br>
              ビリヤードを通じて素晴らしい仲間との出会いがありますように！ 🎱
            </p>
          </div>
        </div>
      `
    };
    
    // 送信者への確認メール
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: senderEmail,
      subject: `【JPAMatch】連絡送信完了 - 「${postTitle}」`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #27ae60, #229954); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✅ 連絡送信完了</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #2c3e50; margin-top: 0;">${senderName} 様</h2>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #27ae60; margin-top: 0;">📤 送信完了</h3>
              <p>「<strong>${postTitle}</strong>」への連絡を正常に送信いたしました。</p>
              <p>投稿者からの返信をお待ちください。</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #6c757d; margin-top: 0;">📋 送信内容</h3>
              <p><strong>投稿タイプ:</strong> ${postTypeText}</p>
              <p><strong>メッセージ:</strong></p>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3498db;">
                <p style="white-space: pre-wrap; line-height: 1.6; margin: 0;">${message}</p>
              </div>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">💡 次のステップ</h3>
              <ul style="color: #856404;">
                <li>投稿者からの返信メールをチェックしてください</li>
                <li>返信が来ない場合は、数日後に再度連絡することも可能です</li>
                <li>ビリヤードを通じて素晴らしい仲間との出会いをお祈りしています！</li>
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #7f8c8d; font-size: 14px; text-align: center;">
              このメールはJPAMatchビリヤード仲間探し掲示板システムから自動送信されています。<br>
              ビリヤードを通じて素晴らしい仲間との出会いがありますように！ 🎱
            </p>
          </div>
        </div>
      `
    };
    
    // 連絡履歴を保存
    const { error: logError } = await supabase
      .from('contact_logs')
      .insert([{
        post_id: postId,
        sender_name: senderName,
        sender_email: senderEmail,
        message: message
      }]);
    
    if (logError) {
      console.error('連絡履歴の保存エラー:', logError);
      // ログ保存エラーは続行
    }
    
    // 両方のメールを送信
    await Promise.all([
      transporter.sendMail(contactMailOptions),
      transporter.sendMail(confirmationMailOptions)
    ]);
    
    res.json({ success: true, message: 'メールが正常に送信されました。確認メールも送信いたしました。' });
  } catch (error) {
    console.error('連絡送信エラー:', error);
    res.status(500).json({ error: 'メール送信に失敗しました。しばらく時間をおいて再度お試しください。' });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});