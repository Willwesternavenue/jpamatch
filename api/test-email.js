const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 環境変数の確認
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      return res.status(500).json({ 
        error: 'メール設定が不完全です',
        details: {
          hasEmailUser: !!emailUser,
          hasEmailPass: !!emailPass
        }
      });
    }

    // メール送信の設定
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    // テストメール送信
    const mailOptions = {
      from: emailUser,
      to: emailUser, // 自分自身に送信
      subject: 'JPAMatch メール送信テスト',
      html: `
        <h2>メール送信テスト</h2>
        <p>このメールが届いたら、メール送信機能は正常に動作しています。</p>
        <p>送信時刻: ${new Date().toLocaleString('ja-JP')}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: 'テストメールが正常に送信されました',
      sentTo: emailUser
    });
  } catch (error) {
    console.error('メール送信テストエラー:', error);
    res.status(500).json({ 
      error: 'メール送信に失敗しました',
      details: error.message
    });
  }
}
