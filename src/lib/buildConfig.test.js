import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('packaged renderer asset paths', () => {
  it('uses relative asset paths so Electron file:// loads bundled JS/CSS', () => {
    const htmlPath = path.resolve(process.cwd(), 'dist/index.html');
    if (!fs.existsSync(htmlPath)) return;
    const html = fs.readFileSync(htmlPath, 'utf8');
    expect(html).not.toContain('src="/assets/');
    expect(html).not.toContain('href="/assets/');
  });
});
