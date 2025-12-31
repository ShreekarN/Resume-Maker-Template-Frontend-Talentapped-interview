// imports
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const parseController = require('../controllers/parseController');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function(req, file, cb) {
    const now = Date.now();
    cb(null, `${now}-${file.originalname}`);
  }
});
const upload = multer({ storage }); // multer

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  try {
    const parsed = await parseController.parseFile(req.file.path, req.file.mimetype);
    res.json({ parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'parse error' });
  }
});

module.exports = router;
