// アプリケーション作成用のモジュールを読み込み

// const {app, BrowserWindow} = require('electron');
const util = require('util')
const childProcess = require('child_process')
const path = require('path')
const fs = require('fs')
const { app, BrowserWindow, ipcMain, dialog } = require('electron')


// メインウィンドウ
let mainWindow;

// app.whenReadyでコールしている実行処理
function createWindow() {
  // メインウィンドウを作成します
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
        enableRemoteModule: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
    },
    width: 800, height: 600
  });

  // メインウィンドウに表示するURLを指定します
  // （今回はmain.jsと同じディレクトリのindex.html）
  mainWindow.loadFile('index.html');

  // デベロッパーツールの起動
  mainWindow.webContents.openDevTools();

  // メインウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 全てのウィンドウが閉じたときの処理
app.on('window-all-closed', () => {
  // macOSのとき以外はアプリケーションを終了させます
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
app.on('activate', () => {
  // メインウィンドウが消えている場合は再度メインウィンドウを作成する
  if (mainWindow === null) {
    createWindow();
  }
});


ipcMain.handle('open', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
      filters: [{ name: 'Documents', extensions: ['txt'] }],
  })
  if (canceled) return { canceled, data: [] }
  const data = filePaths.map((filePath) =>
      fs.readFileSync(filePath, { encoding: 'utf8' })
  )
  return { canceled, data }
})

ipcMain.handle('save', async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
      filters: [{ name: 'Documents', extensions: ['txt'] }],
  })
  if (canceled) { return }
  fs.writeFileSync(filePath, data)
})

ipcMain.handle('shell', async (event, command) => {
  const exec = util.promisify(childProcess.exec);
  return await exec(command);
})