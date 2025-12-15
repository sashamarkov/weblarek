import './scss/styles.scss';

import { EventEmitter } from './components/base/Events';
import { Api } from './components/base/Api';
import { AppAPI } from './components/api/AppAPI';
import { API_URL } from './utils/constants';

import { ProductCollection } from './components/models/ProductCollection';
import { ShoppingCart } from './components/models/ShoppingCart';
import { OrderManager } from './components/models/OrderManager';

import { 
  Page, 
  Header, 
  Modal, 
  createCatalogCard,
  createPreviewCard,
  createBasketCard,
  createBasketView,
  createOrderForm,
  createContactsForm,
  createSuccessView
} from './components/view';

import { Product } from './types';
import { ensureElement } from './utils/utils';

import { runTests } from './tests';


// Типы для событий
type CardSelectEvent = { id: string };
type CardActionEvent = { id: string };
type BasketRemoveEvent = { id: string };
type PaymentChangeEvent = { payment: string };
type AddressChangeEvent = { address: string };
type EmailChangeEvent = { email: string };
type PhoneChangeEvent = { phone: string };
type OrderSubmitEvent = { payment: string, address: string };
type ContactsSubmitEvent = { email: string, phone: string };

// Инициализация приложения
class App {
  private events: EventEmitter;
  private api: Api;
  private appApi: AppAPI;
  
  private productCollection: ProductCollection;
  private shoppingCart: ShoppingCart;
  private orderManager: OrderManager;
  
  private page: Page;
  private header: Header;
  private modal: Modal;
  
  constructor() {
    // 1. Инициализация событий и API
    this.events = new EventEmitter();
    this.api = new Api(API_URL);
    this.appApi = new AppAPI(this.api);
    
    // 2. Инициализация моделей
    this.productCollection = new ProductCollection();
    this.shoppingCart = new ShoppingCart();
    this.orderManager = new OrderManager();
    
    // 3. Инициализация представлений
    this.page = new Page(ensureElement<HTMLElement>('.page__wrapper'));
    this.header = new Header(ensureElement<HTMLElement>('.header'), this.events);
    this.modal = new Modal(ensureElement<HTMLElement>('#modal-container'));
    
    // 4. Настройка обработчиков событий
    this.setupEventListeners();
    
    // 5. Загрузка товаров с сервера
    this.loadProducts();
  }
  
  /**
   * Настройка всех обработчиков событий
   */
  private setupEventListeners(): void {
    // События от моделей
    this.productCollection.on('products:changed', this.renderCatalog.bind(this));
    this.productCollection.on('product:selected', this.showProductModal.bind(this));
    this.shoppingCart.on('basket:changed', this.updateBasket.bind(this));
    this.orderManager.on('order:changed', this.updateOrderForm.bind(this));
    
    // События от представлений с явной типизацией
    this.events.on<CardSelectEvent>('card:select', this.handleCardSelect.bind(this));
    this.events.on<CardActionEvent>('card:add', this.handleCardAdd.bind(this));
    this.events.on<CardActionEvent>('card:remove', this.handleCardRemove.bind(this));
    this.events.on<BasketRemoveEvent>('basket:remove', this.handleBasketRemove.bind(this));
    
    this.events.on('header:basket', this.openBasket.bind(this));
    this.events.on('basket:order', this.openOrderForm.bind(this));
    
    this.events.on<OrderSubmitEvent>('order:submit', this.handleOrderSubmit.bind(this));
    this.events.on<ContactsSubmitEvent>('contacts:submit', this.handleContactsSubmit.bind(this));
    
    this.events.on<PaymentChangeEvent>('order.payment:change', this.handlePaymentChange.bind(this));
    this.events.on<AddressChangeEvent>('order.address:change', this.handleAddressChange.bind(this));
    this.events.on<EmailChangeEvent>('contacts.email:change', this.handleEmailChange.bind(this));
    this.events.on<PhoneChangeEvent>('contacts.phone:change', this.handlePhoneChange.bind(this));
    
    this.events.on('success:close', this.closeModal.bind(this));
  }
  
  /**
   * Загрузка товаров с сервера
   */
  private async loadProducts(): Promise<void> {
    try {
      const products = await this.appApi.getProductList();
      this.productCollection.setProducts(products);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    }
  }
  
  /**
   * Рендер каталога товаров
   */
  private renderCatalog(): void {
    const products = this.productCollection.getProducts();
    const cards = products.map(product => 
      createCatalogCard(product, this.events).render()
    );
    this.page.catalog = cards;
  }
  
