Dropzone.options.fileDrop = {
  maxFilesize: 10000,
  timeout: 0,
  init: function() {
    this.on("complete", function(file) {
      if (
        this.getUploadingFiles().length === 0 &&
        this.getQueuedFiles().length === 0
      ) {
        console.log("done");
        location.reload();
      }
    });
  }
};

function clearAll() {
  if (confirm("Are you sure?")) {
    fetch("/clear", {
      method: "delete"
    }).then(resp => location.reload());
  }
}
