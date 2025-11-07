import './scss/styles.scss';
import { apiProducts } from './utils/data';
import { ProductCollection } from './components/models/ProductCollection';
import { ShoppingCart } from './components/models/ShoppingCart';
import { OrderManager } from './components/models/OrderManager';
import { AppAPI } from './components/api/AppAPI';
import { Api } from './components/base/Api';
import { API_URL } from './utils/constants';
import { logger } from './utils/logger';

// Тестирование моделей данных
function testModels() {
  const productCollection = new ProductCollection();
  const shoppingCart = new ShoppingCart();
  const orderManager = new OrderManager();

  // Тестирование с локальными данными
  productCollection.setProducts(apiProducts.items);
  shoppingCart.addItem(apiProducts.items[0]);
  return { productCollection, shoppingCart, orderManager };
}

// Тестирование работы api
async function testAPI() {
  const api = new Api(API_URL);
  const appAPI = new AppAPI(api);

  try {
    const serverProducts = await appAPI.getProductList();
    const productCollection = new ProductCollection();
    productCollection.setProducts(serverProducts);
    logger.log('Массив товаров с сервера: ', productCollection.getProducts());
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