  /**
   * Открытие модального окна с товаром
   */
  private showProductModal(data: { product: Product }): void {
    const product = data.product;
    const isInBasket = this.shoppingCart.hasItem(product.id);
    const card = createPreviewCard(product, this.events);
    
    card.inBasket = isInBasket;
    
    // Если цена null, блокируем кнопку
    if (product.price === null) {
      card.button = { label: 'Недоступно', disabled: true };
    }
    
    this.modal.open(card.render());
  }
  
  /**
   * Обновление корзины и счетчика
   */
  private updateBasket(): void {
    // Обновляем счетчик в шапке
    this.header.counter = this.shoppingCart.getItemsCount();
    
    // Обновляем корзину в модальном окне (если открыта)
    const modalContent = (this.modal as any)._content;
    if (modalContent?.querySelector('.basket')) {
      this.updateBasketModal();
    }
  }

  /**
   * Обновление модального окна корзины
   */
  private updateBasketModal(): void {
    const basketView = createBasketView(this.events);
    const items = this.shoppingCart.getItems();
    
    if (items.length === 0) {
      basketView.items = [];
      basketView.total = 0;
      basketView.button = false;
    } else {
      const basketCards = items.map((item, index) => {
        const card = createBasketCard(item, this.events);
        card.index = index + 1;
        return card.render();
      });
      
      basketView.items = basketCards;
      basketView.total = this.shoppingCart.getTotalPrice();
      basketView.button = true;
    }
    
    // Обновляем содержимое модального окна
    (this.modal as any)._content.replaceChildren(basketView.render());
  }
  
  /**
   * Обработчик выбора карточки
   */
  private handleCardSelect(data: CardSelectEvent): void {
    const product = this.productCollection.getProductById(data.id);
    if (product) {
      this.productCollection.setSelectedProduct(product);
    }
  }
  
  /**
   * Обработчик добавления товара в корзину
   */
  private handleCardAdd(data: CardActionEvent): void {
    const product = this.productCollection.getProductById(data.id);
    if (product) {
      this.shoppingCart.addItem(product);
      this.modal.close();
    }
  }
  
  /**
   * Обработчик удаления товара из корзины (из модального окна товара)
   */
  private handleCardRemove(data: CardActionEvent): void {
    this.shoppingCart.removeItem(data.id);
    this.modal.close();
  }
  
  /**
   * Обработчик удаления товара из корзины, но из самой корзины
   */
  private handleBasketRemove(data: BasketRemoveEvent): void {
    this.shoppingCart.removeItem(data.id);
  }
  
  /**
   * Открытие корзины
   */
  private openBasket(): void {
    const basketView = createBasketView(this.events);
    const items = this.shoppingCart.getItems();
    
    if (items.length === 0) {
      basketView.items = [];
      basketView.total = 0;
      basketView.button = false;
    } else {
      const basketCards = items.map((item, index) => {
        const card = createBasketCard(item, this.events);
        card.index = index + 1;
        return card.render();
      });
      
      basketView.items = basketCards;
      basketView.total = this.shoppingCart.getTotalPrice();
      basketView.button = true;
    }
    
    this.modal.open(basketView.render());
  }
  
  /**
   * Открытие формы оформления заказа
   */
  private openOrderForm(): void {
    const orderForm = createOrderForm(this.events);
    
    // Восстанавливаем данные из OrderManager
    const orderData = this.orderManager.getOrderData();
    if (orderData.payment) {
      orderForm.payment = orderData.payment;
    }
    if (orderData.address) {
      orderForm.address = orderData.address;
    }
    
    // Проверяем валидность формы
    this.updateOrderFormValidation();
    
    this.modal.open(orderForm.render());
  }
  
  /**
   * Обработчик отправки формы заказа
   */
  private handleOrderSubmit(data: OrderSubmitEvent): void {
    this.openContactsForm(data);
  }
  
  /**
   * Открытие формы контактов
   */
  private openContactsForm(data?: OrderSubmitEvent): void {
    if (data) {
      this.orderManager.setPayment(data.payment as 'card' | 'cash');
      this.orderManager.setAddress(data.address);
    }
    
    const contactsForm = createContactsForm(this.events);
    
    // Восстанавливаем данные из OrderManager
    const orderData = this.orderManager.getOrderData();
    if (orderData.email) {
      contactsForm.email = orderData.email;
    }
    if (orderData.phone) {
      contactsForm.phone = orderData.phone;
    }
    
    // Проверяем валидность формы
    this.updateContactsFormValidation();
    
    this.modal.open(contactsForm.render());
  }
  
