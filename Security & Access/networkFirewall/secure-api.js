const express = require('express');
const app = express();
const PORT = 3000;

app.get('/secret', (req, res) => {
    console.log("Authorized access granted!");
    res.json({
        message: "🔒 TOP SECRET DATA ACCESSED!",
        balance: "$1,000,000",
        status: "Securely Transmitted"
    });
});

app.listen(PORT, () => console.log(`Secure Target API listening on port ${PORT}`));