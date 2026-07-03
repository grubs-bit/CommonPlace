const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const fssync = require('fs');
const crypto = require('crypto');
const isDev = require('electron-is-dev');
const pdfParse = require('pdf-parse');

const APP_NAME = 'Commonplace';
const LIBRARY_FOLDER_NAME = 'Commonplace Library';
const DATA_FILE = 'commonplace-data.json';

let mainWindow;

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

function defaultLibraryData() {
  const now = new Date().toISOString();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    notes: [],
    ideas: [],
    files: [],
    tags: []
  };
}

async function getSettings() {
  return readJson(settingsPath(), { libraryPath: null });
}

async function saveSettings(settings) {
  await writeJson(settingsPath(), settings);
  return settings;
}

function dataPath(libraryPath) {
  return path.join(libraryPath, DATA_FILE);
}

async function ensureLibrary(baseFolder) {
  const libraryPath = baseFolder.endsWith(LIBRARY_FOLDER_NAME)
    ? baseFolder
    : path.join(baseFolder, LIBRARY_FOLDER_NAME);
  await fs.mkdir(path.join(libraryPath, 'files', 'pdfs'), { recursive: true });
  await fs.mkdir(path.join(libraryPath, 'files', 'imports'), { recursive: true });
  await fs.mkdir(path.join(libraryPath, 'backups'), { recursive: true });
  const file = dataPath(libraryPath);
  if (!fssync.existsSync(file)) {
    await writeJson(file, defaultLibraryData());
  }
  await saveSettings({ libraryPath });
  return libraryPath;
}

async function currentLibraryPath() {
  const settings = await getSettings();
  return settings.libraryPath;
}

async function requireLibrary() {
  const libraryPath = await currentLibraryPath();
  if (!libraryPath) throw new Error('No library selected');
  await ensureLibrary(libraryPath);
  return libraryPath;
}

async function loadData() {
  const libraryPath = await requireLibrary();
  return readJson(dataPath(libraryPath), defaultLibraryData());
}

async function saveData(data) {
  const libraryPath = await requireLibrary();
  data.updatedAt = new Date().toISOString();
  await writeJson(dataPath(libraryPath), data);
  return data;
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`;
}

function safeFileName(filePath) {
  const parsed = path.parse(filePath);
  const cleaned = parsed.name.replace(/[^a-z0-9-_ .]/gi, '').trim() || 'file';
  return `${cleaned}-${Date.now()}${parsed.ext.toLowerCase()}`;
}

async function extractFileText(filePath, extension) {
  try {
    if (['.md', '.markdown', '.txt'].includes(extension)) {
      return await fs.readFile(filePath, 'utf8');
    }
    if (extension === '.pdf') {
      const buffer = await fs.readFile(filePath);
      const parsed = await pdfParse(buffer);
      return parsed.text || '';
    }
  } catch (error) {
    console.warn('Text extraction failed:', error.message);
  }
  return '';
}

async function chooseLibraryFolder() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Choose where Commonplace should store your library',
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled || !result.filePaths[0]) return null;
  const libraryPath = await ensureLibrary(result.filePaths[0]);
  return { libraryPath, data: await loadData() };
}

async function addFiles() {
  const libraryPath = await requireLibrary();
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Add PDFs or notes',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Study files', extensions: ['pdf', 'md', 'markdown', 'txt'] },
      { name: 'All files', extensions: ['*'] }
    ]
  });
  if (result.canceled) return null;
  const data = await loadData();
  const imported = [];
  for (const sourcePath of result.filePaths) {
    const extension = path.extname(sourcePath).toLowerCase();
    const type = extension === '.pdf' ? 'pdf' : 'import';
    const destinationDir = path.join(libraryPath, 'files', type === 'pdf' ? 'pdfs' : 'imports');
    const storedName = safeFileName(sourcePath);
    const destination = path.join(destinationDir, storedName);
    await fs.copyFile(sourcePath, destination);
    const searchableText = await extractFileText(destination, extension);
    const item = {
      id: makeId('file'),
      title: path.basename(sourcePath),
      type,
      extension,
      storedPath: destination,
      originalPath: sourcePath,
      tags: [],
      module: '',
      description: '',
      searchableText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.files.unshift(item);
    imported.push(item);
  }
  await saveData(data);
  return { imported, data };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 980,
    minHeight: 650,
    title: APP_NAME,
    backgroundColor: '#f7f1e7',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.COMMONPLACE_DEV === '1') {
    mainWindow.loadURL('http://127.0.0.1:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('app:init', async () => {
  const settings = await getSettings();
  if (!settings.libraryPath || !fssync.existsSync(settings.libraryPath)) {
    return { libraryPath: null, data: null };
  }
  await ensureLibrary(settings.libraryPath);
  return { libraryPath: settings.libraryPath, data: await loadData() };
});
ipcMain.handle('library:choose', chooseLibraryFolder);
ipcMain.handle('library:open', async () => {
  const libraryPath = await requireLibrary();
  await shell.openPath(libraryPath);
  return libraryPath;
});
ipcMain.handle('files:add', addFiles);
ipcMain.handle('file:open', async (_event, filePath) => shell.openPath(filePath));
ipcMain.handle('data:save', async (_event, nextData) => saveData(nextData));
ipcMain.handle('data:load', loadData);
