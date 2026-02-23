const express = require('express');
const multer = require('multer');
const axios = require('axios');
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
            const prompt = `
            You are MedAI Core, an expert medical diagnostic AI system running locally. 
            Analyze this medical document or scan (Filename: ${originalname}). 
            Identify whether it's an X-Ray, MRI, Lab Report, or general document.
            Extract any medical findings, conditions, or anomalies.
            Provide a confidence score (percentage string, e.g., '95.2%').
            Provide a concise clinical recommendation.
            Assess the risk level (Low, Medium, High, Critical).

            RESPOND ONLY VALID JSON. No markdown blocks, no text before or after.
            {
              "patient": "Unknown OR Extracted Name/ID",
              "scanType": "Type of Doc/Scan + Context",
              "findings": "String of key observations",
              "confidence": "Percentage string",
              "recommendation": "String",
              "riskLevel": "Low/Medium/High/Critical"
            }
            `;

            // Convert buffer to base64 for Ollama
            const base64Image = buffer.toString('base64');

            // Send request to Ollama Llama 3.2 Vision Model
            const response = await axios.post("http://127.0.0.1:11434/api/generate", {
                model: "llama3.2-vision",
                prompt: prompt,
                images: [base64Image],
                stream: false,
                format: "json"
            });

            let responseText = response.data.response;

            // Clean up possible markdown wrappers
            if (responseText.startsWith('```json')) {
                responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            }

            const analysisResult = JSON.parse(responseText);
            res.status(200).json(analysisResult);

        } catch (aiErr) {
            console.error('Ollama Local API Error:', aiErr.message || aiErr);
            if (aiErr.code === 'ECONNREFUSED') {
                return res.status(503).json({ error: 'Local Ollama engine is not running on port 11434.' });
            }
            res.status(500).json({ error: 'Local AI Analysis engine failed to respond.' });
        }
    } catch (error) {
        console.error('Error in document analysis:', error);
        res.status(500).json({ error: 'Failed to process document' });
    }
});

module.exports = router;
