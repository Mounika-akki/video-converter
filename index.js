const { app, BrowserWindow, Menu, MenuItem } = require("electron");
const { ipcMain } = require("electron");
const os = require("os");
const { dialog } = require("electron");

let mainWindow = null;

const template = [
  {
    label: "Menu",
    submenu: [
      {
        label: "New Project",
        click() {
          displaySteps;
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      {
        role: "undo",
      },
      {
        role: "redo",
      },
      {
        type: "separator",
      },
      {
        role: "cut",
      },
      {
        role: "copy",
      },
      {
        role: "paste",
      },
    ],
  },

  {
    label: "View",
    submenu: [
      {
        role: "reload",
      },
      {
        role: "toggledevtools",
      },
      {
        type: "separator",
      },
      {
        role: "resetzoom",
      },
      {
        role: "zoomin",
      },
      {
        role: "zoomout",
      },
      {
        type: "separator",
      },
      {
        role: "togglefullscreen",
      },
    ],
  },

  {
    role: "window",
    submenu: [
      {
        role: "minimize",
      },
      {
        role: "close",
      },
    ],
  },

  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    resizable: true,
    height: 750,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

ipcMain.on("open-folder-dialog", (event) => {
  console.log("Folder upload button pressed");

  dialog
    .showOpenDialog(null, {
      properties: ["openDirectory"],
    })
    .then((result) => {
      console.log("filepath", result.filePaths);
      event.sender.send("selected-folder", result.filePaths[0]);
    })
    .catch((error) => {
      console.error(error);
    });
});

ipcMain.on("open-file-dialog", (event) => {
  console.log("upload button pressed");
  if (os.platform() === "linux" || os.platform() === "win32") {
    dialog
      .showOpenDialog(null, {
        properties: ["openFile"],
      })
      .then((result) => {
        console.log("filepaths", result.filePaths);
        event.sender.send("selected-file", result.filePaths[0]);
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    dialog
      .showOpenDialog(null, {
        properties: ["openFile", "openDirectory"],
      })
      .then((result) => {
        console.log(result.filePaths);
        event.sender.send("selected-file", result.filePaths[0]);
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

ipcMain.on("show-converting-notification", (event) => {
  console.log("req sent from main to renderer");
  event.sender.send("convert-now", "no args");
});
