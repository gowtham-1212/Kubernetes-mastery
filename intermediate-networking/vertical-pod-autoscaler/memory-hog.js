const express = require('express');
const app = express();
const PORT = 3000;

// This global array will store data forever, creating an intentional memory leak
let memoryLeakArray = [];

app.get('/allocate', (req, res) => {
    console.log("Allocating chunk of memory...");
    
    // Push roughly ~10MB of junk string data into the global array
    for (let i = 0; i < 10000; i++) {
        memoryLeakArray.push(new Array(1000).join('VPA_MEMORY_TEST_DATA_'));
    }
    
    const usedMemoryMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    console.log(`Current Heap Usage: ${usedMemoryMB} MB`);
    
    res.json({
        message: "Memory allocated successfully",
        currentUsageMB: usedMemoryMB
    });
});

app.listen(PORT, () => console.log(`Memory Hog API running on port ${PORT}`));