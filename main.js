const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const Store = require('electron-store');
const path = require('path');

const store = new Store({
  name: 'data',
  defaults: {
    records: [],
    settings: {
      soundEnabled: true,
      soundType: 'soft-bell'
    }
  }
});

let mainWindow;
let historyWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 280,
    height: 340,
    frame: false,
    transparent: false,
    resizable: false,
    alwaysOnTop: true,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    },
    backgroundColor: '#F5F5F0'
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });
}

function createHistoryWindow() {
  if (historyWindow) {
    historyWindow.focus();
    return;
  }

  historyWindow = new BrowserWindow({
    width: 300,
    height: 400,
    frame: true,
    resizable: false,
    parent: mainWindow,
    modal: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    },
    backgroundColor: '#F5F5F0'
  });

  historyWindow.loadFile(path.join(__dirname, 'renderer', 'history.html'));

  historyWindow.on('closed', () => {
    historyWindow = null;
  });
}

ipcMain.handle('open-history', () => {
  createHistoryWindow();
});

ipcMain.handle('close-window', () => {
  mainWindow.close();
});

ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('select-sound-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择提示音文件',
    filters: [{ name: '音频文件', extensions: ['mp3', 'wav', 'ogg'] }],
    properties: ['openFile']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    store.set('settings.soundFile', result.filePaths[0]);
    return result.filePaths[0];
  }
  return null;
});

app.whenReady().then(() => {
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});