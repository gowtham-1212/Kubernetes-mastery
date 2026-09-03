import React, { useState } from 'react';

function App() {
  const [logs, setLogs] = useState([]);

  const triggerLog = async (service) => {
    // Map to the host-exposed ports of user-service (5004) and order-service (5005)
    const port = service === 'user' ? 5004 : 5005;
    const path = service === 'user' ? 'users' : 'orders';
    console.log(`HItting ++> http://localhost:${port}/${path}`)
    try {
      const res = await fetch(`http://localhost:${port}/${path}`);
      const data = await res.json();
      setLogs(prev => [`Success: Triggered ${service} log at ${new Date().toLocaleTimeString()}`, ...prev]);
    } catch (e) {
      setLogs(prev => [`Error: ${service} service unreachable`, ...prev]);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Lab 08: Observability UI</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => triggerLog('user')} style={{ padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px' }}>
          Trigger User Log
        </button>
        <button onClick={() => triggerLog('order')} style={{ padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px' }}>
          Trigger Order Log
        </button>
      </div>

      <div style={{ background: '#1e293b', color: '#34d399', padding: '1rem', borderRadius: '8px', minHeight: '200px' }}>
        <h3>Action History (Check Grafana for real logs!)</h3>
        {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
}

export default App;
