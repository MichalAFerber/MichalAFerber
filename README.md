# Hi, I'm Michal — aka **TechGuyWithABeard** 👋

Solo dev • Founder • 31+ years in IT • Privacy advocate • Homelab & Cloudflare builder • Shipping small, single-file, privacy-first tools

[![Hub](https://img.shields.io/badge/Hub-techguywithabeard.com-e36b2a)](https://techguywithabeard.com)
[![Blog](https://img.shields.io/badge/Blog-michalferber.me-5fb2ff)](https://michalferber.me)
[![Dev](https://img.shields.io/badge/Dev-michalferber.dev-36d8a4)](https://michalferber.dev)
[![MyKK](https://img.shields.io/badge/MyKK-start.mykk.us-6C3FC5)](https://start.mykk.us)
[![File Viewer](https://img.shields.io/badge/File%20Viewer-file--viewer.us-2f81f7)](https://file-viewer.us)
[![TextWizard](https://img.shields.io/badge/TextWizard-textwizard.us-8b5cf6)](https://textwizard.us)
[![IP Cow](https://img.shields.io/badge/IP%20Cow-ipcow.com-FF6B35)](https://ipcow.com)
[![X (Twitter) Follow](https://img.shields.io/twitter/follow/TechGuyWAB?style=social)](https://x.com/TechGuyWAB)
[![GitHub Followers](https://img.shields.io/github/followers/MichalAFerber?style=social)](https://github.com/MichalAFerber)

![Profile views](https://komarev.com/ghpvc/?username=MichalAFerber&label=Views)


## 🚀 What I'm building

* **[File Viewer family](https://file-viewer.us)** — 13 fast, single-file, offline viewers: PDF, Word, Excel/ODS, PowerPoint, Publisher, EPUB, Markdown, HTML, data (JSON/YAML/CSV/XML/TOML), logs, `.eml` email, X.509 certificates, and images (down to TIFF, QOI & farbfeld). No build step, nothing uploaded — ever.
  Repos: [file-viewer.us](https://github.com/MichalAFerber/file-viewer.us) is the hub; each viewer lives in its own repo ([pdf](https://github.com/MichalAFerber/pdf-viewer.us) · [docx](https://github.com/MichalAFerber/docx-viewer.us) · [sheets](https://github.com/MichalAFerber/sheets-viewer.us) · [image](https://github.com/MichalAFerber/image-viewer.us) · [cert](https://github.com/MichalAFerber/cert-viewer.us) · …)

* **[TextWizard](https://textwizard.us)** — browser-local text & code tools: case converters, diff, analyzers, and more. MIT, zero dependencies, nothing leaves the tab.
  Repo: [textwizard-tools](https://github.com/MichalAFerber/textwizard-tools)

* **Wizard apps & extensions** — [ResizeWizard](https://resizewizard.app) (anchored browser-window resizing, live on the Chrome Web Store), [CopyWizard](https://copywizard.us) (smart form mapper — copy form fields across sites with reusable profiles), and [UploadWizard](https://uploadwizard.app) (white-label client file-upload SaaS: multi-tenant Astro SSR, custom domains, passwordless auth). Free + Pro tiers via Stripe.

* **[IP Cow](https://ipcow.com)** — privacy-first IP, DNS & email diagnostics, running since 2005. Rebuilt in 2026 as an Astro site + API on dedicated Hetzner hosts, with separate IPv4-only and IPv6-only probe endpoints. The reusable core is MIT: [ipcow.com-tools](https://github.com/MichalAFerber/ipcow.com-tools) (`@ipcow/tools-core` + `ipcow-probe`).

* **[MyKK](https://mykk.us)** — a single-file browser start page with 10+ widgets (weather, stocks, RSS, calendar, bookmarks, ambient sounds, more). Vanilla JS, zero deps, Pro tier via Chrome extension + Stripe. Joined by [favorites.mykk.us](https://favorites.mykk.us), a KV-backed speed-dial on Cloudflare Workers, with its marketing site + self-service sync tokens at [favoritespage.us](https://favoritespage.us).
  Repos: [mykk.us-dashboard](https://github.com/MichalAFerber/mykk.us-dashboard) · [mykk.us](https://github.com/MichalAFerber/mykk.us) · [favorites.mykk.us](https://github.com/MichalAFerber/favorites.mykk.us)

* **[tgwab-web](https://github.com/MichalAFerber/tgwab-web)** — pnpm + Astro 5 monorepo powering the identity fleet (hub, blog, dev portfolio, family, ham radio) from one shared design system (`@tgwab/design-tokens` + `@tgwab/ui`). Cloudflare Pages, no Google Fonts.

* **The estate** — the ops layer behind all of the above: Cloudflare Workers and scheduled jobs for job-liveness alerting, uptime probes, notification relay (Discord + email, DMARC/TLS-RPT ingestion), and transactional mail, governed by a shared standards repo. Mostly private by design; the mail Worker is public: [mailer](https://github.com/MichalAFerber/mailer).


## 🧰 Toolbox

**Languages**
![JavaScript](https://img.shields.io/badge/JavaScript-121212?logo=javascript) ![TypeScript](https://img.shields.io/badge/TypeScript-121212?logo=typescript) ![Python](https://img.shields.io/badge/Python-121212?logo=python) ![Bash](https://img.shields.io/badge/Shell-Bash-121212?logo=gnu-bash) ![PowerShell](https://img.shields.io/badge/PowerShell-121212?logo=powershell) ![HTML5](https://img.shields.io/badge/HTML5-121212?logo=html5) ![CSS3](https://img.shields.io/badge/CSS3-121212?logo=css3) ![C#](https://img.shields.io/badge/C%23-121212?logo=csharp)

**Frameworks & Site Generators**
![Astro](https://img.shields.io/badge/Astro-121212?logo=astro) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-121212?logo=tailwindcss) ![Material for MkDocs](https://img.shields.io/badge/Material%20for%20MkDocs-121212?logo=materialformkdocs)

**Platforms & Infrastructure**
![Cloudflare](https://img.shields.io/badge/Cloudflare-121212?logo=cloudflare) ![Hetzner](https://img.shields.io/badge/Hetzner-121212?logo=hetzner) ![Docker](https://img.shields.io/badge/Docker-121212?logo=docker) ![Proxmox](https://img.shields.io/badge/Proxmox-121212?logo=proxmox) ![Raspberry Pi](https://img.shields.io/badge/Raspberry%20Pi-121212?logo=raspberry-pi) ![TrueNAS](https://img.shields.io/badge/TrueNAS-121212?logo=truenas) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-121212?logo=githubactions)

**Services & APIs**
![Stripe](https://img.shields.io/badge/Stripe-121212?logo=stripe) ![Proton](https://img.shields.io/badge/Proton-121212?logo=proton) ![Discord](https://img.shields.io/badge/Discord-121212?logo=discord) ![Wasabi](https://img.shields.io/badge/Wasabi-121212?logo=amazons3) ![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-121212?logo=googlechrome)

**Tools**
![Obsidian](https://img.shields.io/badge/Obsidian-121212?logo=obsidian) ![Claude Code](https://img.shields.io/badge/Claude%20Code-121212?logo=anthropic) ![Termius](https://img.shields.io/badge/Termius-121212?logo=termius) ![Nginx Proxy Manager](https://img.shields.io/badge/NPM-121212?logo=nginx)


## 🧩 More projects

* **[de-google.us](https://github.com/MichalAFerber/de-google.us)** — a plain-English guide to limiting Big Tech without blowing up your life. Astro 5 + Tailwind 4 + Pagefind.

* **[tomatick](https://github.com/MichalAFerber/tomatick)** — 🍅 macOS menu-bar timer, stopwatch, alarm & pomodoro with timestamped history (rumps + PyObjC).

* **[cheatsheets](https://github.com/MichalAFerber/cheatsheets)** — clean, privacy-first developer cheatsheets as web, PDF & Markdown.

* **[github-tree-browser](https://github.com/MichalAFerber/github-tree-browser)** — single-file, client-only GitHub repo tree browser for GitHub Pages.

* **[default-web-pages](https://github.com/MichalAFerber/default-web-pages)** — a recreation archive of web-server default pages: Microsoft IIS (1995–2022) plus nginx, Apache, Caddy & friends.

* **[Welcome Message](https://github.com/MichalAFerber/welcome-message)** — beautiful Linux MOTD with fastfetch, weather, and system metrics. Multi-distro, multi-shell, idempotent installer.

* **[Scripts](https://github.com/MichalAFerber/scripts)** — practical Bash scripts and helpers across Linux systems, Raspberry Pi devices, and self-hosted environments.

* **[Unbound Homelab](https://github.com/MichalAFerber/unbound-homelab)** — production-ready redundant DNS infrastructure for home labs. DNSSEC, health monitoring, automated config management on Raspberry Pi.

* **[Email-to-Discord Worker](https://github.com/MichalAFerber/email-to-discord_cf-worker)** — Cloudflare Worker that routes inbound emails to Discord channels with HTML→Markdown conversion.

* **[GSA Manager](https://github.com/MichalAFerber/gsamanager.org)** — club/association management app with membership tracking, inventory, and payment processing. Active since 2007.

* **[IMDb Movie File Fixer](https://github.com/MichalAFerber/IMDbMovieFileFixer)** — auto-rename movies, fix grammar, check IMDb, handle duplicates.

> See more at **Pinned Repositories** below.


## 🌐 Sites I maintain

**Products & tools**

| Site | What it is |
|------|-----------|
| [techguywithabeard.com](https://techguywithabeard.com) | TGWAB hub — landing, blog, portfolio (Astro / Pagefind) |
| [michalferber.me](https://michalferber.me) | Personal blog — building, operating, shipping projects |
| [michalferber.dev](https://michalferber.dev) | Developer portfolio — extensions, products, certs |
| [start.mykk.us](https://start.mykk.us) | MyKK Dashboard — live demo |
| [favorites.mykk.us](https://favorites.mykk.us) | MyKK Favorites — speed-dial on Cloudflare Workers |
| [favoritespage.us](https://favoritespage.us) | MyKK Favorites marketing site — self-service sync tokens |
| [file-viewer.us](https://file-viewer.us) | File Viewer family hub — 13 offline, single-file viewers |
| [textwizard.us](https://textwizard.us) | Browser-local text & code tools |
| [resizewizard.app](https://resizewizard.app) | ResizeWizard — Chrome extension |
| [copywizard.us](https://copywizard.us) | CopyWizard — smart form mapper extension |
| [uploadwizard.app](https://uploadwizard.app) | UploadWizard — white-label client file uploads |
| [ipcow.com](https://ipcow.com) | Free IP, DNS & email diagnostics — since 2005 |
| [de-google.us](https://de-google.us) | Plain-English guide to limiting Big Tech |
| [tomatick.us](https://tomatick.us) | Tomatick — macOS menu-bar pomodoro |
| [fixdns.net](https://fixdns.net) / [brokedns.com](https://brokedns.com) | DNS repair / migration consulting |

**Family, hobby & client sites**

| Site | What it is |
|------|-----------|
| [ferber.me](https://ferber.me) | Family history site |
| [kj4dia.me](https://kj4dia.me) | Amateur radio — KJ4DIA |
| [grandfathershoney.com](https://grandfathershoney.com) | Beekeeping heritage |
| [elsanjose.com](https://elsanjose.com) | El San Jose Mexican Restaurant, Lake City SC |
| [bethhudsonink.com](https://bethhudsonink.com) | Beth Hudson Ink — editing services |
| [penpaigebooks.com](https://penpaigebooks.com) | Penelope Paige — author links page |


## 📊 GitHub stats

<a href="https://github.com/anuraghazra/github-readme-stats"><img src="https://github-readme-stats.vercel.app/api?username=MichalAFerber&show_icons=true&theme=dark&hide_border=true" height="160" /></a> <a href="https://github.com/anuraghazra/github-readme-stats"><img src="https://github-readme-stats.vercel.app/api/top-langs/?username=MichalAFerber&layout=compact&theme=dark&hide_border=true" height="160" /></a>

[![GitHub Streak](https://streak-stats.demolab.com/?user=MichalAFerber&theme=dark&hide_border=true)](https://git.io/streak-stats)

![Trophies](https://github-profile-trophy.vercel.app/?username=MichalAFerber&theme=onedark&no-frame=true&no-bg=true&row=1&column=6)


## 🤝 Connect

* Hub: **[techguywithabeard.com](https://techguywithabeard.com)**
* Blog: **[michalferber.me](https://michalferber.me)**
* Dev portfolio: **[michalferber.dev](https://michalferber.dev)**
* Buy Me a Coffee: **[buymeacoffee.com/techguywithabeard](https://buymeacoffee.com/techguywithabeard)**

> *I build small, well-documented tools that are easy to fork and run. If something here helps you, feel free to fork, file issues, or say hi.*
