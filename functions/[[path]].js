export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ 
        error: 'API routes not available in static deployment' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Serve static files
    return context.next();
  } catch (error) {
    return new Response('Error', { status: 500 });
  }
}