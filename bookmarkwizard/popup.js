import { getSettings, applyTheme, faviconUrl } from './common.js';

const els = {
  search: document.getElementById('search'),
  star: document.getElementById('star-btn'),
  newFolder: document.getElementById('new-folder-btn'),
  settings: document.getElementById('settings-btn'),
  main: document.getElementById('main'),
  list: document.getElementById('list'),
  count: document.getElementById('count'),
};

let settings;
let tree = null;
let nodeMap = new Map();
let expanded = new Set();

let query = '';
let searchResults = [];
let searchToken = 0;
let searchTimer = null;

let editingId = null;
let addingFolder = false;
let confirmDeleteId = null;
let confirmTimer = null;
let focusedId = null;
let dragId = null;
let refreshTimer = null;

let currentTab = null;
let currentBookmarkId = null;

const isFolder = (node) => !node.url;
// Root containers (Bookmarks bar, Other bookmarks, …) can't be edited, moved, or deleted.
const isSystem = (node) => node.parentId === '0' || !!node.unmodifiable;

const ICONS = {
  chevron: ['M9.5 6.5 15 12l-5.5 5.5'],
  folder: ['M3.5 7.5a2 2 0 0 1 2-2h3.6l1.9 2h7.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z'],
  globe: [
    'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z',
    'M3.5 12h17',
    'M12 3.5c2.3 2.4 3.5 5.3 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.3-3.5-8.5s1.2-6.1 3.5-8.5z',
  ],
  pencil: ['m4.5 19.5 1-3.8L16.9 4.3a2 2 0 0 1 2.8 2.8L8.3 18.5l-3.8 1z', 'm14.5 6.5 3 3'],
  trash: [
    'M4.5 7h15',
    'M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7',
    'm6.5 7 .8 11.2a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8L17.5 7',
    'M10 11v5.5',
    'M14 11v5.5',
  ],
};

init();

async function init() {
  settings = await getSettings();
  applyTheme(settings.theme);

  await refreshTree();

  const { expandedIds } = await chrome.storage.local.get('expandedIds');
  if (Array.isArray(expandedIds)) {
    expanded = new Set(expandedIds.filter((id) => nodeMap.has(id)));
  } else {
    // First run: open the root containers that have anything in them.
    expanded = new Set((tree.children ?? []).filter((c) => c.children?.length).map((c) => c.id));
  }

  bindHeader();
  bindKeyboard();
  render();
  els.search.focus();

  detectCurrentTab();

  for (const event of [
    chrome.bookmarks.onCreated,
    chrome.bookmarks.onRemoved,
    chrome.bookmarks.onChanged,
    chrome.bookmarks.onMoved,
    chrome.bookmarks.onChildrenReordered,
    chrome.bookmarks.onImportEnded,
  ]) {
    event?.addListener(scheduleRefresh);
  }
}

/* ---------- data ---------- */

async function refreshTree() {
  const [root] = await chrome.bookmarks.getTree();
  tree = root;
  nodeMap = new Map();
  const walk = (node) => {
    nodeMap.set(node.id, node);
    node.children?.forEach(walk);
  };
  walk(root);
  for (const id of [...expanded]) if (!nodeMap.has(id)) expanded.delete(id);
}

function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(async () => {
    await refreshTree();
    if (query) {
      const results = await doSearch(query);
      if (results) searchResults = results;
    }
    render();
    updateStarState();
  }, 60);
}

async function doSearch(q) {
  const token = ++searchToken;
  let results = [];
  try {
    results = await chrome.bookmarks.search(q);
  } catch {
    results = [];
  }
  if (token !== searchToken) return null;
  return results.slice(0, 200);
}

function countBookmarks() {
  let n = 0;
  for (const node of nodeMap.values()) if (node.url) n += 1;
  return n;
}

function persistExpanded() {
  chrome.storage.local.set({ expandedIds: [...expanded] });
}

function defaultParentId() {
  const configured = settings.defaultParentId && nodeMap.get(settings.defaultParentId);
  if (configured && isFolder(configured)) return configured.id;
  const roots = tree.children ?? [];
  return (roots[1] ?? roots[0]).id; // "Other bookmarks" when present
}

function pathFor(node) {
  const parts = [];
  let parent = nodeMap.get(node.parentId);
  while (parent && parent.id !== '0') {
    parts.unshift(parent.title || 'Untitled');
    parent = nodeMap.get(parent.parentId);
  }
  return parts.join(' › ') || 'Bookmarks';
}

function isDescendantOf(id, ancestorId) {
  let node = nodeMap.get(id);
  while (node) {
    if (node.id === ancestorId) return true;
    node = nodeMap.get(node.parentId);
  }
  return false;
}

