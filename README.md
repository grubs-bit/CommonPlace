<div align="center">
  <img src="assets/commonplace-logo.png" alt="Commonplace logo" width="260" />

  # Commonplace

  **A calm, local-first academic dashboard for notes, PDFs, ideas, and universal search.**

  <p>
    <img alt="Platform" src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-f3ead8?style=for-the-badge&labelColor=17324d&color=f3ead8">
    <img alt="Electron" src="https://img.shields.io/badge/Electron-React-f3ead8?style=for-the-badge&labelColor=17324d&color=f3ead8">
    <img alt="Local First" src="https://img.shields.io/badge/local--first-no%20account-f3ead8?style=for-the-badge&labelColor=17324d&color=f3ead8">
    <img alt="AI Free" src="https://img.shields.io/badge/AI-none-f3ead8?style=for-the-badge&labelColor=17324d&color=f3ead8">
  </p>
</div>

---

Commonplace is a desktop student assistant designed for keeping university material tidy without turning your study life into a corporate SaaS dashboard. It gives you one place for **markdown notes**, **PDFs/imports**, **developing ideas**, and **search across everything**.

It is intentionally simple: no accounts, no AI layer, no forced cloud. You choose where your library lives.

## Highlights

- **Academic dashboard** — recent notes, ideas, and files in one clean workspace.
- **Markdown notes** — write structured study notes with a live preview.
- **Idea bank** — collect raw ideas, expand them with markdown, and mark them as `Raw`, `Developing`, `Useful`, or `Archived`.
- **Library imports** — add PDFs, markdown files, and text notes.
- **Universal search** — search notes, ideas, imported file metadata, tags, modules, topics, and extracted text.
- **3D topic graph** — assign `#topics` to notes, ideas, and files, then explore them as connected bubbles.
- **Local-first storage** — your data lives in a folder you choose on first launch.
- **Cloud optional** — choose an iCloud, OneDrive, Dropbox, or Google Drive folder and Commonplace will use that provider’s desktop sync.
- **No AI** — this app does not summarise, train on, or send your notes anywhere.

## Screens / Sections

```text
Commonplace
├── Dashboard   Recent material and quick overview
├── Library     PDFs, markdown files, text imports
├── Notes       Markdown note editor and preview
├── Ideas       Expandable idea bank for essays, projects, research
├── Topic Graph 3D bubble map connecting shared #topics
└── Settings    Library location and cloud sync detection
```

## Storage Model

On first launch, Commonplace asks the user to choose a library location. Inside that chosen location it creates:

```text
Commonplace Library/
├── commonplace-data.json
├── files/
│   ├── pdfs/
│   └── imports/
└── backups/
```

The app source code is separate from user data. Users can place their library anywhere, including a synced cloud folder.

## Tech Stack

- **Electron** for cross-platform desktop packaging
- **React** for the interface
- **Vite** for development/build tooling
- **Vitest** for tests
- **react-markdown** for markdown preview
- **pdf-parse** for basic PDF text extraction

## Getting Started

Clone the repository:

```bash
git clone https://github.com/grubs-bit/CommonPlace.git
cd CommonPlace
```

Install dependencies:

```bash
npm install
```

Run the desktop app in development mode:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build the frontend:

```bash
npm run build
```

## Packaging

### macOS

The macOS build is currently configured to remain **unsigned**:

```bash
npm run package:mac
```

Outputs are created under:

```text
release/
├── Commonplace-0.1.0-arm64.dmg
├── Commonplace-0.1.0-arm64-mac.zip
└── mac-arm64/Commonplace.app
```

Because the app is unsigned, macOS may show a Gatekeeper warning. Open it with right-click → **Open**, or approve it from System Settings.

### Windows

Windows packaging is configured with Electron Builder:

```bash
npm run package:win
```

For the most reliable Windows installer, build on a Windows machine or use GitHub Actions. Building Windows installers from macOS may require extra tooling such as Wine.

## Current Status

This is an early working build. Core functionality exists:

- app shell and academic dashboard
- first-launch library folder picker
- markdown notes
- ideas with statuses
- PDF/text/markdown imports
- `#topic` assignment for notes, ideas, and files
- 3D topic graph with bubble and line connections
- universal search
- cloud provider detection/integration via synced folders
- unsigned macOS packaging
- Windows packaging configuration

## Roadmap

- Custom app icon using the Commonplace logo
- Better PDF preview inside the app
- Export notes as `.md`
- Backup and restore controls
- GitHub Actions for macOS and Windows releases
- Optional portable library mode

## Philosophy

Commonplace is for students who want a quiet, reliable place to think. It should feel closer to a study desk than an admin panel.

No feeds. No accounts. No AI mist. Just your notes, your files, your ideas, and a search bar that actually helps.
