const { createLogger, transports, format, addColors } = require('winston');

const consoleFormat = format.printf(
  (info) => `[${info.timestamp} ${info.level}] ${JSON.stringify(info.message, null, 4)}`,
);

const logger = createLogger({
  level: 'http',
  transports: [
    new transports.Console({ format: format.combine(format.timestamp(), format.colorize(), consoleFormat) }),
    new transports.File({ filename: 'log.log', format: format.combine(format.timestamp(), format.json()) }),
  ],
});

addColors({
  http: 'blue',
  info: 'bold cyan',
  warn: 'italic yellow',
  error: 'bold red',
  debug: 'green',
});

module.exports = logger;