  /**
   * Обработчик отправки формы контактов
   */
  private handleContactsSubmit(data: ContactsSubmitEvent): void {
    this.submitOrder(data);
  }
  
  /**
   * Обновление данных формы заказа
   */
  private updateOrderForm(): void {
    // Только обновляем валидацию, не переоткрываем форму!!!
    this.updateOrderFormValidation();
  }
  
  /**
   * Проверка валидности формы заказа
   */
  private updateOrderFormValidation(): void {
    const errors = this.orderManager.validate();
    const modalContent = (this.modal as any)._content;
    const orderForm = modalContent?.querySelector('.form[name="order"]');
    
    if (orderForm) {
      const errorMessages = [];
      if (errors.payment) errorMessages.push(errors.payment);
      if (errors.address) errorMessages.push(errors.address);
      
      const errorText = errorMessages.length > 0 ? errorMessages.join(', ') : '';
      
      const errorElement = orderForm.querySelector('.form__errors');
      const submitButton = orderForm.querySelector('button[type="submit"]');
      
      if (errorElement) {
        errorElement.textContent = errorText;
      }
      
      if (submitButton) {
        submitButton.disabled = errorMessages.length > 0;
      }
    }
  }
  
  /**
   * Обновление данных формы контактов
   */
  private updateContactsForm(): void {
    // Только обновляем валидацию, не переоткрываем форму!!!
    this.updateContactsFormValidation();
  }
  
  /**
   * Проверка валидности формы контактов
   */
  private updateContactsFormValidation(): void {
    const errors = this.orderManager.validate();
    const modalContent = (this.modal as any)._content;
    const contactsForm = modalContent?.querySelector('.form[name="contacts"]');
    
    if (contactsForm) {
      const errorMessages = [];
      if (errors.email) errorMessages.push(errors.email);
      if (errors.phone) errorMessages.push(errors.phone);
      
      const errorText = errorMessages.length > 0 ? errorMessages.join(', ') : '';
      
      const errorElement = contactsForm.querySelector('.form__errors');
      const submitButton = contactsForm.querySelector('button[type="submit"]');
      
      if (errorElement) {
        errorElement.textContent = errorText;
      }
      
      if (submitButton) {
        submitButton.disabled = errorMessages.length > 0;
      }
    }
  }
  
  /**
   * Обработчики изменения полей форм
   */
  private handlePaymentChange(data: PaymentChangeEvent): void {
    this.orderManager.setPayment(data.payment as 'card' | 'cash');
    this.updateOrderFormValidation();
  }
  
  private handleAddressChange(data: AddressChangeEvent): void {
    this.orderManager.setAddress(data.address);
    this.updateOrderFormValidation();
  }
  
  private handleEmailChange(data: EmailChangeEvent): void {
    this.orderManager.setEmail(data.email);
    this.updateContactsFormValidation();
  }
  
  private handlePhoneChange(data: PhoneChangeEvent): void {
    this.orderManager.setPhone(data.phone);
    this.updateContactsFormValidation();
  }
  
  /**
   * Отправка заказа
   */
  private async submitOrder(data?: ContactsSubmitEvent): Promise<void> {
    if (data) {
      this.orderManager.setEmail(data.email);
      this.orderManager.setPhone(data.phone);
    }
    
    try {
      // Формируем запрос
      const orderRequest = this.orderManager.createRequest(this.shoppingCart);
      
      // Отправляем на сервер
      const response = await this.appApi.submitOrder(orderRequest);
      
      // Показываем сообщение об успехе
      const successView = createSuccessView(this.events);
      successView.total = response.total;
      
      // Очищаем корзину и данные заказа
      this.shoppingCart.clear();
      this.orderManager.clear();
      
      this.modal.open(successView.render());
      
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      // Для отображения ошибки
      const errorMessage = document.createElement('div');
      errorMessage.textContent = 'Ошибка оформления заказа. Попробуйте еще раз.';
      errorMessage.classList.add('error-message');
      
      const modalContent = (this.modal as any)._content;
      if (modalContent) {
        modalContent.appendChild(errorMessage);
      }
    }
  }
  
  /**
   * Закрытие модального окна
   */
  private closeModal(): void {
    this.modal.close();
  }
}

// Запуск приложения
new App();


//
 if (import.meta.env.DEV) {
   (window as any).runAppTests = runTests;
 }
//