import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")  || file.mimetype.startsWith("video/")){
        cb(null, true);
    } else {
        cb(null, false);
    }
}


export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
    fileSize:  1024 * 1024 * 50,
    }
})