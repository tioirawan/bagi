Dropzone.prototype.getErroredFiles = function () {
  var file, i, len;
  var ref = this.files;
  var results = [];

  for (i = 0, len = ref.length; i < len; i++) {
    file = ref[i];
    if (file.status === Dropzone.ERROR) {
      results.push(file);
    }
  }

  return results;
};

Dropzone.options.fileDrop = {
  maxFilesize: 10000,
  timeout: 0,
  dictDefaultMessage: "Click or Drop files here to upload",
  init: function () {
    this.on("queuecomplete", function (file) {
      if (this.getErroredFiles().length) {
        return alert("Sorry, an error occurred!")
      }

      if (
        this.getUploadingFiles().length === 0 &&
        this.getQueuedFiles().length === 0
      ) {
        location.reload();
      }
    });
  }
};

function clearAll() {
  if (confirm("Are you sure?")) {
    fetch("/clear", {
      method: "delete"
    }).then(function (resp) {
      location.reload()
    });
  }
}
