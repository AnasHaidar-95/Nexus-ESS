import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { config } from '../../config/index.js';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const errorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const consoleFormat = winston.format.combine(
  errorFormat(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0 && meta.service === undefined) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  }),
);

const fileFormat = winston.format.combine(
  errorFormat(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: config.isDev ? 'debug' : config.logger?.level || process.env.LOG_LEVEL || 'info',
  silent: config.env === 'test',
  defaultMeta: { service: 'ess-api' },
  transports: [
    new winston.transports.Console({
      format: config.isDev ? consoleFormat : fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'rejections.log') }),
  ],
});

export const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};
