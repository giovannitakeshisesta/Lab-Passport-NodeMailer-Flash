const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage;


// Configurar cloudinary donde tiene que apuntar para que nos autentique 
// crea una instancia de configuracion de cloudinary
// 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

// creo una instancia de cloudinary storage para generar la configuracion de los settings de cloudinary , carpeta y formato file
// https://www.npmjs.com/package/multer-storage-cloudinary => usage
// https://cloudinary.com/documentation/image_upload_api_reference#upload_optional_parameters
//All parameters are optional except the configured Cloudinary API object:
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ironhack/multer-example',
    allowed_formats: ['jpg', 'png'],
  }
})

// esportamos la configuracion del middleware storage
module.exports = multer({ storage })