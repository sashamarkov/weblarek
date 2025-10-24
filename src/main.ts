import './scss/styles.scss';

import { apiProducts } from './utils/data';
import { ProductCollection } from './components/models/ProductCollection';
import { ShoppingCart } from './components/models/ShoppingCart';
import { OrderManager } from './components/models/OrderManager';

function testModels() {
  console.log('=== Тестирование моделей данных ===');

  // Тестирование ProductCollection
  const productCollection = new ProductCollection();
  productCollection.setProducts(apiProducts.items);
  
  console.log('Массив товаров из каталога:', productCollection.getProducts());
  console.log('Количество товаров в каталоге:', productCollection.getProducts().length);
  
  const firstProduct = productCollection.getProducts()[0];
  if (firstProduct) {
    productCollection.setSelectedProduct(firstProduct);
    console.log('Выбранный товар:', productCollection.getSelectedProduct());
    
    const productById = productCollection.getProductById(firstProduct.id);
    console.log('Товар по ID:', productById);
  }

  // Тестирование ShoppingCart
  const shoppingCart = new ShoppingCart();
  console.log('Корзина пуста:', shoppingCart.getItemsCount() === 0);
  
  shoppingCart.addItem(apiProducts.items[0]);
  shoppingCart.addItem(apiProducts.items[1]);
  console.log('Товары в корзине:', shoppingCart.getItems());
  console.log('Количество товаров в корзине:', shoppingCart.getItemsCount());
  console.log('Общая стоимость корзины:', shoppingCart.getTotalPrice());
  console.log('Товар с ID в корзине:', shoppingCart.hasItem(apiProducts.items[0].id));
  
  shoppingCart.removeItem(apiProducts.items[0].id);
  console.log('После удаления товара:', shoppingCart.getItems());
  
  shoppingCart.clear();
  console.log('После очистки корзины:', shoppingCart.getItems());

  // Тестирование OrderManager
  const orderManager = new OrderManager();
  console.log('Начальные данные заказа:', orderManager.getOrderData());
  
  orderManager.setPayment('card');
  orderManager.setAddress('ул. Примерная, д. 1');
  orderManager.setEmail('test@example.com');
  orderManager.setPhone('+79991234567');
  
  console.log('Данные после заполнения:', orderManager.getOrderData());
  console.log('Валидация корректных данных:', orderManager.validate());
  
  // Тестирование валидации с ошибками
  const emptyOrderManager = new OrderManager();
  console.log('Валидация пустых данных:', emptyOrderManager.validate());
  
  emptyOrderManager.setAddress('ул. Примерная, д. 1');
  console.log('Валидация с частично заполненными данными:', emptyOrderManager.validate());
}

// Запуск тестов
testModels();