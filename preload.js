const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openHistory: () => ipcRenderer.invoke('open-history'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  selectSoundFile: () => ipcRenderer.invoke('select-sound-file'),
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value)
  }
});