export function coerceTheme(value) {
  return value === 'dark' ? 'dark' : 'light';
}

export function nextTheme(value) {
  return coerceTheme(value) === 'dark' ? 'light' : 'dark';
}

export function readStoredTheme(storage) {
  try {
    return coerceTheme(storage?.getItem?.('commonplace-theme'));
  } catch {
    return 'light';
  }
}

export function storeTheme(storage, theme) {
  try {
    storage?.setItem?.('commonplace-theme', coerceTheme(theme));
  } catch {
    // Ignore storage failures; theme is cosmetic.
  }
}
