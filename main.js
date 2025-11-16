const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        backgroundColor: '#1e1e1e',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('src/index.html');
    createMenu();
}

function createMenu() {
    const isMac = process.platform === 'darwin';

    const template = [
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),
        {
            label: 'File',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow.webContents.send('menu-new-file')
                },
                {
                    label: 'Open File...',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => handleOpenFile()
                },
                { type: 'separator' },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => mainWindow.webContents.send('menu-save-file')
                },
                {
                    label: 'Save As...',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => handleSaveAs()
                },
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

async function handleOpenFile() {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'All Files', extensions: ['*'] },
            { name: 'Web Files', extensions: ['html', 'css', 'js', 'json'] }
        ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        openFile(result.filePaths[0]);
    }
}

async function openFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        mainWindow.webContents.send('file-opened', {
            path: filePath,
            name: path.basename(filePath),
            content: content
        });
    } catch (error) {
        dialog.showErrorBox('Error', error.message);
    }
}

async function handleSaveAs() {
    const result = await dialog.showSaveDialog(mainWindow, {
        filters: [
            { name: 'All Files', extensions: ['*'] },
            { name: 'HTML', extensions: ['html'] },
            { name: 'CSS', extensions: ['css'] },
            { name: 'JavaScript', extensions: ['js'] }
        ]
    });

    if (!result.canceled) {
        mainWindow.webContents.send('save-as-path', result.filePath);
    }
}

ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return { success: true, content };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
        await fs.writeFile(filePath, content, 'utf-8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('read-directory', async (event, dirPath) => {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const items = entries.map(entry => ({
            name: entry.name,
            path: path.join(dirPath, entry.name),
            isDirectory: entry.isDirectory()
        }));
        return { success: true, items };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-save-dialog', async (event, options) => {
    return await dialog.showSaveDialog(mainWindow, options);
});

ipcMain.handle('show-open-dialog', async (event, options) => {
    return await dialog.showOpenDialog(mainWindow, options);
});

// ✨ NEW: Handle file rename
ipcMain.handle('rename-file', async (event, oldPath, newPath) => {
    try {
        // Check if old file exists
        await fs.access(oldPath);
        
        // Check if new path already exists
        try {
            await fs.access(newPath);
            return { success: false, error: 'A file with that name already exists' };
        } catch {
            // File doesn't exist, which is what we want
        }
        
        // Perform the rename
        await fs.rename(oldPath, newPath);
        
        return { success: true, newPath: newPath };
    } catch (error) {
        console.error('Error renaming file:', error);
        return { success: false, error: error.message };
    }
});

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});