// imports
const express = require('express');
const router = express.Router();
// const Resume = require('../models/Resume'); // mongoose model (commented)
// const parseController = require('../controllers/parseController'); // optional

// get placeholder
router.get('/', (req, res) => {
  res.json({ message: 'GET /api/resume - placeholder' });
});

// post placeholder (no DB writes)
router.post('/', async (req, res) => {
  const data = req.body;
  // Example of how DB save would look (commented)
  // const doc = new Resume(data);
  // await doc.save();
  res.json({ message: 'POST /api/resume - placeholder', data });
});

module.exports = router;
