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
    
    // 連絡履歴をデータベースに保存
    const { error: logError } = await supabase
      .from('contact_logs')
      .insert([
        {
          post_id: postId,
          sender_name: senderName,
          sender_email: senderEmail,
          message: message
        }
      ]);
    
    if (logError) {
      console.error('連絡履歴の保存エラー:', logError);
      // ログ保存エラーは続行
    }
    
    // 両方のメールを送信
    await Promise.all([
      transporter.sendMail(contactMailOptions),
      transporter.sendMail(confirmationMailOptions)
    ]);
    
    res.status(200).json({ 
      message: 'メールが正常に送信されました。確認メールも送信いたしました。' 
    });
  } catch (error) {
    console.error('メール送信エラー:', error);
    res.status(500).json({ error: 'メール送信に失敗しました。しばらく時間をおいて再度お試しください。' });
  }
}
