// Run "npm run start" to execute this script!

const electron = require('electron')

const { ipcMain, webFrame } = require('electron')
const { app, BrowserWindow, screen } = require('electron/main')

/**
 * Clamps the provided number `x` within the range `[min,max]`. Returns `x` if `min<x<max` else returns `max` if `x>max` or `min` if 'x<min'.
 * @param {number} x The number to clamp.
 * @param {number} min The lower bound of the range.
 * @param {number} max The higher bound of the range.
 * @returns {number} The clamped number.
 */
function clamp(x, min, max)
{
    return Math.min(Math.max(x,min),max);
}

/** @param {BrowserWindow} win */
function handleConsoleLog(win)
{
    ipcMain.addListener('console.log', function(e,...args){ console.log(...args); });
}
/** @param {BrowserWindow} win */
function handleUserInputs(win)
{
    ipcMain.addListener('window-reload', function(){ win.reload(); })

    ipcMain.addListener('window-minimize', function(){ win.minimize(); })
    ipcMain.addListener('window-handle-maximize', function(){ win.isMaximized() ? win.unmaximize() : win.maximize(); })

    ipcMain.handle('window-is-maximized', function(){ return win.isMaximized(); });

    let intervalHandle = null;
    let offset = [-1,-1];
    let ogSize = [800,600];
    ipcMain.addListener('window-move', function(){ 
        if(win.isMaximized()) win.unmaximize();

        let p = electron.screen.getCursorScreenPoint();
        let wp = win.getPosition();

        ogSize = win.getSize();

        offset = [p.x-wp[0], p.y-wp[1]]

        intervalHandle = setInterval(function(){
        let pI = electron.screen.getCursorScreenPoint();
            win.setPosition(clamp(pI.x-offset[0],200-ogSize[0],screen.getPrimaryDisplay().workAreaSize.width-10),clamp(pI.y-offset[1],0,screen.getPrimaryDisplay().workAreaSize.height-50), true);
            win.setSize(ogSize[0],ogSize[1],true)
        }, 1) 
    });
    ipcMain.addListener('window-nomove', function(){
        let pI = electron.screen.getCursorScreenPoint();
        win.setPosition(clamp(pI.x-offset[0],200-ogSize[0],screen.getPrimaryDisplay().workAreaSize.width-10),clamp(pI.y-offset[1],0,screen.getPrimaryDisplay().workAreaSize.height-50), true);
        win.setSize(ogSize[0],ogSize[1],true)
        clearInterval(intervalHandle);
    })
}
function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: "frontend/favicon.png",
        titleBarStyle: 'hidden',

        webPreferences: {
          preload: __dirname+'/preload.js'
        },

        minWidth: 550,
        minHeight: 200
    })

    // win.removeMenu();
    win.loadFile('frontend/index.html')

    handleConsoleLog(win);
    handleUserInputs(win);
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})