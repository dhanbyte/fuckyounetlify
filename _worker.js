export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Serve index.html for all routes (SPA routing)
    if (url.pathname === '/' || !url.pathname.includes('.')) {
      return new Response(`
<!DOCTYPE html>
<html>
<head>
    <title>ShopWave - E-commerce Platform</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <div id="root">
        <h1>ShopWave</h1>
        <p>E-commerce platform deployed on Cloudflare!</p>
        <p>API routes need to be handled separately.</p>
    </div>
</body>
</html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
}