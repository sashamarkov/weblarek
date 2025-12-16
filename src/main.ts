//#region Импорты
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
  PreviewCard,
  BasketView,
  OrderForm,
  ContactsForm,
  SuccessView,
  CatalogCard, 
  BasketCard,
} from './components/view';

import { Product, OrderRequest, ValidationErrors} from './types';
import { ensureElement, cloneTemplate } from './utils/utils';
//#endregion

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

/**
 * Фабрика для создания представлений
*/
class ViewFactory {
  private previewCardInstance: PreviewCard | null = null;
  private basketViewInstance: BasketView | null = null;
  private orderFormInstance: OrderForm | null = null;
  private contactsFormInstance: ContactsForm | null = null;
  private successViewInstance: SuccessView | null = null;
  private pageInstance: Page | null = null;
  private headerInstance: Header | null = null;
  private modalInstance: Modal | null = null;

  constructor(private events: EventEmitter) {}

  /**
   * Создаёт или возвращает существующий экземпляр PreviewCard
   */
  getPreviewCard(): PreviewCard {
    if (!this.previewCardInstance) {
      const template = cloneTemplate<HTMLElement>('#card-preview');
      this.previewCardInstance = new PreviewCard(template, this.events);
    }
    return this.previewCardInstance;
  }

  /**
   * Создаёт или возвращает существующий экземпляр BasketView
   */
  getBasketView(): BasketView {
    if (!this.basketViewInstance) {
      const template = cloneTemplate<HTMLElement>('#basket');
      this.basketViewInstance = new BasketView(template, this.events);
    }
    return this.basketViewInstance;
  }

  /**
   * Создаёт или возвращает существующий экземпляр OrderForm
   */
  getOrderForm(): OrderForm {
    if (!this.orderFormInstance) {
      const template = cloneTemplate<HTMLElement>('#order');
      this.orderFormInstance = new OrderForm(template, this.events);
    }
    return this.orderFormInstance;
  }

  /**
   * Создаёт или возвращает существующий экземпляр ContactsForm
   */
  getContactsForm(): ContactsForm {
    if (!this.contactsFormInstance) {
      const template = cloneTemplate<HTMLElement>('#contacts');
      this.contactsFormInstance = new ContactsForm(template, this.events);
    }
    return this.contactsFormInstance;
  }

  /**
  * Создаёт или возвращает существующий экземпляр SuccessView
  */
  getSuccessView(): SuccessView {
    if (!this.successViewInstance) {
      const template = cloneTemplate<HTMLElement>('#success');
      this.successViewInstance = new SuccessView(template, this.events);
    }
    return this.successViewInstance;
  }

  /**
  * Создаёт или возвращает существующий экземпляр Page
  */
  getPage(): Page {
    if(!this.pageInstance) {
      this.pageInstance = new Page(ensureElement<HTMLElement>('.page__wrapper'));
    }
    return this.pageInstance;
  }

  /**
  * Создаёт или возвращает существующий экземпляр Header
  */
  getHeader(): Header {
    if(!this.headerInstance) {
      this.headerInstance = new Header(ensureElement<HTMLElement>('.header'), events);
    }
    return this.headerInstance;
  }

  /**
  * Создаёт или возвращает существующий экземпляр Modal
  */
  getModal() : Modal {
    if(!this.modalInstance) {
      this.modalInstance = new Modal(ensureElement<HTMLElement>('#modal-container'));
    }
    return this.modalInstance;
  }

  /**
  * Создаёт экземпляр CatalogCard
  */
  getCatalogCard(product: Product): CatalogCard {
      const template = cloneTemplate<HTMLElement>('#card-catalog');
      const card = new CatalogCard(template, this.events);
      
      card.id = product.id;
      card.title = product.title;
      card.image = product.image;
      card.price = product.price;
      card.category = product.category;
      
      return card;
  }

  /**
  * Создаёт экземпляр BasketCard
  */
  public getBasketCard(product: Product): BasketCard {
      const template = cloneTemplate<HTMLElement>('#card-basket');
      const card = new BasketCard(template, this.events);
      
      card.id = product.id;
      card.title = product.title;
      card.price = product.price;
      
      return card;
  }

