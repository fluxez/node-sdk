export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private enabled: boolean;
  private customLogger?: (level: string, message: string, data?: any) => void;
  
  constructor(
    enabled: boolean = false,
    customLogger?: (level: string, message: string, data?: any) => void
  ) {
    this.enabled = enabled;
    this.customLogger = customLogger;
  }
  
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.enabled) return;
    
    if (this.customLogger) {
      this.customLogger(level, message, data);
    } else {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
      
      switch (level) {
        case 'debug':
          console.debug(logMessage, data || '');
          break;
        case 'info':
          console.info(logMessage, data || '');
          break;
        case 'warn':
          console.warn(logMessage, data || '');
          break;
        case 'error':
          console.error(logMessage, data || '');
          break;
      }
    }
  }
  
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }
  
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }
  
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }
  
  error(message: string, data?: any): void {
    this.log('error', message, data);
  }
}