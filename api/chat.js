const https = require('https');

module.exports = (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Convert the parsed JSON body back to string if Vercel already parsed it
  const requestBody = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;

  const options = {
    hostname: 'integrate.api.nvidia.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.headers.authorization || ''
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    // Forward the status code and headers
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    // Pipe the SSE stream directly to the client
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (e) => {
    console.error('Proxy Error:', e);
    res.status(500).json({ error: 'Proxy Error', message: e.message });
  });

  proxyReq.write(requestBody);
  proxyReq.end();
};