/* ---------- header ---------- */

function bindHeader() {
  els.search.addEventListener('input', () => {
    const value = els.search.value.trim();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      query = value;
      closeForms();
      if (!query) {
        searchResults = [];
        render();
        return;
      }
      const results = await doSearch(query);
      if (results) {
        searchResults = results;
        render();
      }
    }, 120);
  });

  els.star.addEventListener('click', onStarClick);

  els.newFolder.addEventListener('click', () => {
    clearSearch();
    closeForms();
    addingFolder = true;
    render();
    focusInlineForm();
  });

  els.settings.addEventListener('click', () => chrome.runtime.openOptionsPage());
}

async function detectCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab?.url ? tab : null;
  } catch {
    currentTab = null;
  }
  updateStarState();
}

async function updateStarState() {
  let found = null;
  if (currentTab?.url) {
    try {
      found = (await chrome.bookmarks.search({ url: currentTab.url }))[0] ?? null;
    } catch {
      found = null;
    }
  }
  currentBookmarkId = found?.id ?? null;
  els.star.disabled = !currentTab?.url;
  els.star.classList.toggle('active', !!currentBookmarkId);
  els.star.title = currentBookmarkId ? 'Edit bookmark for this page' : 'Bookmark this page';
}

async function onStarClick() {
  if (!currentTab?.url) return;
  if (currentBookmarkId && nodeMap.has(currentBookmarkId)) {
    clearSearch();
    revealNode(currentBookmarkId, { edit: true });
    return;
  }
  try {
    const node = await chrome.bookmarks.create({
      parentId: defaultParentId(),
      title: currentTab.title || currentTab.url,
      url: currentTab.url,
    });
    currentBookmarkId = node.id;
    await refreshTree();
    clearSearch();
    revealNode(node.id, { edit: true });
    updateStarState();
  } catch (err) {
    console.error('BookmarkWizard: could not add bookmark', err);
  }
}

/* ---------- rendering ---------- */

function render() {
  const scrollTop = els.main.scrollTop;
  els.list.textContent = '';
  const frag = document.createDocumentFragment();

  if (addingFolder) frag.append(buildFolderForm());

  if (query) renderSearch(frag);
  else renderTree(frag);

  els.list.append(frag);
  els.main.scrollTop = scrollTop;
  updateFooter();

  if (focusedId && document.activeElement === document.body) {
    rowEl(focusedId)?.focus();
  }
}

function renderTree(frag) {
  const roots = tree.children ?? [];
  const hasContent = roots.some((r) => r.children?.length);
  if (!hasContent && !addingFolder) {
    frag.append(emptyState('No bookmarks yet', 'Press the star to save the current page — no bar required.'));
    return;
  }
  for (const child of roots) appendNode(frag, child, 0);
}

function appendNode(frag, node, depth) {
  frag.append(buildRow(node, depth));
  if (editingId === node.id) frag.append(buildEditForm(node, depth));
  if (isFolder(node) && expanded.has(node.id)) {
    const children = node.children ?? [];
    if (!children.length) frag.append(folderEmptyHint(depth + 1));
    for (const child of children) appendNode(frag, child, depth + 1);
  }
}

function renderSearch(frag) {
  if (!searchResults.length) {
    frag.append(emptyState('No matches', `Nothing found for “${query}”.`));
    return;
  }
  for (const result of searchResults) {
    const node = nodeMap.get(result.id) ?? result;
    frag.append(buildRow(node, 0, { result: true }));
    if (editingId === node.id) frag.append(buildEditForm(node, 0));
  }
}

function buildRow(node, depth, opts = {}) {
  const folder = isFolder(node);
  const row = document.createElement('div');
  row.className = `row ${folder ? 'is-folder' : 'is-bookmark'}${opts.result ? ' is-result' : ''}`;
  row.dataset.id = node.id;
  row.style.setProperty('--depth', depth);
  row.tabIndex = -1;
  row.setAttribute('role', 'treeitem');
  if (folder && !opts.result) row.setAttribute('aria-expanded', String(expanded.has(node.id)));
  if (node.url) row.title = node.url;

  if (folder && !opts.result) {
    row.append(svgIcon('chevron', `chevron${expanded.has(node.id) ? ' open' : ''}`));
  }
  row.append(folder ? svgIcon('folder', 'glyph') : faviconEl(node));

  const text = document.createElement('div');
  text.className = 'text';
  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = node.title || node.url || 'Untitled';
  text.append(title);
  if (opts.result) {
    const path = document.createElement('span');
    path.className = 'path';
    path.textContent = pathFor(node);
    text.append(path);
  }
  row.append(text);

  if (folder && !opts.result) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = String(node.children?.length ?? 0);
    row.append(badge);
  }

  if (!isSystem(node)) row.append(buildActions(node));

  bindRowEvents(row, node);
  return row;
}