  /**
   * Сбрасывает все экземпляры представлений (для тестирования)
   */
  protected reset(): void {
    this.previewCardInstance = null;
    this.basketViewInstance = null;
    this.orderFormInstance = null;
    this.contactsFormInstance = null;
    this.successViewInstance = null;
    this.modalInstance = null;
    this.headerInstance = null;
    this.pageInstance = null;
  }
}

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
  
  // Экземпляры представлений
  private previewCard: PreviewCard;
  private basketView: BasketView;
  private orderForm: OrderForm;
  private contactsForm: ContactsForm;
  private successView: SuccessView;

  private viewFactory: ViewFactory;
  
  private currentForm: 'order' | 'contacts' | 'basket' | 'product' | null = null;

  constructor(
    events: EventEmitter,
    api: Api,
    appApi: AppAPI,
    productCollection: ProductCollection,
    shoppingCart: ShoppingCart,
    orderManager: OrderManager,
    viewFactory: ViewFactory
  ) {
    this.events = events;
    this.api = api;
    this.appApi = appApi;
    this.productCollection = productCollection;
    this.shoppingCart = shoppingCart;
    this.orderManager = orderManager;
    
    // Создаём экземпляры представлений один раз в конструктуре
    // Плюс фабрика это гарантирует
    this.page = viewFactory.getPage();
    this.header = viewFactory.getHeader();
    this.modal = viewFactory.getModal();
    this.previewCard = viewFactory.getPreviewCard();
    this.basketView = viewFactory.getBasketView();
    this.orderForm = viewFactory.getOrderForm();
    this.contactsForm = viewFactory.getContactsForm();
    this.successView = viewFactory.getSuccessView();
    
    this.viewFactory = viewFactory;

    // Настройка обработчиков событий
    this.setupEventListeners();
    
    // Загрузка товаров с сервера
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
    this.orderManager.on('order:changed', this.updateForms.bind(this));
    
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
      this.viewFactory.getCatalogCard(product).render()
    );
    this.page.catalog = cards;
  }
  
  /**
   * Открытие модального окна с товаром
   */
  private showProductModal(data: { product: Product }): void {
    const product = data.product;
    const isInBasket = this.shoppingCart.hasItem(product.id);
    
    // Обновляем данные карточки
    this.previewCard.id = product.id; // Устанавливаем id здесь
    this.previewCard.title = product.title;
    this.previewCard.image = product.image;
    this.previewCard.price = product.price;
    this.previewCard.category = product.category;
    this.previewCard.description = product.description;
    this.previewCard.inBasket = isInBasket;
    
    // Если цена null, блокируем кнопку
    if (product.price === null) {
        this.previewCard.button = { label: 'Недоступно', disabled: true };
    } else {
        this.previewCard.button = { 
            label: isInBasket ? 'Удалить из корзины' : 'В корзину', 
            disabled: false 
        };
    }
    
    this.currentForm = 'product';
    this.modal.open(this.previewCard.render());
  }
  
  /**
   * Обновление корзины и счетчика
   */
  private updateBasket(): void {
    // Обновляем счетчик в шапке
    this.header.counter = this.shoppingCart.getItemsCount();
    
    // Обновляем корзину (если она открыта)
    if (this.currentForm === 'basket') {
      this.updateBasketContent();
    }
  }
  
  /**
   * Обновление содержимого корзины
   */
  private updateBasketContent(): void {
    const items = this.shoppingCart.getItems();
    
    if (items.length === 0) {
      this.basketView.items = [];
      this.basketView.total = 0;
      this.basketView.button = false;
    } else {
      const basketCards = items.map((item, index) => {
        const card = viewFactory.getBasketCard(item);
        card.index = index + 1;
        return card.render();
      });
      
      this.basketView.items = basketCards;
      this.basketView.total = this.shoppingCart.getTotalPrice();
      this.basketView.button = true;
    }
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
      this.currentForm = null;
    }
  }
  
  /**
   * Обработчик удаления товара из корзины (из модального окна товара)
   */
  private handleCardRemove(data: CardActionEvent): void {
    this.shoppingCart.removeItem(data.id);
    this.modal.close();
    this.currentForm = null;
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
    this.updateBasketContent();
    this.currentForm = 'basket';
    this.modal.open(this.basketView.render());
  }
  
  /**
   * Открытие формы оформления заказа
   */
  private openOrderForm(): void {
    // Восстанавливаем данные из OrderManager
    const orderData = this.orderManager.getOrderData();
    if (orderData.payment) {
      this.orderForm.payment = orderData.payment;
    }
    if (orderData.address) {
      this.orderForm.address = orderData.address;
    }
    
    // Обновляем валидацию
    this.updateOrderFormValidation();
    
    this.currentForm = 'order';
    this.modal.open(this.orderForm.render());
  }
  
  /**
   * Обработчик отправки формы заказа
   */
  private handleOrderSubmit(data: OrderSubmitEvent): void {
    this.orderManager.setPayment(data.payment as 'card' | 'cash');
    this.orderManager.setAddress(data.address);
    this.openContactsForm();
  }
  
  /**
   * Открытие формы контактов
   */
  private openContactsForm(): void {
    // Восстанавливаем данные из OrderManager
    const orderData = this.orderManager.getOrderData();
    if (orderData.email) {
      this.contactsForm.email = orderData.email;
    }
    if (orderData.phone) {
      this.contactsForm.phone = orderData.phone;
    }
    
    // Обновляем валидацию
    this.updateContactsFormValidation();
    
    this.currentForm = 'contacts';
    this.modal.open(this.contactsForm.render());
  }
  
  /**
   * Обработчик отправки формы контактов
   */
  private handleContactsSubmit(data: ContactsSubmitEvent): void {
    this.orderManager.setEmail(data.email);
    this.orderManager.setPhone(data.phone);
    this.submitOrder();
  }
  
  /**
   * Обновление валидации форм
   */
  private updateForms(): void {
    if (this.currentForm === 'order') {
      this.updateOrderFormValidation();
    } else if (this.currentForm === 'contacts') {
      this.updateContactsFormValidation();
    }
  }
  
  /**
   * Проверка валидности формы заказа
   */
  private updateOrderFormValidation(): void {
    const errors = this.orderManager.validate();
    
    const errorMessages = [];
    if (errors.payment) errorMessages.push(errors.payment);
    if (errors.address) errorMessages.push(errors.address);
    
    const errorText = errorMessages.length > 0 ? errorMessages.join(', ') : '';
    const isValid = errorMessages.length === 0;
    
    // Передаём ошибки и состояние валидности в представление
    this.orderForm.errors = errorText;
    this.orderForm.valid = isValid;
  }
  
  /**
   * Проверка валидности формы контактов
   */
  private updateContactsFormValidation(): void {
    const errors = this.orderManager.validate();
    
    const errorMessages = [];
    if (errors.email) errorMessages.push(errors.email);
    if (errors.phone) errorMessages.push(errors.phone);
    
    const errorText = errorMessages.length > 0 ? errorMessages.join(', ') : '';
    const isValid = errorMessages.length === 0;
    
    // Передаём ошибки и состояние валидности в представление
    this.contactsForm.errors = errorText;
    this.contactsForm.valid = isValid;
  }
  
  //#region Обработчики изменения полей форм
  private handlePaymentChange(data: PaymentChangeEvent): void {
    this.orderManager.setPayment(data.payment as 'card' | 'cash');
  }
  
  private handleAddressChange(data: AddressChangeEvent): void {
    this.orderManager.setAddress(data.address);
  }
  
  private handleEmailChange(data: EmailChangeEvent): void {
    this.orderManager.setEmail(data.email);
  }
  
  private handlePhoneChange(data: PhoneChangeEvent): void {
    this.orderManager.setPhone(data.phone);
  }
  //#endregion 
  
  /**
   * Отправка заказа
   */
  private async submitOrder(): Promise<void> {
    try {
      const errors = this.orderManager.validate();
      if (Object.keys(errors).length > 0) {
        throw new Error('Не все данные заполнены: ' + Object.values(errors).join(', '));
      }
      
      // Проверяем, что корзина не пуста
      if (this.shoppingCart.getItemsCount() === 0) {
        throw new Error('Корзина пуста');
      }
      
      // Формируем запрос в presenter (не в модели!)
      const orderData = this.orderManager.getOrderData();
      const orderRequest: OrderRequest = {
        payment: orderData.payment as 'card' | 'cash',
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address,
        total: this.shoppingCart.getTotalPrice(),
        items: this.shoppingCart.getItems().map(item => item.id)
      };
      
      // Отправляем на сервер...
      const response = await this.appApi.submitOrder(orderRequest);
      
      // Показываем сообщение об успехе
      this.successView.total = response.total;
      
      // Очищаем корзину и данные заказа
      this.shoppingCart.clear();
      this.orderManager.clear();
      
      // Очищаем формы (в случае повторных заказов формы будут пустые)
      this.orderForm.clear();
      this.contactsForm.clear();
      
      this.currentForm = null;
      this.modal.open(this.successView.render());
      
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      
      // Отображаем ошибку через представление
      const errorElement = document.createElement('div');
      errorElement.textContent = error instanceof Error ? error.message : 'Ошибка оформления заказа. Попробуйте еще раз.';
      errorElement.classList.add('error-message');
      
      this.modal.content.appendChild(errorElement);
    }
  }
  
  /**
   * Закрытие модального окна
   */
  private closeModal(): void {
    this.modal.close();
    this.currentForm = null;
  }
}

//#region Создание экземпляров снаружи (как рекомендовал ревьюер)
// Думаю, потом доделаю этот колхоз нормально отдельный классом и с инверсией зависимостей
const events = new EventEmitter();
const api = new Api(API_URL);
const appApi = new AppAPI(api);
const productCollection = new ProductCollection();
const shoppingCart = new ShoppingCart();
const orderManager = new OrderManager();
const viewFactory = new ViewFactory(events);
//#endregion

// Запуск приложения
new App(
  events,
  api,
  appApi,
  productCollection,
  shoppingCart,
  orderManager,
  viewFactory
);