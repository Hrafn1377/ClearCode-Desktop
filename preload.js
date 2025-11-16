const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    renameFile: (oldPath, newPath) => ipcRenderer.invoke('rename-file', oldPath, newPath), // ✨ ADDED
    readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    onMenuNewFile: (callback) => ipcRenderer.on('menu-new-file', callback),
    onMenuSaveFile: (callback) => ipcRenderer.on('menu-save-file', callback),
    onMenuFind: (callback) => ipcRenderer.on('menu-find', callback),
    onFileOpened: (callback) => ipcRenderer.on('file-opened', callback),
    onFolderOpened: (callback) => ipcRenderer.on('folder-opened', callback),
    onSaveAsPath: (callback) => ipcRenderer.on('save-as-path', callback),
    platform: process.platform,
    isElectron: true
});

contextBridge.exposeInMainWorld('isDesktop', true);