const os = require('os');

const TASK_NAME = process.env.TASK_NAME || 'Generic Batch Task';

console.log(`🚀 [JOB START] Executing '${TASK_NAME}' on Pod: ${os.hostname()}`);

// Simulate a heavy task (e.g., database backup or data cleanup)
setTimeout(() => {
    console.log(`✅ [JOB SUCCESS] Task '${TASK_NAME}' completed successfully!`);
    // Exit Code 0 tells Kubernetes the Job finished cleanly
    process.exit(0); 
}, 5000);