const pino = require('pino');

const notProd = process.env.NODE_ENV !== 'local';

let logger;
const sharedConfig = Object.freeze({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['req.headers.authorization'],
    censor: '[REDACTED]'
  },
});

if (notProd) {
  const transport = pino.transport({
    ...sharedConfig,
    target: "pino-loki",
    options: {
      batching: true,
      interval: 5,
      host: process.env.LOKI_URL,
      basicAuth: {
       username: process.env.LOKI_USER,
       password: process.env.LOKI_PASS,
      },
    },
  });
  logger = pino(transport);
} else {
  logger = pino({
    ...sharedConfig,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  });
}

module.exports = logger;