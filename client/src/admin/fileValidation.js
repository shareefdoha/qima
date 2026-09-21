export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 10 * 1024 * 1024;
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
export const VIDEO_ACCEPT = 'video/mp4,video/webm';

export const IMAGE_HELPER = 'Max image size: 2 MB (Supported: JPEG, PNG, WEBP)';
export const VIDEO_HELPER = 'Max video size: 10 MB (Supported: MP4, WEBM)';
export const YOUTUBE_HELPER = 'Enter full YouTube Video URL (e.g., https://www.youtube.com/watch?v=...)';

export function validateImageFile(file) {
  if (!file) return null;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return 'Choose a JPEG, PNG, or WEBP image.';
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return 'Selected file exceeds 2 MB limit! Please choose a smaller file.';
  }
  return null;
}

export function validateVideoFile(file) {
  if (!file) return null;
  if (!['video/mp4', 'video/webm'].includes(file.type)) {
    return 'Choose an MP4 or WEBM video.';
  }
  if (file.size > VIDEO_MAX_BYTES) {
    return 'Selected video exceeds 10 MB limit! Please choose a smaller file.';
  }
  return null;
}

export function isValidYouTubeUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    return host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be';
  } catch {
    return false;
  }
}