function faviconEl(node) {
  if (!settings.showFavicons) return svgIcon('globe', 'glyph');
  const img = document.createElement('img');
  img.className = 'favicon';
  img.alt = '';
  img.src = faviconUrl(node.url);
  img.addEventListener('error', () => img.replaceWith(letterTile(node.url)), { once: true });
  return img;
}

function letterTile(url) {
  const tile = document.createElement('span');
  tile.className = 'tile';
  let host = '';
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    host = '';
  }
  tile.textContent = (host[0] || '•').toUpperCase();
  let hash = 0;
  for (const ch of host) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  tile.style.background = `hsl(${hash}, 40%, 55%)`;
  return tile;
}

function buildActions(node) {
  const actions = document.createElement('span');
  actions.className = 'actions';

  const edit = iconButton('pencil', 'Edit');
  edit.addEventListener('click', (e) => {
    e.stopPropagation();
    startEdit(node.id);
  });

  const del = iconButton('trash', isFolder(node) ? 'Delete folder and contents' : 'Delete');
  del.classList.add('danger');
  if (confirmDeleteId === node.id) {
    del.classList.add('confirm');
    del.title = 'Click again to delete';
  }
  del.addEventListener('click', (e) => {
    e.stopPropagation();
    onDelete(node);
  });

  actions.append(edit, del);
  return actions;
}

function iconButton(icon, label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'icon-btn small';
  btn.title = label;
  btn.setAttribute('aria-label', label);
  btn.append(svgIcon(icon));
  return btn;
}

function svgIcon(name, className = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  if (className) svg.setAttribute('class', className);
  for (const d of ICONS[name]) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}

function folderEmptyHint(depth) {
  const div = document.createElement('div');
  div.className = 'folder-empty';
  div.style.setProperty('--depth', depth);
  div.textContent = 'Empty';
  return div;
}

function emptyState(title, sub) {
  const div = document.createElement('div');
  div.className = 'empty';
  const mark = document.createElement('div');
  mark.className = 'empty-mark';
  mark.textContent = '✦';
  const heading = document.createElement('div');
  heading.className = 'empty-title';
  heading.textContent = title;
  const hint = document.createElement('div');
  hint.className = 'empty-sub';
  hint.textContent = sub;
  div.append(mark, heading, hint);
  return div;
}

function updateFooter() {
  if (query) {
    const n = searchResults.length;
    els.count.textContent = `${n} match${n === 1 ? '' : 'es'}`;
  } else {
    const n = countBookmarks();
    els.count.textContent = `${n} bookmark${n === 1 ? '' : 's'}`;
  }
}

function rowEl(id) {
  return els.list.querySelector(`.row[data-id="${CSS.escape(id)}"]`);
}

/* ---------- interactions ---------- */

function bindRowEvents(row, node) {
  row.addEventListener('click', (e) => {
    if (e.target.closest('.actions')) return;
    focusedId = node.id;
    if (isFolder(node)) {
      if (query) jumpToFolder(node.id);
      else toggleFolder(node.id);
    } else {
      openBookmark(node, e);
    }
  });

  row.addEventListener('auxclick', (e) => {
    if (e.button === 1 && node.url) {
      e.preventDefault();
      openInBackground(node);
    }
  });

  row.addEventListener('focus', () => {
    focusedId = node.id;
  });

  if (!query && !isSystem(node)) {
    row.draggable = true;
    row.addEventListener('dragstart', (e) => {
      dragId = node.id;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', node.id);
      requestAnimationFrame(() => row.classList.add('dragging'));
    });
    row.addEventListener('dragend', () => {
      dragId = null;
      row.classList.remove('dragging');
      clearDropMarks();
    });
  }
  if (!query) {
    row.addEventListener('dragover', (e) => onDragOver(e, row, node));
    row.addEventListener('drop', (e) => onDrop(e, row, node));
  }
}

function toggleFolder(id) {
  if (expanded.has(id)) expanded.delete(id);
  else expanded.add(id);
  persistExpanded();
  render();
}

function jumpToFolder(id) {
  clearSearch();
  expanded.add(id);
  persistExpanded();
  revealNode(id);
}

function openBookmark(node, e = {}) {
  if (!node.url) return;
  if (e.ctrlKey || e.metaKey) {
    openInBackground(node);
    return;
  }
  if (settings.openInNewTab || e.shiftKey) {
    chrome.tabs.create({ url: node.url });
  } else {
    chrome.tabs.update({ url: node.url });
  }
  window.close();
}

