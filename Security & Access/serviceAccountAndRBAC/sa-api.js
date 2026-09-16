const express = require('express');
const fs = require('fs');
const https = require('https');
const app = express();
const PORT = 3000;

// Kubernetes automatically injects these files into every pod
const TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';
const CA_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt';

app.get('/list-pods', (req, res) => {
    try {
        const token = fs.readFileSync(TOKEN_PATH, 'utf8');
        const ca = fs.readFileSync(CA_PATH);

        const options = {
            hostname: 'kubernetes.default.svc', // The internal DNS name of the K8s API
            port: 443,
            path: '/api/v1/namespaces/default/pods',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            ca: ca
        };

        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => {
                if (response.statusCode === 403) {
                    res.status(403).json({ error: "❌ HTTP 403: Forbidden! The ServiceAccount lacks RBAC permissions." });
                } else if (response.statusCode === 200) {
                    const parsed = JSON.parse(data);
                    const podNames = parsed.items.map(p => p.metadata.name);
                    res.status(200).json({ message: "✅ Success!", pods: podNames });
                } else {
                    res.status(response.statusCode).send(data);
                }
            });
        });
        
        request.on('error', (e) => res.status(500).send(e.message));
        request.end();
        
    } catch (err) {
        res.status(500).send("Error reading ServiceAccount token: " + err.message);
    }
});

app.listen(PORT, () => console.log(`ServiceAccount POC running on port ${PORT}`));