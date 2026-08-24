import { getSettings, applyTheme } from './common.js';

const els = {
  theme: document.getElementById('theme'),
  folder: document.getElementById('default-folder'),
  newTab: document.getElementById('open-new-tab'),
  favicons: document.getElementById('show-favicons'),
  status: document.getElementById('status'),
};

let statusTimer = null;

init();

async function init() {
  const settings = await getSettings();
  applyTheme(settings.theme);

  els.theme.value = settings.theme;
  els.newTab.checked = settings.openInNewTab;
  els.favicons.checked = settings.showFavicons;
  await populateFolders(settings.defaultParentId);

  els.theme.addEventListener('change', () =>
    save({ theme: els.theme.value }, () => applyTheme(els.theme.value))
  );
  els.folder.addEventListener('change', () => save({ defaultParentId: els.folder.value }));
  els.newTab.addEventListener('change', () => save({ openInNewTab: els.newTab.checked }));
  els.favicons.addEventListener('change', () => save({ showFavicons: els.favicons.checked }));
}

async function populateFolders(selectedId) {
  const [root] = await chrome.bookmarks.getTree();
  const fallback = (root.children?.[1] ?? root.children?.[0])?.id;
  const target = selectedId || fallback;
  const walk = (node, depth) => {
    for (const child of node.children ?? []) {
      if (child.url) continue;
      const option = document.createElement('option');
      option.value = child.id;
      option.textContent = `${'\u00a0\u00a0'.repeat(depth)}${child.title || 'Untitled'}`;
      if (child.id === target) option.selected = true;
      els.folder.append(option);
      walk(child, depth + 1);
    }
  };
  walk(root, 0);
}

async function save(patch, after) {
  await chrome.storage.sync.set(patch);
  after?.();
  els.status.hidden = false;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    els.status.hidden = true;
  }, 1400);
}
