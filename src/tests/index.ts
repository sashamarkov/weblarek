import { runE2ETests } from './e2e.test';
import { UnitTests } from './unit.test';
import { IntegrationTests } from './integration.test';
import { logger } from '../utils/logger';

/**
 * Типы тестов которые можно запустить
 */
export enum TestType {
  UNIT = 'unit',           // Тесты моделей
  INTEGRATION = 'integration', // Тесты API
  E2E = 'e2e',            // End-to-end тесты
  ALL = 'all'             // Все тесты
}

/**
 * Менеджер тестирования
 */
export class TestManager {
  private unitTests: UnitTests;
  private integrationTests: IntegrationTests;
  
  constructor() {
    this.unitTests = new UnitTests();
    this.integrationTests = new IntegrationTests();
  }
  
  /**
   * Запуск тестов по типу
   */
  async runTests(type: TestType = TestType.ALL): Promise<void> {
    logger.group('ЗАПУСК ТЕСТОВ ==============');
    logger.log(`Режим: ${type}`);
    
    const startTime = Date.now();
    
    try {
      switch (type) {
        case TestType.UNIT:
          await this.runUnitTests();
          break;
          
        case TestType.INTEGRATION:
          await this.runIntegrationTests();
          break;
          
        case TestType.E2E:
          await this.runE2ETests();
          break;
          
        case TestType.ALL:
          await this.runAllTests();
          break;
      }
      
      const duration = Date.now() - startTime;
      logger.log(`Время выполнения: ${duration}ms`);
      logger.test('Все тесты завершены', true);
      
    } catch (error) {
      logger.error('Ошибка при выполнении тестов:', error);
    } finally {
      logger.groupEnd();
    }
  }
  
  /**
   * Запуск unit тестов
   */
  private async runUnitTests(): Promise<void> {
    logger.group('UNIT ТЕСТЫ');
    this.unitTests.runAllTests();
    logger.groupEnd();
  }
  
  /**
   * Запуск интеграционных тестов
   */
  private async runIntegrationTests(): Promise<void> {
    logger.group('ИНТЕГРАЦИОННЫЕ ТЕСТЫ');
    await this.integrationTests.runAllTests();
    logger.groupEnd();
  }
  
  /**
   * Запуск E2E тестов
   */
  private async runE2ETests(): Promise<void> {
    logger.group('E2E ТЕСТЫ');
    runE2ETests();
    logger.groupEnd();
  }
  
  /**
   * Запуск всех тестов
   */
  private async runAllTests(): Promise<void> {
    // Unit тесты (синхронные)
    await this.runUnitTests();
    
    // Интеграционные тесты (требуют API)
    await this.runIntegrationTests();
    
    // E2E тесты (требуют загруженную страницу)
    // Ждём загрузки DOM
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    // Даём время приложению загрузиться
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await this.runE2ETests();
  }
}

/**
 * Основная функция запуска тестов
 */
export function runTests(testType?: TestType): void {
  console.log('Запуск тестов приложения...');
  
  // Определяем тип тестов из URL параметров
  const urlParams = new URLSearchParams(window.location.search);

  const urlTestType = urlParams.get('test') as TestType;
  
  // Приоритет: URL параметр > аргумент функции > дефолт
  const typeToRun = urlTestType || testType || TestType.ALL;
  
  const testManager = new TestManager();
  testManager.runTests(typeToRun);
}

// Делаем функции доступными глобально для ручного запуска
declare global {
  interface Window {
    runTests: typeof runTests;
    TestType: typeof TestType;
  }
}

// Экспортируем в глобальную область видимости
if (typeof window !== 'undefined') {
  window.runTests = runTests;
  window.TestType = TestType;
  
  console.log('Тестовые функции доступны:');
  console.log('- window.runTests(TestType.UNIT) - запуск unit тестов');
  console.log('- window.runTests(TestType.INTEGRATION) - запуск интеграционных тестов');
  console.log('- window.runTests(TestType.E2E) - запуск E2E тестов');
  console.log('- window.runTests(TestType.ALL) - запуск всех тестов');
  console.log('Или используйте url для авто-запуска:');
  console.log('- http://localhost:5173/?test=unit - запуск unit тестов');
  console.log('- http://localhost:5173/?test=integration - запуск интеграционных тестов');
  console.log('- http://localhost:5173/?test=e2e - запуск E2E тестов');
  console.log('- http://localhost:5173/?test=all - запуск всех тестов');
}

// Автозапуск тестов по URL параметру
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('test')) {
    // Ждём полной загрузки страницы для E2E тестов
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => runTests(), 1000); // Даём время на загрузку приложения
      });
    } else {
      setTimeout(() => runTests(), 1000);
    }
  }
}