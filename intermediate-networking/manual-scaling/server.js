const express = require('express');
const os = require('os');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/api/process', (req, res) => {
    res.json({
        success: true,
        message: "API Request Processed Successfully",
        servedByPod: os.hostname(),
        timestamp: new Date()
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
