export const SITE_NAME = 'StreamSnag'

/** Base URL for OG tags — set VITE_SITE_URL in production (e.g. https://yoursite.com) */
export function getSiteUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  return import.meta.env.VITE_SITE_URL || ''
}

export const DEFAULT_SEO = {
  title: `${SITE_NAME} — Free Video Downloader | YouTube, Instagram, TikTok & More`,
  description:
    'StreamSnag is a free online video downloader that supports YouTube, Instagram, TikTok, X (Twitter), Facebook, and Vimeo. Download videos in MP4, MP3, 720p, 1080p, and more using yt-dlp directly in your browser.',
  ogImage: '/favicon.svg',
}

/** @type {Record<string, { path: string; title: string; description: string; headline: string; subheadline: string }>} */
export const PLATFORM_SEO = {
  home: {
    path: '/',
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    headline: 'Grab any video in seconds',
    subheadline:
      'Paste a link, choose quality, download. Works with YouTube, Instagram, TikTok, X, Facebook, Vimeo & more — powered by yt-dlp.',
  },
  youtube: {
    path: '/youtube-downloader',
    title: 'YouTube Video Downloader — Save YouTube Videos Free | StreamSnag',
    description:
      'Download YouTube videos in HD, 4K, or MP3. Free YouTube downloader — paste a watch or Shorts URL, pick a format, and save. Personal use only.',
    headline: 'YouTube Video Downloader',
    subheadline:
      'Save videos and audio from YouTube in one click. Supports playlists via the Playlist tab.',
  },
  instagram: {
    path: '/instagram-downloader',
    title: 'Instagram Video & Reels Downloader — Save IG Videos | StreamSnag',
    description:
      'Download Instagram Reels, videos, and posts. Paste an Instagram URL — we fetch formats so you can save in the quality you need.',
    headline: 'Instagram Video Downloader',
    subheadline: 'Save Reels and IG videos. Paste a reel or post link and download in your preferred format.',
  },
  tiktok: {
    path: '/tiktok-downloader',
    title: 'TikTok Video Downloader — Save TikTok Videos Without Watermark | StreamSnag',
    description:
      'Download TikTok videos by URL. Paste a TikTok link, choose quality or audio, and save to your device. Respect creators and platform rules.',
    headline: 'TikTok Video Downloader',
    subheadline: 'Paste a TikTok URL and download. Fast, simple, no account required.',
  },
}

export const FAQ_ITEMS = [
  {
    q: 'Is StreamSnag free to use?',
    a: 'Yes. StreamSnag is free to use for personal, legal downloads. We rely on donations to keep the experience ad-free.',
  },
  {
    q: 'Which sites are supported?',
    a: 'YouTube, Instagram, TikTok, X (Twitter), Facebook, Vimeo, and 1000+ other sites supported by yt-dlp. Paste almost any public video URL.',
  },
  {
    q: 'Do I need to install software?',
    a: 'No. Everything runs in your browser. Paste a URL, pick a format, and download when your file is ready.',
  },
  {
    q: 'Why do some videos fail or show limited formats?',
    a: 'Some platforms require login or block bots. Try uploading cookies from a logged-in browser (Cookies section). Age-restricted or private content may not be available.',
  },
  {
    q: 'Can I download playlists?',
    a: 'Yes. Use the Playlist tab to add entire YouTube playlists or similar, then download in bulk.',
  },
  {
    q: 'Is downloading videos legal?',
    a: 'You must comply with copyright law and each platform’s Terms of Service. StreamSnag is intended for personal use and content you have the right to save.',
  },
]
