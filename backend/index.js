// ESM
import Fastify from 'fastify';
import routes from './src/routes/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true
});

fastify.register(routes);

const PORT = process.env.PORT || 3003;

fastify.listen({ port: PORT, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`Server is now listening on ${address}`)
})
