export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('Test API endpoint called:', req.method, req.url);
  
  res.status(200).json({
    message: 'Test API endpoint is working',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
}
