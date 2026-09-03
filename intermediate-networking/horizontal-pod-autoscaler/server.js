const express = require('express');
const os = require('os');
const app = express();
const PORT = 3000;

// Standard lightweight endpoint
app.get('/', (req, res) => {
    res.json({ message: "API V1 - Running Smoothly", pod: os.hostname() });
});

// The CPU Burner endpoint - This is what will trigger the HPA
app.get('/stress', (req, res) => {
    let result = 0;
    // A heavy loop to artificially spike the CPU
    for (let i = 0; i < 500000000; i++) {
        result += Math.sqrt(i);
    }
    res.json({ message: "CPU stress test complete", pod: os.hostname(), result });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));