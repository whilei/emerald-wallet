// import {BrowserWindow, Menu, shell } from 'electron';
// import winLinuxMenu from './menus/win-linux';
const path = require('path');
const url = require('url');
const electron = require('electron');
const winLinuxMenu = require('./menus/win-linux');
// import icon from './icons/background.png';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
export let mainWindow;
let menu;

export function createWindow (openDevTools) {
  // Create the browser window.
  mainWindow = new electron.BrowserWindow({width: 1060, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // https://github.com/electron-userland/electron-packager/issues/217
 //  mainWindow.webContents.executeJavaScript(`
 //   var path = require('path');
 //   module.paths.push(path.resolve('node_modules'));
 //   module.paths.push(path.resolve('../node_modules'));
 //   module.paths.push(path.resolve(__dirname, '..', '..', 'electron', 'node_modules'));
 //   module.paths.push(path.resolve(__dirname, '..', '..', 'electron.asar', 'node_modules'));
 //   module.paths.push(path.resolve(__dirname, '..', '..', 'app', 'node_modules'));
 //   module.paths.push(path.resolve(__dirname, '..', '..', 'app.asar', 'node_modules'));
 //   path = undefined;
 // `);

  // Open the DevTools.
  if (openDevTools) {
      mainWindow.webContents.openDevTools();
      require('devtron').install();
  }
    // https://stackoverflow.com/questions/32402327/how-can-i-force-external-links-from-browser-window-to-open-in-a-default-browser
    mainWindow.webContents.on('will-navigate', function(e, url) {
        e.preventDefault();
        electron.shell.openExternal(url);
    });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });

  // Menu (only win and linux for now)
  menu = electron.Menu.buildFromTemplate(winLinuxMenu(mainWindow));
  mainWindow.setMenu(menu);

  return mainWindow.webContents;
}
