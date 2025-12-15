// Вспомогательный класс для журналирования (с поддержской цветов для удобства просмотра в консоли)
class Logger {
  private isEnabled: boolean = import.meta.env.DEV;

  private readonly COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    RESET: '\x1b[0m'
  } as const;

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

  test(title: string, predicate: boolean): void {
    if (this.isEnabled) {
      let message = predicate ? 'да' : 'нет';
    
      if (predicate) {
        console.log(`${title}: ${this.COLORS.GREEN}${message}${this.COLORS.RESET}`);
      } else {
        console.log(`${title}: ${this.COLORS.RED}${message}${this.COLORS.RESET}`);
      }
    }
  }

  group(...args: any[]): void {
    if (this.isEnabled) {
      console.group(...args);
    }
  }

  groupEnd(): void {
    if (this.isEnabled) {
      console.groupEnd();
    }
  }
}
export const logger = new Logger();