function openInBackground(node) {
  chrome.tabs.create({ url: node.url, active: false });
}

function startEdit(id) {
  closeForms();
  editingId = id;
  render();
  const row = rowEl(id);
  row?.scrollIntoView({ block: 'nearest' });
  focusInlineForm();
}

async function onDelete(node) {
  if (confirmDeleteId !== node.id) {
    confirmDeleteId = node.id;
    clearTimeout(confirmTimer);
    confirmTimer = setTimeout(() => {
      confirmDeleteId = null;
      render();
    }, 2600);
    render();
    return;
  }
  clearTimeout(confirmTimer);
  confirmDeleteId = null;
  try {
    if (isFolder(node)) await chrome.bookmarks.removeTree(node.id);
    else await chrome.bookmarks.remove(node.id);
  } catch (err) {
    console.error('BookmarkWizard: delete failed', err);
  }
  expanded.delete(node.id);
  if (editingId === node.id) editingId = null;
  if (focusedId === node.id) focusedId = null;
  await refreshTree();
  if (query) {
    const results = await doSearch(query);
    if (results) searchResults = results;
  }
  render();
  updateStarState();
}

function revealNode(id, { edit = false } = {}) {
  const node = nodeMap.get(id);
  if (!node) return;
  let parent = nodeMap.get(node.parentId);
  while (parent && parent.id !== '0') {
    expanded.add(parent.id);
    parent = nodeMap.get(parent.parentId);
  }
  persistExpanded();
  if (edit) {
    editingId = id;
    addingFolder = false;
  }
  render();
  const row = rowEl(id);
  row?.scrollIntoView({ block: 'center' });
  if (edit) focusInlineForm();
  else {
    focusedId = id;
    row?.focus();
  }
}

function closeForms() {
  editingId = null;
  addingFolder = false;
}

function clearSearch() {
  query = '';
  searchResults = [];
  els.search.value = '';
}

function focusInlineForm() {
  const input = els.list.querySelector('form.inline-form input');
  input?.focus();
  input?.select();
}

/* ---------- forms ---------- */

function textInput(placeholder, value) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.value = value ?? '';
  input.spellcheck = false;
  input.autocomplete = 'off';
  return input;
}

function buildFolderOptions(select, excludeId, selectedId) {
  const walk = (node, depth) => {
    for (const child of node.children ?? []) {
      if (!isFolder(child) || child.id === excludeId) continue;
      const option = document.createElement('option');
      option.value = child.id;
      option.textContent = `${'\u00a0\u00a0'.repeat(depth)}${child.title || 'Untitled'}`;
      if (child.id === selectedId) option.selected = true;
      select.append(option);
      walk(child, depth + 1);
    }
  };
  walk(tree, 0);
}

function formActions(submitLabel, onCancel) {
  const wrap = document.createElement('div');
  wrap.className = 'form-actions';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'btn primary';
  submit.textContent = submitLabel;
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'btn';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', onCancel);
  wrap.append(submit, cancel);
  return wrap;
}

function normalizeUrl(raw) {
  let url = raw.trim();
  if (!url) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) url = `https://${url}`;
  try {
    new URL(url);
  } catch {
    return '';
  }
  return url;
}

function buildEditForm(node, depth) {
  const form = document.createElement('form');
  form.className = 'inline-form';
  form.style.setProperty('--depth', depth);

  const titleInput = textInput('Name', node.title);
  form.append(titleInput);

  let urlInput = null;
  if (!isFolder(node)) {
    urlInput = textInput('URL', node.url);
    form.append(urlInput);
  }

  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Folder');
  buildFolderOptions(select, isFolder(node) ? node.id : null, node.parentId);
  form.append(select);

  form.append(
    formActions('Save', () => {
      editingId = null;
      render();
    })
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const changes = { title: titleInput.value.trim() || (urlInput ? urlInput.value.trim() : 'Untitled') };
    if (urlInput) {
      const url = normalizeUrl(urlInput.value);
      if (!url) {
        urlInput.focus();
        return;
      }
      changes.url = url;
    }
    try {
      await chrome.bookmarks.update(node.id, changes);
      if (select.value && select.value !== node.parentId) {
        await chrome.bookmarks.move(node.id, { parentId: select.value });
        expanded.add(select.value);
        persistExpanded();
      }
    } catch (err) {
      console.error('BookmarkWizard: save failed', err);
    }
    editingId = null;
    await refreshTree();
    if (query) {
      const results = await doSearch(query);
      if (results) searchResults = results;
    }
    render();
    updateStarState();
  });

  return form;
}

