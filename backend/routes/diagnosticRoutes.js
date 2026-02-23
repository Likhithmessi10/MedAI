const express = require('express');
const multer = require('multer');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post('/analyze', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }

        let { originalname, mimetype, buffer } = req.file;

        const supportedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        // Parse extensions for generic octet-stream
        if (!supportedTypes.includes(mimetype)) {
            const ext = originalname.split('.').pop().toLowerCase();
            const mimeMap = {
                'pdf': 'application/pdf',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png'
            };
            if (mimeMap[ext]) {
                mimetype = mimeMap[ext];
            } else {
                return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF, JPG, or PNG for the local Llama analysis.' });
            }
        }

        try {
            let extractedText = '';

            // 1. Text Extraction
            if (mimetype === 'application/pdf') {
                const pdfData = await pdfParse(buffer);
                extractedText = pdfData.text;
            } else if (mimetype.startsWith('image/')) {
                // Warning: Tesseract takes a few seconds on large images
                const { data } = await Tesseract.recognize(buffer, 'eng');
                extractedText = data.text;
            }

            if (!extractedText || extractedText.trim().length === 0) {
                // If OCR fails, send a fallback message
                extractedText = "Unable to extract text from document. Document may be a pure physical scan without recognizable text layers.";
            }

            // 2. Send Extracted Text to Python AI Service
            const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

            const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze-report`, {
                text: extractedText,
                filename: originalname
            }, { timeout: 30000 }); // 30 second timeout for OCR + Llama

            res.status(200).json(aiResponse.data);

        } catch (aiErr) {
            console.error('Python AI Service Error:', aiErr.message || aiErr);
            if (aiErr.code === 'ECONNREFUSED') {
                return res.status(503).json({ error: 'Python AI Engine is not running on port 8000.' });
            }
            res.status(500).json({ error: 'AI Analysis engine failed to respond.' });
        }
    } catch (error) {
        console.error('Error in document analysis:', error);
        res.status(500).json({ error: 'Failed to process document' });
    }
});

module.exports = router;
