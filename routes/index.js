const express = require("express")
const ip = require("ip")
const fs = require("fs")
const multer = require("multer")
const path = require('path')

const filedir = path.join(__dirname, '../files/')

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "files/")
    },
    filename: handleFileName
  })
})

const router = express.Router()

router.use((req, res, next) => {
  if (!fs.existsSync(filedir)) fs.mkdirSync(filedir)
  next()
})

router.get("/", (req, res, next) => {
  const files = fs.readdirSync(filedir).map(file => {
    const stats = fs.statSync(path.join(filedir, file))

    return {
      name: file,
      size: calculateFileSize(stats.size),
      created: stats.mtimeMs
    }
  }).sort((a, b) => b.created - a.created)

  res.render("index", {
    files,
    ip: ip.address(),
    port: process.env.PORT || "3000"
  })
})

router.post("/upload", upload.single("file"), (req, res, next) => {
  res.status(204).end()
})

router.get("/download/:file", (req, res, next) => {
  const filename = req.params.file

  if (!fs.existsSync(path.join(filedir, filename))) {
    res.status(404)
    return res.end('Error: file not found')
  }

  res.download(path.join(filedir, filename))
})

router.get("/delete/:file", (req, res, next) => {
  const filename = req.params.file

  if (!fs.existsSync(path.join(filedir, filename))) {
    res.redirect('/')

    return
  }

  fs.unlinkSync(path.join(filedir, filename))

  res.redirect('/')
})

router.delete("/clear", (req, res) => {
  const files = fs.readdirSync(filedir)

  for (const file of files) {
    const filePath = path.join(filedir, file)

    fs.unlinkSync(filePath)
  }

  req.end()
})

function handleFileName(req, file, cb) {
  const fileName = file.originalname

  if (!fs.existsSync(path.join(filedir, fileName))) {
    return cb(null, fileName)
  }

  const filearr = fileName.split('.')
  const ext = filearr.pop()

  let newName = `${filearr.join('.')}.${ext}`
  let numfix

  while (fs.existsSync(path.join(filedir, newName))) {
    const name = filearr[0]

    numfix = parseInt(name.substr(-1)) + 1

    filearr[0] = numfix && name.substr(-2, 1) == '_' ?
      name.substr(0, name.length - 1) + numfix :
      name + '_1'

    newName = `${filearr.join('.')}.${ext}`
  }

  cb(null, newName)
}

function calculateFileSize(size) {
  const i = Math.floor(Math.log(size) / Math.log(1024))

  return (
    (size / Math.pow(1024, i)).toFixed(2) * 1 +
    ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i]
  )
}

module.exports = router