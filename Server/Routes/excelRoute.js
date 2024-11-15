const express = require('express');
const multer = require('multer');
const excelController = require('../Controllers/excelController.js');
const path = require('path');

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Upload and process Excel file
router.post('/upload', upload.single('file'), excelController.uploadExcel);

module.exports = router;