function buildFolderForm() {
  const form = document.createElement('form');
  form.className = 'inline-form';
  form.style.setProperty('--depth', 0);

  const nameInput = textInput('Folder name', '');
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Parent folder');
  buildFolderOptions(select, null, defaultParentId());
  form.append(nameInput, select);

  form.append(
    formActions('Create', () => {
      addingFolder = false;
      render();
    })
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const parentId = select.value;
    try {
      await chrome.bookmarks.create({ parentId, title: nameInput.value.trim() || 'New folder' });
      expanded.add(parentId);
      persistExpanded();
    } catch (err) {
      console.error('BookmarkWizard: could not create folder', err);
    }
    addingFolder = false;
    await refreshTree();
    render();
  });

  return form;
}

/* ---------- drag and drop ---------- */

function clearDropMarks() {
  for (const el of els.list.querySelectorAll('.drop-above, .drop-below, .drop-into')) {
    el.classList.remove('drop-above', 'drop-below', 'drop-into');
  }
}

function onDragOver(e, row, node) {
  if (!dragId || dragId === node.id || isDescendantOf(node.id, dragId)) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  clearDropMarks();
  const rect = row.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const system = isSystem(node);
  if (isFolder(node)) {
    if (!system && y < rect.height * 0.25) row.classList.add('drop-above');
    else if (!system && y > rect.height * 0.75) row.classList.add('drop-below');
    else row.classList.add('drop-into');
  } else {
    row.classList.add(y < rect.height / 2 ? 'drop-above' : 'drop-below');
  }
}

async function onDrop(e, row, node) {
  e.preventDefault();
  const into = row.classList.contains('drop-into');
  const above = row.classList.contains('drop-above');
  const below = row.classList.contains('drop-below');
  clearDropMarks();
  const id = dragId;
  dragId = null;
  const dragNode = id && nodeMap.get(id);
  if (!dragNode || id === node.id || isDescendantOf(node.id, id)) return;
  try {
    if (into && isFolder(node)) {
      await chrome.bookmarks.move(id, { parentId: node.id });
      expanded.add(node.id);
      persistExpanded();
    } else if (above || below) {
      // index is interpreted against the current sibling list; Chrome adjusts
      // for same-parent moves internally.
      const index = node.index + (below ? 1 : 0);
      await chrome.bookmarks.move(id, { parentId: node.parentId, index });
    } else {
      return;
    }
  } catch (err) {
    console.error('BookmarkWizard: move failed', err);
  }
  await refreshTree();
  render();
}

/* ---------- keyboard ---------- */

function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.target.closest?.('form.inline-form')) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeForms();
        render();
      }
      return;
    }

    const rows = [...els.list.querySelectorAll('.row')];
    const active = document.activeElement;
    const activeIndex = rows.indexOf(active);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = activeIndex < 0 ? rows[0] : rows[Math.min(activeIndex + 1, rows.length - 1)];
      next?.focus();
      next?.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex <= 0) {
        els.search.focus();
        return;
      }
      const prev = rows[activeIndex - 1];
      prev?.focus();
      prev?.scrollIntoView({ block: 'nearest' });
      return;
    }

    if (active === els.search) {
      if (e.key === 'Enter' && query) {
        const first = searchResults.find((r) => r.url);
        if (first) {
          e.preventDefault();
          openBookmark(nodeMap.get(first.id) ?? first, e);
        }
      } else if (e.key === 'Escape' && els.search.value) {
        e.preventDefault();
        clearSearch();
        render();
      }
      return;
    }

    if (activeIndex < 0) return;
    const node = nodeMap.get(active.dataset.id);
    if (!node) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isFolder(node)) {
          if (query) jumpToFolder(node.id);
          else toggleFolder(node.id);
        } else {
          openBookmark(node, e);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (isFolder(node) && !query) {
          if (!expanded.has(node.id)) toggleFolder(node.id);
          else rows[activeIndex + 1]?.focus();
        }
        break;
      case 'ArrowLeft': {
        e.preventDefault();
        if (isFolder(node) && expanded.has(node.id) && !query) {
          toggleFolder(node.id);
          break;
        }
        const parentRow = node.parentId && rowEl(node.parentId);
        parentRow?.focus();
        break;
      }
      case 'F2':
        if (!isSystem(node)) {
          e.preventDefault();
          startEdit(node.id);
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (!isSystem(node)) {
          e.preventDefault();
          onDelete(node);
        }
        break;
      default:
        // Start typing anywhere to search.
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          els.search.focus();
        }
    }
  });
}
