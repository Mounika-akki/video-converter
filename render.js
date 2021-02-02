const { ipcRenderer } = require("electron");
const $ = require("jquery");
const process = require("child_process");
const randomString = require("random-string");
const fs = require("fs");
const path = require("path");

const isFolderEmpty = (path) => {
  return fs.readdirSync(path).length === 0;
};

const uploadFileButton = document.getElementById("uploadFile");

uploadFileButton.addEventListener("click", (event) => {
  ipcRenderer.send("open-file-dialog");
});

const uploadFolderButton = document.getElementById("uploadFolder");

uploadFolderButton.addEventListener("click", (event) => {
  ipcRenderer.send("open-folder-dialog");
});

const convertButton = document.getElementById("convert");

convertButton.addEventListener("click", (event) => {
  ipcRenderer.send("show-converting-notification");
});

ipcRenderer.on("selected-folder", (event, folder_path) => {
  if (!isFolderEmpty(folder_path)) {
    return (document.getElementById(
      "folderName"
    ).innerHTML = `Please Select an Empty folder`);
  } else {
    document.getElementById("folderName").innerHTML = `${folder_path}`;
  }
});

ipcRenderer.on("selected-file", (event, file_path) => {
  if (path.extname(file_path) !== ".mp4") {
    return (document.getElementById("fileName").innerHTML =
      "Please select a .mp4 file");
  } else {
    document.getElementById("fileName").innerHTML = `${file_path}`;
  }
});

ipcRenderer.on("convert-now", (event, noargs) => {
  var randomId = randomString();
  const file_path = document.getElementById("fileName").innerText;
  const outputPath = document.getElementById("folderName").innerText;
  console.log(file_path + "......." + outputPath);

  $("#info").append(`
        <div id=${randomId} class="alert alert-info">
          ${path.basename(file_path)} is converting So Please Wait
         </div>
    `);
  // document.getElementById("folderName").innerHTML = `your file is :converted`;

  process.exec(
    `ffmpeg -i ${file_path} -profile:v baseline -level 3.0 -s 640x360 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ${outputPath}/index.m3u8`,
    function (error, stdout, stderr) {
      console.log("stdout: " + stdout);
      $(`#${randomId}`).detach();
      Notification.requestPermission().then(function (result) {
        var myNotification = new Notification("Conversion Completed", {
          body: "Your file was successfully converted",
        });
      });
      $("#info").append(`
        <div id=${randomId} class="alert alert-success">
          Please check slected empty folder for converted .m3u8 file
         </div>
    `);
      setTimeout(() => {
        $(`#${randomId}`).detach();
      }, 5000);

      if (error) {
        console.error("exec error: " + error);
      }
    }
  );
});
