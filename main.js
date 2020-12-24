//npm init -y
//npm install electron --save -dev
//add in scripts->start:"electron ."
//bolier plate for electron
//npm start

//electron->(frameWork)desktop Applicatons with electron it is webApp
//electron=Nodejs+Browser
//npm install ejs-electron
//npm install jquery

//Boiler Plate
const electron = require("electron");
const ejs=require("ejs-electron")//to use JS functions and loops in HTML


const app =electron.app;
const BrowserWindow = electron.BrowserWindow;

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
    nodeIntegration: true,//this will allow Node features in our browser
    enableRemoteModule:true// opens dialog box 
    }
     

  })

  win.loadFile("./index.ejs").then(function(){
      win.maximize();
  })
  win.webContents.openDevTools()// it will open the inspect tool box

}


app.whenReady().then(createWindow);

//THIS IS TO TELL ELECTRON IF IT IS WINDOWS OR MAC
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})