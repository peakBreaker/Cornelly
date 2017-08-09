var ipcRenderer = require('electron').ipcRenderer;
var fs = require('fs');
const {dialog} = require('electron').remote;

var readFileSystem = function(s){

  dialog.showOpenDialog((fileNames) => {
      // fileNames is an array that contains all the selected
      if(fileNames === undefined){
          console.log("No file selected");
          return;
      }
      fs.readFile(filepath, 'utf-8', (err, data) => {
          if(err){
              alert("An error ocurred reading the file :" + err.message);
              return;
          }
          // Change how to handle the file content
          console.log("The file content is : " + data);
          // Check if the file has the valid fields

          // And load it into the self object
      });
  });

}

// Class for our content
var content = function() {
  // First we set the self variable
  var self = this;
  // Observables
  self.subject = ko.observable("");
  self.content = ko.observable("");
  self.json = ko.computed(function(){
    // {subject: "...", content: "..."}
    return {"subject": self.subject(), "content": self.content()}
  });
}

var ViewModel = function () {
  // First we set the self variable
  console.log("viewModel is loading!")
  var self = this;
  // Next we make the observables
  self.contents = ko.observableArray([]);
  self.summary = ko.observable("")
  // We make the ko computed to get the contents as json
  self.pageJSON = ko.computed(function(){
    var contentsJSON = {"mainContents":[], "summary": self.summary(), "saveType":""};
    self.contents().forEach(function(content){
      contentsJSON.mainContents.push(content.json());
    })
    return contentsJSON;
  });

  // Function to add new contents
  self.addContent = function() {
    console.log(self.contents().length)
    if (self.contents().length < 10){
      console.log("new content")
      self.contents.push(new content());
    } else {alert("Too many inputs on this page")}
  }

  self.loadContent = function() {
    if (self.contents().length > 1 | self.summary().length > 1){
      var user_continues = confirm("You have unsaved data, do you wish to continue?")
      if (user_continues){
        readFileSystem(self)
      }
    } else {
      readFileSystem(self)
    }
  }
  // Function to save the content as json
  self.saveContent = function() {
    console.log("Saving contents")
    // We just grap the page as json and edit the saveType to *json*
    var sendContent = self.pageJSON()
    sendContent.saveType = "json"
    // And we send it through ipc
    ipcRenderer.send('save-channel', sendContent);
    console.log("And json request is sent.")
  }

  // Function to export the content as pdf
  self.makePdf = function(){
    console.log("Making pdf")
    // We just grap the page as json and edit the saveType to *pdf*
    var sendContent = self.pageJSON()
    sendContent.saveType = "pdf"
    // And we send it through ipc
    ipcRenderer.send('save-channel', sendContent);
    console.log("And pdf request is sent.")
  }
}

ko.applyBindings(new ViewModel());
