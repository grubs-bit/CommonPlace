import { describe, expect, it } from 'vitest';
import { detectCloudProvider, cloudProviderOptions } from './cloud';

describe('detectCloudProvider', () => {
  it('detects common sync providers from a selected library path', () => {
    expect(detectCloudProvider('/Users/me/Library/Mobile Documents/com~apple~CloudDocs/Commonplace Library')).toBe('iCloud Drive');
    expect(detectCloudProvider('C:/Users/me/OneDrive/Commonplace Library')).toBe('OneDrive');
    expect(detectCloudProvider('/Users/me/Dropbox/Commonplace Library')).toBe('Dropbox');
    expect(detectCloudProvider('/Users/me/Google Drive/Commonplace Library')).toBe('Google Drive');
  });

  it('returns Local Folder when no cloud provider is detected', () => {
    expect(detectCloudProvider('/Users/me/Documents/Commonplace Library')).toBe('Local Folder');
  });

  it('lists supported provider choices', () => {
    expect(cloudProviderOptions.map((option) => option.name)).toContain('iCloud Drive');
    expect(cloudProviderOptions.map((option) => option.name)).toContain('OneDrive');
  });
});
