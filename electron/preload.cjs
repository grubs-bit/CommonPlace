const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('commonplace', {
  init: () => ipcRenderer.invoke('app:init'),
  chooseLibrary: () => ipcRenderer.invoke('library:choose'),
  openLibrary: () => ipcRenderer.invoke('library:open'),
  addFiles: () => ipcRenderer.invoke('files:add'),
  openFile: (filePath) => ipcRenderer.invoke('file:open', filePath),
  previewFile: (filePath) => ipcRenderer.invoke('file:preview-url', filePath),
  exportMarkdown: (payload) => ipcRenderer.invoke('export:markdown', payload),
  createBackup: () => ipcRenderer.invoke('backup:create'),
  restoreBackup: () => ipcRenderer.invoke('backup:restore'),
  loadData: () => ipcRenderer.invoke('data:load'),
  saveData: (data) => ipcRenderer.invoke('data:save', data)
});
