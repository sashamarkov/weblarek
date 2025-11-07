// Вспомогательный класс для журналирования и проверки работы сервера
class Logger {
  private isEnabled: boolean = import.meta.env.MODE === 'development';

  log(...args: any[]): void {
    if (this.isEnabled) {
      console.log(...args);
    }
  }

  error(...args: any[]): void {
    if (this.isEnabled) {
      console.error(...args);
    }
  }

  warn(...args: any[]): void {
    if (this.isEnabled) {
      console.warn(...args);
    }
  }

  info(...args: any[]): void {
    if (this.isEnabled) {
      console.info(...args);
    }
  }
}
export const logger = new Logger();