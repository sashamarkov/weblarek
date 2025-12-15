import { logger } from '../utils/logger';
import { ProductCollection } from '../components/models/ProductCollection';
import { ShoppingCart } from '../components/models/ShoppingCart';
import { OrderManager } from '../components/models/OrderManager';
import { testProducts, fakeAddress, fakeEmail, fakeTelephone } from './helpers/test-data';

/**
 * Unit тесты для моделей данных (перенёс из первой части)
 */
export class UnitTests {
  
  /**
   * Запуск всех unit тестов
   */
  runAllTests(): void {
    logger.group('=== UNIT ТЕСТЫ МОДЕЛЕЙ ===');
    
    this.testProductCollection();
    this.testShoppingCart();
    this.testOrderManager();
    
    logger.groupEnd();
  }
  
  /**
   * Тестирование ProductCollection
   */
  private testProductCollection(): void {
    logger.group('=== ProductCollection ===');
    const productCollection = new ProductCollection();
    
    // Тест 1: Установка и получение товаров
    productCollection.setProducts(testProducts);
    logger.log('Получение всех товаров', productCollection.getProducts());
    logger.log('Количество товаров', productCollection.getProducts().length);
    logger.test('Товары установлены', productCollection.getProducts().length === testProducts.length);
    
    // Тест 2: Получение товара по ID
    const firstProduct = testProducts[0];
    const productById = productCollection.getProductById(firstProduct.id);
    logger.log('Товар по id', productById);
    logger.test('id совпадает?', productById?.id === firstProduct.id);
    
    // Тест 3: Работа с выбранным товаром
    productCollection.setSelectedProduct(firstProduct);
    const selectedProduct = productCollection.getSelectedProduct();
    logger.log('Выбранный товар', selectedProduct);
    logger.test('Выбранный товар совпадает?', selectedProduct?.id === firstProduct.id);
    
    // Тест 4: Получение несущесвующего товара
    const nonExistentProduct = productCollection.getProductById('0');
    logger.log('Несуществующий товар', nonExistentProduct);
    logger.test('Несуществующий товар = undefined?', nonExistentProduct === undefined);
    
    logger.groupEnd();
  }
  
  /**
   * Тестирование ShoppingCart
   */
  private testShoppingCart(): void {
    logger.group('=== ShoppingCart ===');
    const shoppingCart = new ShoppingCart();
    
    // Тест 1: Начальное состояние
    logger.log('Начальное количество товаров', shoppingCart.getItemsCount());
    logger.log('Начальная сумма', shoppingCart.getTotalPrice());
    logger.test('Корзина пуста?', shoppingCart.getItems().length === 0);
    
    // Тест 2: Добавление товаров
    const product1 = testProducts[0];
    const product2 = testProducts[1];
    const product3 = testProducts[2]; // товар без цены
    
    shoppingCart.addItem(product1);
    shoppingCart.addItem(product2);
    shoppingCart.addItem(product3);
    
    logger.log('Товары после добавления', shoppingCart.getItems());
    logger.log('Количество после добавления', shoppingCart.getItemsCount());
    logger.log('Сумма после добавления', shoppingCart.getTotalPrice());
    
    // Тест 3: Проверка наличия товаров
    logger.test('Товар 1 в корзине?', shoppingCart.hasItem(product1.id));
    logger.test('Товар 2 в корзине?', shoppingCart.hasItem(product2.id));
    logger.test('Несуществующий товар отсутствует в корзине?', !shoppingCart.hasItem('0'));
    
    // Тест 4: Удаление товара
    const total = shoppingCart.getTotalPrice();
    shoppingCart.removeItem(product1.id);
    logger.log('Товары после удаления', shoppingCart.getItems());
    logger.log('Количество после удаления', shoppingCart.getItemsCount());
    logger.log('Сумма после удаления', shoppingCart.getTotalPrice());
    logger.test('Сумма соответствует?', shoppingCart.getTotalPrice() === (total - (product1.price || 0)));
    logger.test('Товар 1 удалён?', !shoppingCart.hasItem(product1.id));
    logger.test('Товар 2 остался?', shoppingCart.hasItem(product2.id));
    
    // Тест 5: Очистка корзины
    shoppingCart.clear();
    logger.log('Товары после очистки', shoppingCart.getItems());
    logger.log('Количество после очистки', shoppingCart.getItemsCount());
    logger.log('Сумма после очистки', shoppingCart.getTotalPrice());
    logger.test('Корзина пуста после очистки?', shoppingCart.getItemsCount() === 0);
    
    logger.groupEnd();
  }
  
