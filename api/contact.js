const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

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

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    
    res.status(200).json({ message: 'メールが正常に送信されました' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
