const { createLogger, transports, format, addColors } = require('winston');

const consoleFormat = format.printf(
  (info) => `[${info.timestamp} ${info.level}] ${JSON.stringify(info.message, null, 4)}`,
);

const logger = createLogger({
  level: 'http',
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(format.timestamp(), format.colorize(), consoleFormat),
      stderrLevels: ['error'],
    }),
    new transports.File({
      filename: 'log',
      dirname: 'logs',
      format: format.combine(format.timestamp(), format.json()),
      maxsize: 10_000_000,
      maxFiles: 10,
    }),
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
