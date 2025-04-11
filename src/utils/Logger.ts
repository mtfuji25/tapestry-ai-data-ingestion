// src/utils/Logger.ts
export class Logger {
    public static info(message: string, ...optionalParams: any[]): void {
      console.info(`[INFO] ${message}`, ...optionalParams);
    }
  
    public static warn(message: string, ...optionalParams: any[]): void {
      console.warn(`[WARN] ${message}`, ...optionalParams);
    }
  
    public static error(message: string, ...optionalParams: any[]): void {
      console.error(`[ERROR] ${message}`, ...optionalParams);
    }
  
    public static debug(message: string, ...optionalParams: any[]): void {
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[DEBUG] ${message}`, ...optionalParams);
      }
    }
  }
  