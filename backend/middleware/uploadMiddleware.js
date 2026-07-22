import multer from "multer";//file upload lib
import path from "path";

//tells Multer WHERE and HOW to save files.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG, and PDF files are allowed"), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
