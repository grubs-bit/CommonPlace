export const cloudProviderOptions = [
  {
    name: 'iCloud Drive',
    hint: 'Choose a folder inside iCloud Drive to sync the Commonplace Library between Macs.'
  },
  {
    name: 'OneDrive',
    hint: 'Choose a OneDrive folder to sync across Windows and macOS.'
  },
  {
    name: 'Google Drive',
    hint: 'Choose a Google Drive desktop folder for sync.'
  },
  {
    name: 'Dropbox',
    hint: 'Choose a Dropbox folder for sync.'
  },
  {
    name: 'Local Folder',
    hint: 'Keep everything on this device only.'
  }
];

export function detectCloudProvider(libraryPath = '') {
  const path = String(libraryPath).toLowerCase();
  if (path.includes('mobile documents') || path.includes('clouddocs') || path.includes('icloud')) return 'iCloud Drive';
  if (path.includes('onedrive')) return 'OneDrive';
  if (path.includes('google drive') || path.includes('googledrive')) return 'Google Drive';
  if (path.includes('dropbox')) return 'Dropbox';
  return 'Local Folder';
}

export function cloudStatusForPath(libraryPath = '') {
  const provider = detectCloudProvider(libraryPath);
  const option = cloudProviderOptions.find((entry) => entry.name === provider) || cloudProviderOptions.at(-1);
  return {
    provider,
    synced: provider !== 'Local Folder',
    message: provider === 'Local Folder'
      ? 'This library is stored locally. To enable cloud sync, move/change the library to an iCloud, OneDrive, Google Drive, or Dropbox folder.'
      : `This library appears to be inside ${provider}. Commonplace will use that provider’s desktop sync.` ,
    hint: option.hint
  };
}
