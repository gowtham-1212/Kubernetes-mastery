const express = require('express');
const os = require('os');
const app = express();
const PORT = 3000;

app.get('/status', (req, res) => {
    res.json({
        message: "High-Performance I/O Pod is running!",
        podName: os.hostname(),
        hardwareRequirement: "SSD required for this workload",
        timestamp: new Date()
    });
});

app.listen(PORT, () => {
    console.log(`High I/O Server running on pod ${os.hostname()}`);
});