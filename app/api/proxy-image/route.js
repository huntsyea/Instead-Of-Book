export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
  
    if (!imageUrl) {
      return new Response('Missing URL parameter', { status: 400 })
    }
  
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
  
      return new Response(blob, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch (error) {
      console.error('Error proxying image:', error)
      return new Response('Error fetching image', { status: 500 })
    }
  }