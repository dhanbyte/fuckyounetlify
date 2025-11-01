export const bunnyConfig = {
  storageZone: process.env.BUNNY_STORAGE_ZONE!,
  storagePassword: process.env.BUNNY_STORAGE_PASSWORD!,
  hostname: process.env.BUNNY_STORAGE_HOSTNAME!,
  cdnUrl: process.env.NEXT_PUBLIC_BUNNY_CDN_URL!
}

export const optimizeImageUrl = (url: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpg' | 'png'
}) => {
  if (!url.includes('b-cdn.net')) return url
  
  const params = new URLSearchParams()
  if (options?.width) params.set('width', options.width.toString())
  if (options?.height) params.set('height', options.height.toString())
  if (options?.quality) params.set('quality', options.quality.toString())
  if (options?.format) params.set('format', options.format)
  
  return params.toString() ? `${url}?${params.toString()}` : url
}

export const uploadToBunny = async (file: File, fileName?: string, folder = '/') => {
  const formData = new FormData()
  formData.append('file', file)
  if (fileName) formData.append('fileName', fileName)
  formData.append('folder', folder)
  
  const response = await fetch('/api/imagekit/auth', {
    method: 'POST',
    body: formData
  })
  
  return response.json()
}