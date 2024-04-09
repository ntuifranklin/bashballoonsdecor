const multer = require('multer');
const IMG_DIR_FOR_WEB = `/assets/img/itemimgs/`;
module.exports.IMG_DIR_FOR_WEB = IMG_DIR_FOR_WEB ;
const upload_folder = `../static_template${IMG_DIR_FOR_WEB}`;
// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, upload_folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
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

module.exports.fileuploads = fileuploads;
