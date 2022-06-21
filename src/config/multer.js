const uuid = require("uuid").v4
const path = require("path")
const multer = require("multer")

const storage = multer.diskStorage({
  filename(_req,file,cb){
    let ext = path.extname(file.originalname)
    cb(null,`${uuid()}.${ext}`)
  },
  destination(_req,_file,cb){
    cb(null,"./uploads")
  }
})
exports.upload = multer({storage})


