// JSON Extraction Challenge Solution - Node.js (Express + Tesseract.js + API Integrations)

const express = require('express');
const bodyParser = require('body-parser');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: '10mb' }));

// Route: POST /extract-json
app.post('/extract-json', async (req, res) => {
  try {
    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    const imageBuffer = Buffer.from(base64Image, 'base64');
    const tempFilePath = path.join(__dirname, `temp_${uuidv4()}.png`);
    fs.writeFileSync(tempFilePath, imageBuffer);

    const result = await Tesseract.recognize(tempFilePath, 'eng', {
      logger: (m) => console.log(m),
    });

    fs.unlinkSync(tempFilePath); // Cleanup temp file

    const rawText = result.data.text;
    console.log('Extracted Text:', rawText);

    // --- Example: Structure data based on extracted text ---
    // This must be adapted based on actual expected JSON format
    const structuredJSON = {
      name: extractValue(rawText, 'Name'),
      email: extractValue(rawText, 'Email'),
      phone: extractValue(rawText, 'Phone'),
      company: extractValue(rawText, 'Company'),
    };

    return res.json(structuredJSON);
  } catch (err) {
    console.error('Error processing image:', err);
    return res.status(500).json({ error: 'Failed to process image.' });
  }
});

// Helper to extract values based on keywords (very basic example)
function extractValue(text, keyword) {
  const regex = new RegExp(`${keyword}:?\s*(.*)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
