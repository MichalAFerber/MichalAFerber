// Shared helpers for the popup and options pages.

export const DEFAULTS = {
  theme: 'system', // 'system' | 'light' | 'dark'
  openInNewTab: false, // plain click opens in the current tab by default
  showFavicons: true,
  defaultParentId: '', // '' = auto ("Other bookmarks")
};

export async function getSettings() {
  const stored = await chrome.storage.sync.get(DEFAULTS);
  return { ...DEFAULTS, ...stored };
}

export function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.dataset.theme = theme;
  } else {
    delete document.documentElement.dataset.theme;
  }
}

// Chrome's local favicon cache — no network requests involved.
export function faviconUrl(pageUrl, size = 32) {
  const url = new URL(chrome.runtime.getURL('/_favicon/'));
  url.searchParams.set('pageUrl', pageUrl);
  url.searchParams.set('size', String(size));
  return url.href;
}
