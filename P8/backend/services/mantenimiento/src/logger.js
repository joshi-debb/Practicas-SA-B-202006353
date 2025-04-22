const { createLogger, format, transports } = require("winston");

// Logger con campo "service" uniforme
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: { service: "mantenimiento-nodejs" },
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    format.json()
  ),
  transports: [new transports.Console()],
});

module.exports = logger;