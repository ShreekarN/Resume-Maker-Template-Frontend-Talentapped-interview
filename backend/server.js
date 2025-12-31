// imports
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const resumeRoutes = require('./routes/resume');
const uploadRoutes = require('./routes/upload');
const path = require('path');

const app = express();

// middleware
app.use(cors()); // cors
app.use(bodyParser.json()); // json
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // static

// NOTE: MongoDB connection placeholder
// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/resumedb', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('mongo connected'))
//   .catch(err => console.log('mongo error', err));

app.use('/api/resume', resumeRoutes); // resume
app.use('/api/upload', uploadRoutes); // upload

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server listening ${PORT}`)); // listen
