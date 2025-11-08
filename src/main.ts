import './scss/styles.scss';
import { apiProducts } from './utils/data';
import { ProductCollection } from './components/models/ProductCollection';
import { ShoppingCart } from './components/models/ShoppingCart';
import { OrderManager } from './components/models/OrderManager';
import { AppAPI } from './components/api/AppAPI';
import { Api } from './components/base/Api';
import { API_URL } from './utils/constants';
import { logger } from './utils/logger';

const fakeAddress: string = 'ул. Ленина, д. 1';
const fakeEmail: string = 'test@example.com';
const fakeTelephone: string = '+79161234567';

// Тестирование моделей данных
function testModels() {
  logger.group('=== ProductCollection ===');
  const productCollection = new ProductCollection();
    
  // Тест 1: Установка и получение товаров
  productCollection.setProducts(apiProducts.items);
  logger.log('Получение всех товаров', productCollection.getProducts());
  logger.log('Количество товаров', productCollection.getProducts().length);

  // Тест 2: Получение товара по ID
  const firstProduct = apiProducts.items[0];
  const productById = productCollection.getProductById(firstProduct.id);
  logger.log('Товар по ID', productById);
  logger.test('ID совпадает?', productById?.id === firstProduct.id);

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
  
  logger.group('=== ShoppingCart ===');
  const shoppingCart = new ShoppingCart();
    
  // Тест 1: Начальное состояние
  logger.log('Начальное количество товаров', shoppingCart.getItemsCount());
  logger.log('Начальная сумма', shoppingCart.getTotalPrice());
  logger.test('Корзина пуста?', shoppingCart.getItems().length === 0);
    
  // Тест 2: Добавление товаров
  const product1 = apiProducts.items[0];
  const product2 = apiProducts.items[1];
  const product3 = apiProducts.items[2]; // товар без цены
    
  shoppingCart.addItem(product1);
  shoppingCart.addItem(product2);
  shoppingCart.addItem(product3);
    
  logger.log('Товары после добавления', shoppingCart.getItems());
  logger.log('Количество после добавления', shoppingCart.getItemsCount());
  logger.log('Сумма после добавления', shoppingCart.getTotalPrice());
    
  // Тест 3: Проверка наличия товаров
  logger.test('Товар 1 в корзине?', shoppingCart.hasItem(product1.id));
  logger.test('Товар 2 в корзине?', shoppingCart.hasItem(product2.id));
  logger.test('Несуществующий товар отсутсвует в корзине?', !shoppingCart.hasItem('0'));
    
  // Тест 4: Удаление товара
  const total = shoppingCart.getTotalPrice();
  shoppingCart.removeItem(product1.id);
  logger.log('Товары после удаления', shoppingCart.getItems());
  logger.log('Количество после удаления', shoppingCart.getItemsCount());
  logger.log('Сумма после удаления', shoppingCart.getTotalPrice());
  logger.test('Сумма соотвествует?', shoppingCart.getTotalPrice() === (total - product1.price));
  logger.test('Товар 1 удалён?', !shoppingCart.hasItem(product1.id));
  logger.test('Товар 2 остался?', shoppingCart.hasItem(product2.id));
    
  // Тест 5: Очистка корзины
  shoppingCart.clear();
  logger.log('Товары после очистки', shoppingCart.getItems());
  logger.log('Количество после очистки', shoppingCart.getItemsCount());
  logger.log('Сумма после очистки', shoppingCart.getTotalPrice());
  logger.test('Корзина пуста после очистки?', shoppingCart.getItemsCount() === 0);
    
  logger.groupEnd();

  // Тестирование OrderManager
  logger.group('=== OrderManager ===');
  const orderManager = new OrderManager();
    
  // Тест 1: Начальное состояние
  logger.log('Начальные данные', orderManager.getOrderData());
    
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
  shoppingCart.addItem(product1);
  shoppingCart.addItem(product2);
  shoppingCart.addItem(product3);
  const order = orderManager.createRequest(shoppingCart);
  logger.log('Формирование запроса на сервер: ', order);
  const cartItems = shoppingCart.getItems();
  logger.test('Количество товаров в корзине и запросе совпадают?', shoppingCart.getItemsCount() === order.items.length);
  logger.test('Суммы в корзине и запросе совпадают?', shoppingCart.getTotalPrice() === order.total);
  logger.test('В корзине и запросе одни и те же товары?', cartItems[0].id === order.items[0] && cartItems[1].id === order.items[1] && cartItems[2].id === order.items[2]);
  
  // Тест 8: Формирование запроса на сервер при отсутсвующих данных
  orderManager.setAddress('');
  try {
    orderManager.createRequest(shoppingCart);
  } catch(error)  {
    logger.test('Если не указать адрес, то запрос не сформируется?', true);
    logger.log(error);
  }
  orderManager.setAddress(fakeAddress);
  orderManager.setEmail('');
  try {
    orderManager.createRequest(shoppingCart);
  } catch(error)  {
    logger.test('Если не указать email, то запрос не сформируется?', true);
    logger.log(error);
  }
  orderManager.setEmail(fakeEmail);
  orderManager.setPhone('');
  try {
    orderManager.createRequest(shoppingCart);
  } catch(error)  {
    logger.test('Если не указать телефон, то запрос не сформируется?', true);
    logger.log(error);
  }

  // Тест 9: Формирование запроса на сервер при пустой корзине
  try {
    shoppingCart.clear();
    orderManager.setPhone(fakeTelephone);
    orderManager.createRequest(shoppingCart);
  } catch(error)  {
    logger.test('Если корзина пуста, то запрос не сформируется?', true);
    logger.log(error);
  }
  logger.groupEnd();

  return { productCollection, shoppingCart, orderManager };
}

