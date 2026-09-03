const express = require('express');
const dns = require('dns');
const os = require('os');

const app = express();
const PORT = 3000;

// The internal DNS name Kubernetes will assign to our Headless Service
const SERVICE_NAME = 'headless-svc.default.svc.cluster.local';

app.get('/discover', (req, res) => {
    // Perform a raw DNS A-Record lookup against the Headless Service
    dns.resolve4(SERVICE_NAME, (err, addresses) => {
        if (err) {
            return res.status(500).json({ error: "DNS Lookup Failed", details: err.message });
        }
        
        res.json({
            whoAmI: os.hostname(),
            message: "I bypassed the Load Balancer and found my siblings directly!",
            discoveredPeerIPs: addresses
        });
    });
});

app.listen(PORT, () => console.log(`Peer Finder running on ${os.hostname()}`));