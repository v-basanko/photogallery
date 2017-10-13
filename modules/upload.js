const config = require('../config');
const multer = require('multer');

module.exports = ()=>{   
    const storage = multer.diskStorage({
        destination: (req, file, cb)=>{
            cb(null, config.get('destPhotos'))   
        },
        filename: (req, file, cb)=>{
            cb(null, Date.now() + file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length))             
        }
    });
return multer({ storage: storage }).single(config.get('formFileName'));
}