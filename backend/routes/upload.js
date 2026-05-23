import express from "express";
import multer from "multer";

const router = express.Router();

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api-v1/upload
router.post("/", upload.single("file"), (req, res) => {
  try {
    const fileUrl = `https://project-manager-eeyj.onrender.com/uploads/${req.file.filename}`;

    res.json({
      url: fileUrl,
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
