const express = require('express');
const app = express();
const PORT = 3000;

let isAlive = true;
let isReady = false;

// Simulate a slow 15-second database boot sequence
console.log("App started! Loading database cache...");
setTimeout(() => {
    isReady = true;
    console.log("Cache loaded. App is now READY.");
}, 15000); 

// --- THE PROBES ---
app.get('/healthz', (req, res) => {
    console.log("healthz API called")
    if (isAlive) res.status(200).send("Alive");
    else res.status(500).send("Deadlock!");
});

app.get('/readyz', (req, res) => {
    console.log("readyz API called")
    if (isReady) res.status(200).send("Ready");
    else res.status(503).send("Still loading cache...");
});

// --- THE KILL SWITCHES ---
app.get('/break-liveness', (req, res) => {
    isAlive = false;
    res.send("Liveness broken! Waiting for K8s to shoot me...");
});

app.get('/break-readiness', (req, res) => {
    isReady = false;
    res.send("Readiness broken! Waiting for K8s to pull my traffic...");
    
    // Automatically fix it after 30 seconds to see traffic return
    setTimeout(() => { isReady = true; }, 30000);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));