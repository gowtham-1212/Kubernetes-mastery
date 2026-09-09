const express = require('express');
const os = require('os');
const app = express();
const PORT = 3000;

app.get('/burn', (req, res) => {
    console.log(`[${os.hostname()}] CPU Burn endpoint hit! Simulating heavy math...`);
    let result = 0;

    for (let i = 0; i < 500000000; i++) {
        result += Math.sqrt(i);
    }
    
    res.json({
        message: "CPU Spike completed successfully",
        podName: os.hostname(),
        result
    });
});

app.listen(PORT, () => console.log(`Auto-Scale API running on ${os.hostname()}`));