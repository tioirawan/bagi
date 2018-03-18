var express = require("express");
var ip = require("ip");
var fs = require("fs")
var multer = require("multer");

var upload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, "files/");
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  })
});

const filedir = __dirname + '/../files/'

var router = express.Router();

router.get("/", function(req, res, next) {
  const files = fs.readdirSync(filedir).map(file => {
    const stats = fs.statSync(filedir + file)

    return {
      name: file, 
      size: calculateFileSize(stats.size),
      created: stats.mtimeMs
    }
  }).sort((a, b) => b.created - a.created)

  res.render("index", { files, ip: ip.address(), port: process.env.PORT || "3000" });
});

router.post("/upload", upload.single("file"), function(req, res, next) {
  res.redirect('back');
});

router.get("/download/:file", function(req, res, next) {
  const filename = req.params.file
  console.log("Download:", filename)

  if(!fs.existsSync(filedir + filename)) {
    res.status(404)
    res.end('Error: file not found')
  }

  res.download(filedir + filename)
});

router.get("/delete/:file", function(req, res, next) {
  const filename = req.params.file
  console.log("Delete:", filename)

  if(!fs.existsSync(filedir + filename)) {
    console.warn("file not found")
    res.redirect('/')

    return
  }

  fs.unlinkSync(filedir + filename)

  res.redirect('/')
});

router.delete("/clear", function(req, res){
  const files = fs.readdirSync(filedir)

  for(const file of files){
    const filePath = filedir + file

    console.log("Delete", filePath)

    fs.unlinkSync(filePath)
  }

  req.end()
})

function calculateFileSize(size) {
  const i = Math.floor(Math.log(size) / Math.log(1024))

  return (
      (size / Math.pow(1024, i)).toFixed(2) * 1 +
      ' ' +
      ['B', 'KB', 'MB', 'GB', 'TB'][i]
  )
}

module.exports = router;
