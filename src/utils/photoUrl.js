/**
 * Resolves a room photo or uploaded asset URL.
 * Handles:
 * 1. Base64 data URLs (data:image/...) -> returns as is.
 * 2. Unsplash / external https:// URLs -> returns as is.
 * 3. Relative /uploads/... paths -> prefixes with the correct API origin:
 *    - On localhost: http://localhost:5000 (or VITE_API_URL)
 *    - In production/remote (e.g. test.rekovryltd.com): current origin or VITE_API_URL
 * 4. URLs mistakenly saved in database with http://localhost:5000/uploads/...:
 *    - When viewed on remote host (test.rekovryltd.com), automatically rewrites localhost:5000 to the current server origin!
 */
export function resolvePhotoUrl(url) {
  if (!url || typeof url !== 'string') return ''

  // If base64 data URL, return directly
  if (url.startsWith('data:')) return url

  // If already full http(s) URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it contains localhost:5000 and we are NOT running on localhost:
    if (url.includes('localhost:5000')) {
      if (
        typeof window !== 'undefined' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1'
      ) {
        const apiOrigin =
          import.meta.env?.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')
            ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
            : window.location.origin
        return url.replace(/https?:\/\/localhost:5000/, apiOrigin)
      }
    }
    return url
  }

  // If relative path starting with /uploads or uploads
  if (url.startsWith('/uploads') || url.startsWith('uploads')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const base = (import.meta.env?.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
        return `${base}${cleanPath}`
      } else {
        const base =
          import.meta.env?.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')
            ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
            : window.location.origin
        return `${base}${cleanPath}`
      }
    }
    return cleanPath
  }

  return url
}

