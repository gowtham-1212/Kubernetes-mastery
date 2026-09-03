const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;
const DATA_DIR = '/data';
const LOG_FILE = path.join(DATA_DIR, 'pod-history.log');

// Ensure persistent directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: fs });
}

// Append current execution timestamp to pod's dedicated volume
const logEntry = `[${new Date().toISOString()}] Pod ${os.hostname()} initialized.\n`;
fs.appendFileSync(LOG_FILE, logEntry);

app.get('/data', (req, res) => {
    const history = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf8') : 'No history found';
    res.json({
        podName: os.hostname(),
        persistentHistory: history.split('\n').filter(Boolean)
    });
});

app.listen(PORT, () => console.log(`Stateful Pod ${os.hostname()} running on port ${PORT}`));