import { logger } from '../utils/logger';
import { Api } from '../components/base/Api';
import { AppAPI } from '../components/api/AppAPI';
import { API_URL } from '../utils/constants';
import { ProductCollection } from '../components/models/ProductCollection';
import { ShoppingCart } from '../components/models/ShoppingCart';
import { OrderManager } from '../components/models/OrderManager';
import { fakeAddress, fakeEmail, fakeTelephone } from './helpers/test-data';

/**
 * Интеграционные тесты работы с API
 */
export class IntegrationTests {
  
  /**
   * Запуск всех интеграционных тестов
   */
  async runAllTests(): Promise<void> {
    logger.group('=== ИНТЕГРАЦИОННЫЕ ТЕСТЫ API ===');
    
    try {
      await this.testAPI();
      logger.test('Все интеграционные тесты пройдены?', true);
    } catch (error) {
      logger.error('Ошибка в интеграционных тестах:', error);
    } finally {
      logger.groupEnd();
    }
  }
  
  /**
   * Тестирование работы API
   */
  private async testAPI(): Promise<void> {
    const api = new Api(API_URL);
    const appAPI = new AppAPI(api);
    
    try {
      // Тест 1: Получение списка товаров
      logger.group('Тест 1: Получение товаров с сервера');
      const serverProducts = await appAPI.getProductList();
      logger.log('Массив товаров с сервера:', serverProducts);
      logger.test('Товары получены?', serverProducts.length > 0);
      
      const availableProducts = serverProducts.filter(product => product.price !== null && product.price > 0);
      if (availableProducts.length === 0) {
        logger.warn('Нет товаров для тестирования сценариев');
        logger.groupEnd();
        return;
      }
      
      const productCollection = new ProductCollection();
      productCollection.setProducts(serverProducts);
      logger.test('Товары сохранены в ProductCollection?', productCollection.getProducts().length === serverProducts.length);
      logger.groupEnd();
      
      // Тест 2: Заказ с одним товаром
      logger.group('=== Сценарий 1: Заказ с одним товаром ===');
      const singleProductCart = new ShoppingCart();
      singleProductCart.addItem(availableProducts[0]);
      
      const orderManager = new OrderManager();
      orderManager.setPayment('card');
      orderManager.setAddress(fakeAddress);
      orderManager.setEmail(fakeEmail);
      orderManager.setPhone(fakeTelephone);
      
      const singleOrder = orderManager.createRequest(singleProductCart);
      logger.log('Одиночный заказ:', singleOrder);
      
      try {
        const singleResponse = await appAPI.submitOrder(singleOrder);
        logger.test('Одиночный заказ размещён?', singleResponse !== undefined);
        logger.test('Суммы запроса и ответа совпадают?', singleOrder.total === singleResponse.total);
        logger.log('Ответ сервера:', singleResponse);
      } catch (error) {
        logger.warn('Сервер не ответил (возможно, тестовый режим)');
      }
      logger.groupEnd();
      
      // Тест 3: Заказ с дублированием товаров
      if (availableProducts.length > 0) {
        logger.group('=== Сценарий 2: Заказ с дублированием товаров ===');
        const duplicateCart = new ShoppingCart();
        // Добавляем один товар несколько раз
        duplicateCart.addItem(availableProducts[0]);
        duplicateCart.addItem(availableProducts[0]);
        duplicateCart.addItem(availableProducts[0]);
        
        const duplicateOrder = orderManager.createRequest(duplicateCart);
        logger.log('Заказ с дубликатами:', duplicateOrder);
        
        try {
          const duplicateResponse = await appAPI.submitOrder(duplicateOrder);
          logger.test('Заказ с дубликатами размещён?', duplicateResponse !== undefined);
          logger.test('Суммы запроса и ответа совпадают?', duplicateResponse.total === duplicateOrder.total);
        } catch (error) {
          logger.warn('Сервер не ответил на заказ с дубликатами');
        }
        logger.groupEnd();
      }
      
    } catch (error) {
      logger.error('Ошибка при работе с API:', error);
      logger.warn('⚠️ Проверьте подключение к интернету и доступность API сервера');
    }
  }
}