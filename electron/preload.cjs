const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('commonplace', {
  init: () => ipcRenderer.invoke('app:init'),
  chooseLibrary: () => ipcRenderer.invoke('library:choose'),
  openLibrary: () => ipcRenderer.invoke('library:open'),
  addFiles: () => ipcRenderer.invoke('files:add'),
  openFile: (filePath) => ipcRenderer.invoke('file:open', filePath),
  loadData: () => ipcRenderer.invoke('data:load'),
  saveData: (data) => ipcRenderer.invoke('data:save', data)
});
