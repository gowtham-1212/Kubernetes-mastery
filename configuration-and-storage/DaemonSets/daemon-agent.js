const os = require('os');

console.log(`[AGENT STARTUP] Node Monitoring Daemon running on Host: ${os.hostname()}`);

setInterval(() => {
    const freeMemMB = Math.round(os.freemem() / 1024 / 1024);
    const totalMemMB = Math.round(os.totalmem() / 1024 / 1024);
    const cpuLoad = os.loadavg()[0].toFixed(2);

    console.log(`[NODE METRICS] Host: ${os.hostname()} | CPU Load (1m): ${cpuLoad} | Free RAM: ${freeMemMB}MB / ${totalMemMB}MB`);
}, 10000);