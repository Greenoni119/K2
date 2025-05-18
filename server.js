const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const port = 3000;

// Middleware
app.use(express.static('.'));
app.use(fileUpload());

// Update index.html endpoint
app.post('/update-index', async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).send('No file uploaded');
        }

        const file = req.files.file;
        await file.mv(path.join(__dirname, 'index.html'));
        res.send('File updated successfully');
    } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).send('Error updating file');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
