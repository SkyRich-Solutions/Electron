const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  runPythonScript: (scriptName) => ipcRenderer.invoke('run-python-script', scriptName),
});