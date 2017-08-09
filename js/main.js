const electron = require('electron');
const app = electron.app;
const Tray = electron.Tray;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const path = require('path')
const url = require('url')
const ipcMain = require('electron').ipcMain;
const Mustache = require('mustache')
var pdf = require('html-pdf');
var fs = require('fs');

var makePDF = function(html) {
  var options = { format: 'A4' };
  pdf.create(html, options).toFile('./SAMPLE.pdf', function(err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
  });
}

ipcMain.on('save-channel', function(event, arg) {
    console.log("Got a message from the app to access native features")
    // First we get the saveType
    console.log(arg)
    console.log(arg.saveType)
    if (arg.saveType === "json") {
      console.log("saving as json")
      try { fs.writeFileSync('SAMPLE.json', JSON.stringify(arg), 'utf-8'); }
      catch(e) { alert('Failed to save the file !'); }
    }
    else if (arg.saveType === "pdf") {
      console.log("constructing pdf")
      arg.parsed = function(){ return this.subject + " : " + this.content}
      console.log("added parsingfunction for templating")
      // First we save the file as html
      var base = fs.readFile('./base.html', {encoding: "utf8"}, function (err, html) {
        if (err) {
            throw err;
        }
        console.log("loaded html file");
        var markup = Mustache.render(html, arg);
        // try { fs.writeFileSync('tmphtml.html', markup, 'utf-8'); }
        // catch(e) { alert('Failed to save the file !'); }
        makePDF(markup)
      });
    }
});


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})
  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)



// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