// Тестирование работы api
async function testAPI() {
  const api = new Api(API_URL);
  const appAPI = new AppAPI(api);

  try {
    const serverProducts = await appAPI.getProductList();
    const availableProducts = serverProducts.filter(product => product.price !== null && product.price > 0); 
    if (availableProducts.length === 0) {
      logger.error('Нет товаров для тестирования сценариев');
      return;
    }
    const productCollection = new ProductCollection();
    productCollection.setProducts(serverProducts);
    logger.log('Массив товаров с сервера: ', productCollection.getProducts());

    logger.group('=== Сценарий 1: Заказ с одним товаром ===');
    const singleProductCart = new ShoppingCart();
    singleProductCart.addItem(availableProducts[0]);
    const orderManager = new OrderManager();
    orderManager.setPayment('card');
    orderManager.setAddress(fakeAddress);
    orderManager.setEmail(fakeEmail);
    orderManager.setPhone(fakeTelephone);

    const singleOrder = orderManager.createRequest(singleProductCart);
    console.log('Одиночный заказ: ', singleOrder);
    const singleResponse = await appAPI.submitOrder(singleOrder);
    logger.test('Одиночный заказ размещён?', singleResponse !== undefined);
    logger.test('Суммы запроса и ответа совпадают?', singleOrder.total === singleResponse.total);
    logger.groupEnd();

    // Сценарий 2: Заказ с несколькими одинаковыми товарами (если доступно)
    logger.group('=== Сценарий 2: Заказ с дублированием товаров ===');
    const duplicateCart = new ShoppingCart();
    // Добавляем один товар несколько раз
    duplicateCart.addItem(availableProducts[0]);
    duplicateCart.addItem(availableProducts[0]);
    duplicateCart.addItem(availableProducts[0]);
        
    const duplicateOrder = orderManager.createRequest(duplicateCart);
    console.log(duplicateOrder);
    const duplicateResponse = await appAPI.submitOrder(duplicateOrder);
    logger.test('Заказ с дубликатами размещён?', duplicateResponse !== undefined);
    logger.test('Суммы запроса и ответа совпадают?', duplicateResponse.total === duplicateOrder.total);
    logger.groupEnd();
  } catch (error) {
    logger.error('Ошибка при работе с API:', error);
  }
}

async function main() {
  // Сначала тестируем модели с локальными данными
  testModels();
  
  // Затем тестируем работу с API
  await testAPI();
}

// Запускаем приложение
main();