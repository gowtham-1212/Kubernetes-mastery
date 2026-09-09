const express = require('express');
const os = require('os');
const app = express();
const PORT = 3000;

app.get('/status', (req, res) => {
    res.json({
        message: "Heavy Workload Pod Running",
        podName: os.hostname(),
        status: "Processing"
    });
});

app.listen(PORT, () => {
    console.log(`Heavy Workload Server running on pod ${os.hostname()}`);
});