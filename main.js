// const { app, BrowserWindow } = require('electron');
// const path = require('path');
// const fs = require('fs');
// const { spawn } = require('child_process');

// let mainWindow;

// app.whenReady().then(() => {
//     mainWindow = new BrowserWindow({
//         width: 1000,
//         height: 700,
//         webPreferences: {
//             nodeIntegration: false,
           
//         }
//     });
//     mainWindow.maximize();

//     const reactProdPath = path.join(
//         __dirname,
//         'Frontend',
//         'build',
//         'index.html'
//     );
//     console.log('Checking if React build exists at:', reactProdPath);

//     if (fs.existsSync(reactProdPath)) {
//         console.log('✅ React build found! Loading Electron app...');
//         mainWindow.loadURL(`file://${reactProdPath}`);
//     } else {
//         console.error(
//             '❌ React build not found! Make sure to run "npm run build" in the Frontend directory.'
//         );
//     }

//     mainWindow.webContents.once('did-finish-load', () => {
//         console.log('✅ Electron loaded successfully!');
//     });

//     mainWindow.webContents.once(
//         'did-fail-load',
//         (_, errorCode, errorDescription) => {
//             console.error(
//                 `❌ Failed to load content: ${errorCode} - ${errorDescription}`
//             );
//         }
//     );

//     mainWindow.once('ready-to-show', () => {
//         mainWindow.show();
//     });

//     mainWindow.on('closed', () => {
//         mainWindow = null;
//     });
// });

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;

// Function to initialize the main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.maximize();
    loadReactApp();
    setupWindowListeners();
    setupIpcHandlers();
}

// Function to load React app into the Electron window
function loadReactApp() {
    const reactProdPath = path.join(__dirname, 'Frontend', 'build', 'index.html');
    console.log('Checking if React build exists at:', reactProdPath);

    if (fs.existsSync(reactProdPath)) {
        console.log('✅ React build found! Loading Electron app...');
        mainWindow.loadURL(`file://${reactProdPath}`);
    } else {
        console.error(
            '❌ React build not found! Make sure to run "npm run build" in the Frontend directory.'
        );
    }
}

// Function to set up event listeners for the main window
function setupWindowListeners() {
    mainWindow.webContents.once('did-finish-load', () => {
        console.log('✅ Electron loaded successfully!');
    });

    mainWindow.webContents.once('did-fail-load', (_, errorCode, errorDescription) => {
        console.error(`❌ Failed to load content: ${errorCode} - ${errorDescription}`);
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Function to handle IPC for Python script execution
function setupIpcHandlers() {
    ipcMain.handle('run-python-script', async (_, scriptName) => {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python3', [path.join(__dirname, 'Backend', `${scriptName}.py`)]); // Adjust path if needed

            let output = '';
            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (error) => {
                console.error(`Error: ${error}`);
                reject(error.toString());
            });

            pythonProcess.on('close', (code) => {
                console.log(`Python script exited with code ${code}`);
                resolve(output.trim()); // Send output back to frontend
            });
        });
    });
}

// Event to handle app initialization
app.whenReady().then(createMainWindow);

// Event to handle window closure for non-darwin platforms
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
