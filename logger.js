const pino = require('pino');

const notProd = process.env.NODE_ENV !== 'local';
const serviceName = process.env.SERVICE_NAME || 'user-api';
const env = process.env.NODE_ENV || 'local';

let logger;
const sharedConfig = Object.freeze({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['req.headers.authorization'],
    censor: '[REDACTED]'
  },
  base: {
    service_name: serviceName,
    process_pid: process.pid,
    env,
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
      // only present for pino transport
      // so that I could filter by service_name, service_name is not undefined
      // filter by env as well
      // these values will not be present in logs, but available for labels filter
      labels: {
        service_name: serviceName,
        env,
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