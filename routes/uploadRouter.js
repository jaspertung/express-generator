const express = require('express')
const authenticate = require('../authenticate')
const multer = require('multer')

//multer has defaults, but customize
const storage = multer.diskStorage({ //2 object configs
    destination: (req, file, cb) => { //cb: callback function
        cb(null, 'public/images') //null: no error, path we want to save to (public so others can see)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname) //makes sure file name is same on server as client side (or else multer will generate random name)
    }
})

//file filter
const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { //regex to check if file extension is not one of these
        return eb(new Error('You can upload only image files!'), false) //reject file upload
    }
    cb(null, true) //no error and accept file upload
}

//call multer function
const upload = multer({ storage: storage, fileFilter: imageFileFilter}) //multer module configured to enable image file uploads

const uploadRouter = express.Router()

//config uploadRouter to handle HTTP requests (only allowing POST)
uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('GET operation not supported on /imageUpload')
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => { //upload.single: expecting single file upload with input field name of imageFile, then multer takes over and handles any errors (file has been successfully uploaded)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(req.file) //multer adds object file with file info and send info back to client
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /imageUpload')
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('DELETE operation not supported on /imageUpload')
})

module.exports = uploadRouter