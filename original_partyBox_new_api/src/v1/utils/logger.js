var winston = require("winston");
require("winston-daily-rotate-file");

const { combine, timestamp, prettyPrint, colorize, splat, simple } =
  winston.format;

var transport = new winston.transports.DailyRotateFile({
  filename: "logs/partyboxLog-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  zippedArchive: true,
  maxSize: "5m",
  maxFiles: process.env.LOG_BACKUP,
});

const prettyJson = winston.format.printf((info) => {
  try {
    if (info.message.constructor === Object) {
      info.message = JSON.stringify(info.message, null, 4);
    }
    return `${info.timestamp} - ${info.level} : ${info.message}`;
  } catch (error) {
    console.log(error);
  }
});

var logger = winston.createLogger({
  format: combine(
    colorize(),
    timestamp(),
    prettyPrint(),
    simple(),
    splat(),
    prettyJson
  ),
  transports: [transport, new winston.transports.Console()],
});

module.exports = logger;
