# Commonplace

Commonplace is a cross-platform Windows/macOS student assistant app: a local-first academic dashboard for PDFs, markdown notes, ideas, tags, and universal search.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run package:mac
npm run package:win
```

Packaging Windows installers from macOS may require Wine or a Windows CI runner for best results.

## Data model

The app asks the user to choose a library folder on first launch. It creates a `Commonplace Library` folder there with:

```text
commonplace-data.json
files/
  pdfs/
  imports/
backups/
```

No AI features are included.
