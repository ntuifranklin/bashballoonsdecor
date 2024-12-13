const multer = require('multer');
const path = require('path');

const IMG_DIR_FOR_WEB = `/assets/img/itemimgs/`;

const template_folder = 'static_template';
const upload_folder = `../${template_folder}${IMG_DIR_FOR_WEB}`;

const ABSOLUTE_PATH_TO_UPLOAD_FOLDER = path.resolve(__dirname, upload_folder);
// Set up storage for uploaded files-
const datetimenow = Date.now() ; 
const storage = multer.diskStorage({
  destination: (request, file, cb) => {
    cb(null, upload_folder);
  },
  filename: (request, file, cb) => {
    cb(null, datetimenow + file.originalname);
    request.locals.NEWLY_UPLOADED_FILE = datetimenow + file.originalname ;
  }
});

const maxSize = 1 * 1024 * 1024; // 1MB
// Create the multer instance
const fileuploads = multer({ 
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
        // Set the filetypes, it is optional
        var filetypes = /^jpeg|jpg|png|gif$/;
        var mimetype = filetypes.test(file.mimetype);
 
        var extname = filetypes.test(
            path.extname(file.originalname).toLowerCase()
        );
 
        if (mimetype && extname) {
            return cb(null, true);
        }
 
        cb(
            new Error("Error: File upload only supports the " +
                "following filetypes - " +
                filetypes)
        );
    },
}); // .single("itemimgurl")

module.exports = {
  
  template_folder,
  upload_folder,
  IMG_DIR_FOR_WEB,
  ABSOLUTE_PATH_TO_UPLOAD_FOLDER
};
