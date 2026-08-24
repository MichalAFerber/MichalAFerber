# Markdown Wizard 🪄

**A private, in-browser Markdown editor and document converter** — built for
[MarkdownWizard.app](https://markdownwizard.app).

Paste text that may or may not contain Markdown, shape it in a side-by-side
editor/preview, then download the finished document in the format the moment
calls for. Everything runs locally in the browser: there is no server, no
account, and your text is never uploaded anywhere.

## Features

- **Side-by-side editing** — Markdown editor on the left, live rendered preview
  on the right, with synchronized scrolling and a draggable divider.
- **Formatting toolbar** along the bottom: headings, bold/italic/strike/code,
  lists, task lists, quotes, links, images, tables, code blocks, rules —
  plus keyboard shortcuts (`Ctrl/Cmd+B/I/K/E`, `Ctrl+Shift+X`) and smart list
  continuation on Enter.
- **Eight download formats**, generated entirely client-side:

  | Format | How it's made | Notes |
  |---|---|---|
  | **PDF** (`.pdf`) | [pdfmake] — real selectable-text vector PDF | Embedded Roboto; for browser-engine fidelity use **Download → Print…** and "Save as PDF" |
  | **Word** (`.docx`) | [docx] — genuine OOXML | Opens correctly in Word, Google Docs, LibreOffice; images embedded |
  | **Word 97–2003** (`.doc`) | Word-flavored HTML | The classic export-to-Word vehicle; Word may note the format/extension mismatch — that's expected |
  | **Word template** (`.dot`) | Word-flavored HTML | Same vehicle, template extension |
  | **Rich Text** (`.rtf`) | Custom RTF writer | Headings, styles, links, lists, tables, full Unicode via `\uN` escapes |
  | **Plain text** (`.txt`) | Custom flattener | Setext heading underlines, indented lists, aligned tables, `label (url)` links |
  | **Web page** (`.html`) | Rendered + sanitized | Self-contained, styled, print-ready |
  | **Markdown** (`.md`) | The source | Exactly as written |

- **Copy rich text** to the clipboard (`text/html` + `text/plain`) for pasting
  formatted content straight into Gmail, Word, or Google Docs.
- **Autosave** to `localStorage` (this browser only), open/drag-drop `.md`/`.txt`
  files, light/dark theme, document title → download file name.
- **Works offline**: double-click `index.html` and everything functions from
  `file://`. All libraries are vendored; the page makes no network requests
  with your content. The only things ever fetched are images *you* embed by
  URL (for the preview and for embedding into DOCX/PDF).

## Running locally

No build step. Either open `index.html` directly, or serve the folder:

```bash
cd markdownwizard
python3 -m http.server 8080
# → http://localhost:8080
```

## Deploying to MarkdownWizard.app (Cloudflare)

The folder is a ready-to-serve static site. Two easy routes:

**Cloudflare Workers (config included):**

```bash
cd markdownwizard
npx wrangler deploy        # uses wrangler.jsonc (static assets, no code)
```

Then in the Cloudflare dashboard: **Workers & Pages → markdownwizard →
Settings → Domains & Routes → Add custom domain** → `markdownwizard.app`
(and `www.markdownwizard.app` if desired). Cloudflare provisions the
certificate automatically — the `.app` TLD requires HTTPS, which this
satisfies out of the box.

**Cloudflare Pages (dashboard):** create a Pages project from this GitHub
repo, set **Root directory** to `markdownwizard`, leave the build command
empty and the output directory as `/`. Add the custom domain on the project
afterwards.

## Tests

An end-to-end suite drives the real app in headless Chromium: renders the
sample, exercises the toolbar, downloads **every** format, and validates the
outputs (DOCX OOXML structure, PDF text extraction, RTF structure, etc.).

```bash
cd markdownwizard/tests
npm install
node e2e.mjs
```

Downloaded artifacts land in `tests/downloads/` for manual inspection.

## Vendored libraries

| Library | Version | License | Role |
|---|---|---|---|
| [marked] | 12.0.2 | MIT | Markdown parsing (GFM) |
| [DOMPurify] | 3.1.6 | Apache-2.0 OR MPL-2.0 | HTML sanitization |
| [docx] | 8.5.0 | MIT | `.docx` generation |
| [pdfmake] | 0.2.10 | MIT (Roboto: Apache-2.0) | `.pdf` generation |

License texts live in `js/vendor/licenses/`. Everything is pinned and served
from this repo — no CDNs — so the privacy guarantee is auditable.

## Known limitations

- The direct PDF uses embedded Roboto: emoji and some symbols outside its
  coverage render as blanks. The **Print…** route uses the browser's own PDF
  engine and renders everything the preview shows.
- `.doc`/`.dot` are HTML-vehicle files (a long-standing Word convention), so
  non-Word apps may not open them well — prefer `.docx` for compatibility.
- Raw inline HTML in Markdown renders in the preview/HTML exports (sanitized),
  but is stripped to plain text in DOCX/RTF/PDF/TXT exports.
- Remote images can only be embedded into DOCX/PDF when their host allows
  cross-origin fetches; otherwise the export falls back to the image's alt
  text (the document still exports fine).

[marked]: https://github.com/markedjs/marked
[DOMPurify]: https://github.com/cure53/DOMPurify
[docx]: https://github.com/dolanmiu/docx
[pdfmake]: https://github.com/bpampuch/pdfmake
