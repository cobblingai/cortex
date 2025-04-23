import { app } from "electron";
import * as path from "path";
import winston from "winston";
import { TransformableInfo } from "logform";
import "winston-daily-rotate-file";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LoggerConfig {
  level: LogLevel;
  filePath?: string;
  consoleOutput?: boolean;
  maxFiles?: string | number;
  maxSize?: string;
}

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;
  private config: LoggerConfig;

  private constructor(config: LoggerConfig) {
    this.config = config;
    this.logger = this.initializeWinston();
  }

  public static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      const defaultConfig: LoggerConfig = {
        level: LogLevel.INFO,
        filePath: path.join(app.getPath("userData"), "logs"),
        consoleOutput: true,
        maxFiles: "14d", // Keep logs for 14 days
        maxSize: "20m", // Rotate when file reaches 20MB
      };
      Logger.instance = new Logger(config || defaultConfig);
    }
    return Logger.instance;
  }

  private initializeWinston(): winston.Logger {
    const { filePath, level, consoleOutput, maxFiles, maxSize } = this.config;
    const processType = process.type || "main";
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.printf((info: TransformableInfo) => {
        const { timestamp, level, message, ...meta } = info;
        return `[${timestamp}] [${level.toUpperCase()}] [${processType}] ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ""
        }`;
      })
    );

    const transports: winston.transport[] = [];

    if (consoleOutput) {
      transports.push(
        new winston.transports.Console({
          //   format: winston.format.combine(winston.format.colorize(), logFormat),
          format: winston.format.simple(),
        })
      );
    }

    if (filePath) {
      transports.push(
        new winston.transports.DailyRotateFile({
          dirname: filePath,
          filename: `cortex-%DATE%-${processType}.log`,
          datePattern: "YYYY-MM-DD",
          maxSize: maxSize,
          maxFiles: maxFiles,
          format: logFormat,
        })
      );
    }

    return winston.createLogger({
      level,
      format: logFormat,
      transports,
    });
  }

  public debug(message: string, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }

  public info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    this.logger.error(message, ...args);
  }

  public setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger = this.initializeWinston();
  }
}
