const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: false
        }
    });
    mainWindow.maximize();

    const reactProdPath = path.join(
        __dirname,
        'Frontend',
        'build',
        'index.html'
    );
    console.log('Checking if React build exists at:', reactProdPath);

    if (fs.existsSync(reactProdPath)) {
        console.log('✅ React build found! Loading Electron app...');
        mainWindow.loadURL(`file://${reactProdPath}`);
    } else {
        console.error(
            '❌ React build not found! Make sure to run "npm run build" in the Frontend directory.'
        );
    }

    mainWindow.webContents.once('did-finish-load', () => {
        console.log('✅ Electron loaded successfully!');
    });

    mainWindow.webContents.once(
        'did-fail-load',
        (_, errorCode, errorDescription) => {
            console.error(
                `❌ Failed to load content: ${errorCode} - ${errorDescription}`
            );
        }
    );

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
