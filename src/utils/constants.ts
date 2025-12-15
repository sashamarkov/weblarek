/* Константа для получения полного пути для сервера. Для выполнения запроса 
необходимо к API_URL добавить только ендпоинт. */
export const API_URL = `${import.meta.env.VITE_API_ORIGIN}/api/weblarek`; 

/* Константа для формирования полного пути к изображениям карточек. 
Для получения полной ссылки на картинку необходимо к CDN_URL добавить только название файла изображения,
которое хранится в объекте товара. */
export const CDN_URL = `${import.meta.env.VITE_API_ORIGIN}/content/weblarek`;

/* Константа соответствий категорий товара модификаторам, используемым для отображения фона категории. */
export const categoryMap = {
  'софт-скил': 'card__category_soft',
  'хард-скил': 'card__category_hard',
  'кнопка': 'card__category_button',
  'дополнительное': 'card__category_additional',
  'другое': 'card__category_other',
};

export const settings = { };

// Дополнительные константы для приложения
export const APP_EVENTS = {
  // События моделей
  PRODUCTS_CHANGED: 'products:changed',
  PRODUCT_SELECTED: 'product:selected',
  BASKET_CHANGED: 'basket:changed',
  ORDER_CHANGED: 'order:changed',
  
  // События представлений
  CARD_SELECT: 'card:select',
  CARD_ADD: 'card:add',
  CARD_REMOVE: 'card:remove',
  BASKET_REMOVE: 'basket:remove',
  HEADER_BASKET: 'header:basket',
  BASKET_ORDER: 'basket:order',
  ORDER_SUBMIT: 'order:submit',
  CONTACTS_SUBMIT: 'contacts:submit',
  ORDER_PAYMENT_CHANGE: 'order.payment:change',
  ORDER_ADDRESS_CHANGE: 'order.address:change',
  CONTACTS_EMAIL_CHANGE: 'contacts.email:change',
  CONTACTS_PHONE_CHANGE: 'contacts.phone:change',
  SUCCESS_CLOSE: 'success:close',
} as const;

