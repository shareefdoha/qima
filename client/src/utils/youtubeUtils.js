export function getYouTubeVideoId(value = '') {
  const input = String(value).trim();
  if (!input) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || null;
    if (!['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) return null;
    if (url.pathname === '/watch') return url.searchParams.get('v');
    const parts = url.pathname.split('/').filter(Boolean);
    const marker = parts.findIndex((part) => ['embed', 'shorts', 'live', 'v'].includes(part));
    return marker >= 0 ? parts[marker + 1] || null : null;
  } catch {
    return null;
  }
}

export function toYouTubeEmbedUrl(value, options = {}) {
  const id = getYouTubeVideoId(value);
  if (!id) return null;
  const params = new URLSearchParams({ rel: '0', modestbranding: '1', ...options });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

export function youTubeThumbnail(value) {
  const id = getYouTubeVideoId(value);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