  /**
   * Тестирование OrderManager
   */
  private testOrderManager(): void {
    logger.group('=== OrderManager ===');
    const orderManager = new OrderManager();
    const shoppingCart = new ShoppingCart();
    
    // Тест 1: Начальное состояние
    logger.log('Начальные данные', orderManager.getOrderData());
    logger.test('Payment пустой', orderManager.getOrderData().payment === '');
    logger.test('Email пустой', orderManager.getOrderData().email === '');
    
    // Тест 2: Установка данных по отдельности
    orderManager.setPayment('card');
    orderManager.setAddress(fakeAddress);
    orderManager.setEmail(fakeEmail);
    orderManager.setPhone(fakeTelephone);
    
    const filledData = orderManager.getOrderData();
    logger.log('Данные после заполнения', filledData);
    logger.test('Payment установлен?', filledData.payment === 'card');
    logger.test('Address установлен?', filledData.address === fakeAddress);
    logger.test('Email установлен?', filledData.email === fakeEmail);
    logger.test('Phone установлен?', filledData.phone === fakeTelephone);
    
    // Тест 3: Валидация корректных данных
    const validationResult = orderManager.validate();
    logger.log('Валидация корректных данных', validationResult);
    logger.test('Ошибки валидации отсутствуют?', Object.keys(validationResult).length === 0);
    
    // Тест 4: Валидация пустых данных
    const emptyOrderManager = new OrderManager();
    const emptyValidation = emptyOrderManager.validate();
    logger.log('Валидация пустых данных', emptyValidation);
    logger.test('Ошибка payment', emptyValidation.payment === 'Не выбран способ оплаты');
    logger.test('Ошибка address', emptyValidation.address === 'Укажите адрес доставки');
    logger.test('Ошибка email', emptyValidation.email === 'Укажите email');
    logger.test('Ошибка phone', emptyValidation.phone === 'Укажите телефон');
    
    // Тест 5: Валидация частично заполненных данных
    const partialOrderManager = new OrderManager();
    partialOrderManager.setAddress(fakeAddress);
    partialOrderManager.setEmail(fakeEmail);
    const partialValidation = partialOrderManager.validate();
    logger.log('Валидация частичных данных', partialValidation);
    logger.test('Ошибка payment осталась?', partialValidation.payment === 'Не выбран способ оплаты');
    logger.test('Ошибка phone осталась?', partialValidation.phone === 'Укажите телефон');
    logger.test('Нет ошибки address?', !partialValidation.address);
    logger.test('Нет ошибки email?', !partialValidation.email);
    
    // Тест 6: Очистка данных
    orderManager.clear();
    const clearedData = orderManager.getOrderData();
    logger.log('Данные после очистки', clearedData);
    logger.test('Payment очищен?', clearedData.payment === '');
    logger.test('Address очищен?', clearedData.address === '');
    logger.test('Email очищен?', clearedData.email === '');
    logger.test('Phone очищен?', clearedData.phone === '');
    
    // Тест 7: Формирование корректного запроса на сервер
    orderManager.setPayment('card');
    orderManager.setAddress(fakeAddress);
    orderManager.setEmail(fakeEmail);
    orderManager.setPhone(fakeTelephone);
    
    // Добавляем товары в корзину
    shoppingCart.addItem(testProducts[0]);
    shoppingCart.addItem(testProducts[1]);
    shoppingCart.addItem(testProducts[2]);
    
    try {
      const order = orderManager.createRequest(shoppingCart);
      logger.log('Формирование запроса на сервер: ', order);
      const cartItems = shoppingCart.getItems();
      
      logger.test('Количество товаров в корзине и запросе совпадают?', 
        shoppingCart.getItemsCount() === order.items.length);
      logger.test('Суммы в корзине и запросе совпадают?', 
        shoppingCart.getTotalPrice() === order.total);
      logger.test('В корзине и запросе одни и те же товары?', 
        cartItems[0].id === order.items[0] && cartItems[1].id === order.items[1] && cartItems[2].id === order.items[2]);
    } catch (error) {
      logger.error('Ошибка формирования запроса:', error);
    }
    
    // Тест 8: Формирование запроса при отсутствующих данных
    const testOrderManager = new OrderManager();
    testOrderManager.setPayment('card');
    
    // Не устанавливаем адрес
    try {
      testOrderManager.createRequest(shoppingCart);
      logger.test('Если не указать адрес, то запрос не сформируется?', false);
    } catch {
      logger.test('Если не указать адрес, то запрос не сформируется?', true);
    }
    
    logger.groupEnd();
  }
}