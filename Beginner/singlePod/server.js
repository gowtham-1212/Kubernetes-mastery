import 'dotenv/config';
import Fastify from 'fastify';
import pg from 'pg';

const fastify = Fastify({ logger: true });
const { Pool } = pg;

// Use the environment variable if provided, otherwise fallback to localhost for local dev
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString
});

console.log(`[Database] Target: ${connectionString.split('@')[1] || 'default'}`);

// Liveness Endpoint
fastify.get('/health', async (request, reply) => {
  try {
    // Check DB connectivity
    await pool.query('SELECT 1');
    return { status: 'ok-kubernetes', timestamp: new Date().toISOString() };
  } catch (err) {
    fastify.log.error(`Health check failed: ${err.message}`);
    reply.status(503).send({ status: 'unhealthy', error: err.message });
  }
});

fastify.get('/api/data', async () => {
  return { message: 'Secure data accessed successfully from kubernetes' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
