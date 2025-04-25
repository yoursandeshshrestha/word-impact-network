import { createLogger, format, transports, Logger } from 'winston';
import * as Transport from 'winston-transport';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log directory
const logDir = process.env.LOG_DIR || 'logs';

// Define custom log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  },
};

// Define log level based on environment
const level = (): string => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Add colors to winston format
format.colorize().addColors(customLevels.colors);

// Custom format that prevents nesting metadata
const cleanFormat = format.printf((info) => {
  // Extract message
  const { level, message, ...rest } = info;

  // Remove any nested metadata property if it exists
  const { metadata, ...cleanMeta } = rest;

  // Combine metadata contents with other properties if it exists
  const finalMeta = metadata ? { ...cleanMeta, ...metadata } : cleanMeta;

  // Format the log line
  return `${level}: ${message}${
    Object.keys(finalMeta).length > 0 ? ' ' + JSON.stringify(finalMeta) : ''
  }`;
});

// Define transports for logger
const transportsList: Transport[] = [
  // Console transport for development
  new transports.Console({
    format: format.combine(format.colorize({ all: true }), cleanFormat),
  }),
];

// Add file transports if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Daily rotate file for all logs
  const allLogsTransport = new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  });

  // Daily rotate file for error logs
  const errorLogsTransport = new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
  });

  transportsList.push(allLogsTransport as unknown as Transport);
  transportsList.push(errorLogsTransport as unknown as Transport);
}

// Create base logger instance
const baseLogger: Logger = createLogger({
  level: level(),
  levels: customLevels.levels,
  format: format.combine(cleanFormat),
  transports: transportsList,
  exitOnError: false,
});

// Create a wrapper logger with enhanced functionality
const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    baseLogger.info(message, { ...(meta || {}) });
  },
  warn: (message: string, meta?: Record<string, any>) => {
    baseLogger.warn(message, { ...(meta || {}) });
  },
  debug: (message: string, meta?: Record<string, any>) => {
    baseLogger.debug(message, { ...(meta || {}) });
  },
  http: (message: string, meta?: Record<string, any>) => {
    baseLogger.http(message, { ...(meta || {}) });
  },
  // For error logs, add file information from the caller
  error: (message: string, meta?: Record<string, any>) => {
    // Get error location from stack trace
    const stackLines = new Error().stack?.split('\n') || [];
    let filePath = '';

    // Find the first stack line that's not from this file or node_modules
    for (let i = 1; i < stackLines.length; i++) {
      const line = stackLines[i];
      if (line.includes('/src/') && !line.includes('logger.ts')) {
        const match = line.match(/\((.+):(\d+):(\d+)\)/) || line.match(/at (.+):(\d+):(\d+)/);
        if (match) {
          const fullPath = match[1];
          const lineNumber = match[2];

          // Extract just the src path
          const srcIndex = fullPath.indexOf('/src/');
          if (srcIndex >= 0) {
            filePath = `src${fullPath.substring(srcIndex + 4)}:${lineNumber}`;
          } else {
            filePath = `${path.basename(fullPath)}:${lineNumber}`;
          }
          break;
        }
      }
    }

    // Add the location to metadata if we found one
    const errorMeta = { ...(meta || {}) };
    if (filePath) {
      errorMeta.location = filePath;
    }

    baseLogger.error(message, errorMeta);
  },
};

// Export the enhanced logger
export { logger };

// Export a stream for Morgan HTTP logger
export const stream = {
  write: (message: string): void => {
    baseLogger.http(message.trim());
  },
};
