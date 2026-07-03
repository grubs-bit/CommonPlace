import { describe, expect, it } from 'vitest';
import { coerceTheme, nextTheme } from './theme';

describe('theme helpers', () => {
  it('accepts light and dark themes', () => {
    expect(coerceTheme('light')).toBe('light');
    expect(coerceTheme('dark')).toBe('dark');
  });

  it('falls back to light for unknown themes', () => {
    expect(coerceTheme('sepia')).toBe('light');
    expect(coerceTheme(undefined)).toBe('light');
  });

  it('toggles between light and dark', () => {
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('light');
  });
});
