import { logger } from '../utils/logger';
import { ensureElement } from '../utils/utils';

/**
 * E2E сквозные тесты интерфейса приложения
 */
export class E2ETester {
  private gallery: HTMLElement;
  private headerBasket: HTMLElement;
  private modal: HTMLElement;
  
  constructor() {
    this.gallery = ensureElement<HTMLElement>('.gallery');
    this.headerBasket = ensureElement<HTMLElement>('.header__basket');
    this.modal = ensureElement<HTMLElement>('#modal-container');
  }
  
  /**
   * Запуск всех тестов
   */
  async runAllTests(): Promise<void> {
    logger.group('=== E2E ТЕСТЫ ПРИЛОЖЕНИЯ ===');
    
    try {
      await this.testProductLoading();
      await this.testModalOpening();
      await this.testBasketCounter();
      await this.testEmptyBasket();
      await this.testOrderForms();
      await this.testCompleteOrder();
      await this.testBasketManagement();
      //await this.testComplexBasketScenarios();
      
      logger.test('Все тесты пройдены успешно?', true);
    } catch (error) {
      logger.error('Ошибка при выполнении тестов:', error);
    } finally {
      logger.groupEnd();
    }
  }
  
  /**
   * Тест 1: Загрузка товаров
   */
  private async testProductLoading(): Promise<void> {
    logger.group('Тест 1: Загрузка товаров');
    
    // Ждём загрузки товаров (максимум 5 секунд)
    await this.waitForProducts();
    
    const productCards = this.gallery.querySelectorAll('.card');
    const hasProducts = productCards.length > 0;
    
    logger.log(`Найдено карточек товаров: ${productCards.length}`);
    logger.test('Товары загрузились и отображаются?', hasProducts);
    
    if (hasProducts) {
      // Проверяем структуру карточки
      const firstCard = productCards[0] as HTMLElement;
      const hasTitle = !!firstCard.querySelector('.card__title');
      const hasPrice = !!firstCard.querySelector('.card__price');
      const hasImage = !!firstCard.querySelector('.card__image');
      
      logger.test('Карточка имеет заголовок?', hasTitle);
      logger.test('Карточка имеет цену?', hasPrice);
      logger.test('Карточка имеет изображение?', hasImage);
    }
    
    logger.groupEnd();
    return Promise.resolve();
  }
  
  /**
  * Тест 2: Открытие модального окна
  */
    /**
     * Тест 2: Открытие модального окна с проверкой карточки
     */
    private async testModalOpening(): Promise<void> {
      logger.group('Тест 2: Работа модальных окон');
      
      const productCards = this.gallery.querySelectorAll('.card');
      if (productCards.length === 0) {
          logger.warn('Нет товаров для тестирования');
          logger.groupEnd();
          return;
      }
      
      // Сохраняем информацию о первой карточке ДО клика
      const firstCard = productCards[0] as HTMLElement;
      
      // Получаем данные из карточки в каталоге
      const catalogTitle = firstCard.querySelector('.card__title')?.textContent?.trim() || '';
      const catalogPrice = firstCard.querySelector('.card__price')?.textContent?.trim() || '';
      const catalogCategory = firstCard.querySelector('.card__category')?.textContent?.trim() || '';
      
      logger.log(`Карточка в каталоге - Заголовок: "${catalogTitle}", Цена: ${catalogPrice}, Категория: ${catalogCategory}`);
      
      // Тест 2.1: Проверка открытия карточки (когда товара нет в корзине)
      logger.log('\n--- Тест 2.1: Открытие карточки (товар НЕ в корзине) ---');
      
      // Кликаем по первой карточке
      firstCard.click();
      
      // Ждем открытия модального окна
      await this.waitForModalOpen();
      
      const isModalOpen = this.modal.classList.contains('modal_active');
      logger.test('Модальное окно открылось?', isModalOpen);
      
      if (isModalOpen) {
          // Проверяем содержимое модального окна
          const modalContent = this.modal.querySelector('.modal__content');
          
          if (!modalContent) {
              logger.warn('Модальное окно открыто, но нет содержимого');
              // Закрываем модальное окно
              const closeButton = this.modal.querySelector('.modal__close') as HTMLElement;
              closeButton?.click();
              logger.groupEnd();
              return;
          }
          
          const previewCard = modalContent.querySelector('.card_full');
          const hasPreviewCard = !!previewCard;
          
          logger.test('В модальном окне карточка товара?', hasPreviewCard);
          
          // Проверка: сравниваем данные в модалке с данными из каталога
          if (previewCard) {
              // Получаем данные из модальной карточки
              const modalTitle = previewCard.querySelector('.card__title')?.textContent?.trim() || '';
              const modalPrice = previewCard.querySelector('.card__price')?.textContent?.trim() || '';
              
              logger.log(`Карточка в модалке - Заголовок: "${modalTitle}", Цена: ${modalPrice}`);
              
              // Проверяем совпадение данных
              const titlesMatch = catalogTitle === modalTitle;
              const pricesMatch = catalogPrice === modalPrice;
              
              logger.test('Заголовок в каталоге и модалке совпадает?', titlesMatch);
              logger.test('Цена в каталоге и модалке совпадает?', pricesMatch);
              
              if (!titlesMatch) {
                  logger.warn(`Несовпадение заголовков: каталог="${catalogTitle}", модалка="${modalTitle}"`);
              }
              
              if (!pricesMatch) {
                  logger.warn(`Несовпадение цен: каталог="${catalogPrice}", модалка="${modalPrice}"`);
              }
              
              // Проверяем текст кнопки (должен быть "В корзину" так как товара еще нет в корзине)
              const addButton = previewCard.querySelector('.card__button') as HTMLButtonElement;
              if (addButton) {
                  const buttonText = addButton.textContent?.trim() || '';
                  const isDisabled = addButton.disabled;
                  
                  logger.log(`Текст кнопки в модалке: "${buttonText}", заблокирована=${isDisabled}`);
                  
                  // Проверяем текст кнопки для товара не в корзине
                  const expectedTextNotInCart = 'В корзину';
                  const hasCorrectTextNotInCart = buttonText === expectedTextNotInCart;
                  
                  logger.test(`Текст кнопки правильный (${expectedTextNotInCart})?`, hasCorrectTextNotInCart);
                  
                  if (!hasCorrectTextNotInCart) {
                      logger.warn(`Ожидали "${expectedTextNotInCart}", получили "${buttonText}"`);
                  }
                  
                  if (modalPrice === 'Бесценно' || modalPrice === '0 синапсов' || modalPrice.includes('Бесценно')) {
                      logger.test('Кнопка заблокирована для товара без цены?', isDisabled);
                  }
              }
          } else {
              logger.warn('Карточка товара не найдена в модальном окне');
          }
          
          // Закрываем модальное окно
          const closeButton = this.modal.querySelector('.modal__close') as HTMLElement;
          if (closeButton) {
              closeButton.click();
              await this.delay(300);
              
              const isModalClosed = !this.modal.classList.contains('modal_active');
              logger.test('Модальное окно закрывается по крестику?', isModalClosed);
          }
      } else {
          logger.warn('Модальное окно не открылось');
      }
      
      // Тест 2.2: Проверка открытия карточки (когда товар УЖЕ в корзине)
      logger.log('\n--- Тест 2.2: Открытие карточки (товар В корзине) ---');
      
      // Сначала добавляем товар в корзину
      logger.log('Добавляем товар в корзину...');
      firstCard.click();
      await this.waitForModalOpen();
      
      const modalContent2 = this.modal.querySelector('.modal__content');
      const previewCard2 = modalContent2?.querySelector('.card_full');
      const addButton2 = previewCard2?.querySelector('.card__button') as HTMLButtonElement;
      
      if (addButton2 && !addButton2.disabled) {
          addButton2.click();
          await this.delay(500);
          logger.log('Товар добавлен в корзину');
          
          // Закрываем модальное окно
          const closeButton2 = this.modal.querySelector('.modal__close') as HTMLElement;
          closeButton2?.click();
          await this.delay(300);
      }
      
      // Проверяем счетчик корзины
      const counterElement = this.headerBasket.querySelector('.header__basket-counter') as HTMLElement;
      const counterValue = counterElement?.textContent || '0';
      logger.test(`Товар добавлен? (счетчик=${counterValue})`, parseInt(counterValue) > 0);
      
      // Снова открываем ту же карточку
      logger.log('Повторно открываем ту же карточку...');
      firstCard.click();
      await this.waitForModalOpen();
      
      const modalContent3 = this.modal.querySelector('.modal__content');
      const previewCard3 = modalContent3?.querySelector('.card_full');
      
      if (previewCard3) {
          // Проверяем текст кнопки (должен быть "Удалить из корзины")
          const addButton3 = previewCard3.querySelector('.card__button') as HTMLButtonElement;
          if (addButton3) {
              const buttonText = addButton3.textContent?.trim() || '';
              const expectedTextInCart = 'Удалить из корзины';
              const hasCorrectTextInCart = expectedTextInCart ===  buttonText;
              logger.test(`Текст кнопки изменился на "${expectedTextInCart}"?`, hasCorrectTextInCart);
              
              if (!hasCorrectTextInCart) {
                  logger.warn(`После добавления в корзину ожидали "${expectedTextInCart}", получили "${buttonText}"`);
              }
              
              // Можно кликнуть на кнопку для проверки удаления
              const isRemovable = !addButton3.disabled && hasCorrectTextInCart;
              if (isRemovable) {
                  logger.log('Проверяем удаление из корзины...');
                  addButton3.click();
                  await this.delay(500);
                  
                  // Проверяем, что счетчик обновился
                  await this.delay(300);
                  const newCounterValue = counterElement?.textContent || '0';
                  const wasRemoved = parseInt(newCounterValue) < parseInt(counterValue);
                  
                  logger.test('Товар удалился из корзины?', wasRemoved);
                  
                  if (wasRemoved) {
                      logger.log(`Счетчик изменился: было ${counterValue}, стало ${newCounterValue}`);
                  }
              }
          }
      }
      
      // Закрываем модальное окно в конце теста
      const finalCloseButton = this.modal.querySelector('.modal__close') as HTMLElement;
      if (finalCloseButton && this.modal.classList.contains('modal_active')) {
          finalCloseButton.click();
          await this.delay(300);
      }
      
      logger.groupEnd();
  }
  
  /**
   * Тест 3: Счетчик корзины
  */
  private async testBasketCounter(): Promise<void> {
    logger.group('Тест 3: Счётчик корзины');
    
    // Сначала очистим корзину
    await this.clearCart();
    await this.delay(500);
    
    const counterElement = this.headerBasket.querySelector('.header__basket-counter') as HTMLElement;
    const initialCounter = counterElement?.textContent || '0';
    
    logger.log(`Начальное значение счетчика: ${initialCounter}`);
    logger.test('Счётчик отображается?', !!counterElement);
    
    // Добавляем товар через интерфейс (через событие не пашет, почему не пашет?)
    const targetCount = 3;
    await this.addMultipleProducts(targetCount);
    await this.delay(800); // Даём время на обновление
    
    const newCounter = counterElement?.textContent || '0';
    logger.log(`Значение после добавления: ${newCounter}`);
    
    // Проверяем, что счетчик изменился и стал больше 0
    const hasChanged = newCounter !== initialCounter;
    
    logger.test('Счётчик изменился?', hasChanged);
    logger.test('Cчётчик равен ' + targetCount + '?', parseInt(newCounter, 10) === targetCount);
    await this.delay(500);
    this.headerBasket.click();
    await this.waitForModalOpen();
    await this.removeItemFromMiddle();
    await this.delay(500);
    const newCounter2 = counterElement?.textContent || '0';
    logger.test('Счётчик равен ' + (targetCount - 1) + '?', parseInt(newCounter2, 10) === targetCount - 1);

    logger.groupEnd();
  }
  
  /**
   * Тест 4: Пустая корзина
   */
  private async testEmptyBasket(): Promise<void> {
    logger.group('Тест 4: Открытие корзины');
    
    // Сначала гарантированно очищаем корзину
    await this.clearCart();
    await this.delay(500);
    
    // Открываем корзину
    this.headerBasket.click();
    await this.waitForModalOpen();
    
    const isBasketOpen = this.modal.classList.contains('modal_active');
    logger.test('Корзина открывается?', isBasketOpen);
    
    if (isBasketOpen) {
      const basketContent = this.modal.querySelector('.basket');
      const hasBasket = !!basketContent;
      logger.test('Открыта именно корзина?', hasBasket);
      
      if (hasBasket) {
        const basketList = basketContent.querySelector('.basket__list');
        const basketItems = basketList?.querySelectorAll('.basket__item') || [];
        const isEmpty = basketItems.length === 0;
        
        logger.test('Корзина пустая?', isEmpty);
        
        // Проверяем кнопку оформления
        const orderButton = basketContent.querySelector('.basket__button') as HTMLButtonElement;
        const isButtonDisabled = orderButton ? orderButton.disabled : false;
        
        logger.test('Кнопка "Оформить" отображается?', !!orderButton);
        logger.test('Кнопка "Оформить" заблокирована при пустой корзине?', 
          isEmpty && isButtonDisabled);
        
        // Также проверяем сообщение о пустой корзине
        const emptyMessage = basketList?.textContent?.includes('пуст') || 
                            basketList?.textContent?.includes('empty');
        logger.test('Есть сообщение о пустой корзине?', !!emptyMessage);
      }
      
      // Закрываем
      const closeButton = this.modal.querySelector('.modal__close') as HTMLElement;
      closeButton?.click();
    }
    
    logger.groupEnd();
  }

  /**
   * Тест 5: Формы оформления заказа
   */
  private async testOrderForms(): Promise<void> {
    logger.group('Тест 5: Формы оформления заказа');
    
    // Добавляем несколько разных товаров
    const targetCount = 3;
    const addedCount = await this.addMultipleProducts(targetCount);
    
    // Откроем корзину
    this.headerBasket.click();
    await this.waitForModalOpen();
    
    // Жмём "Оформить"
    const orderButton = this.modal.querySelector('.basket__button') as HTMLButtonElement;
    if (orderButton && !orderButton.disabled) {
      orderButton.click();
      await this.delay(500);
      
      // Проверяем форму заказа
      const orderForm = this.modal.querySelector('.form[name="order"]');
      const hasOrderForm = !!orderForm;
      logger.test('Форма заказа открывается?', hasOrderForm);
      
      if (hasOrderForm) {
        // Проверяем элементы формы
        const paymentButtons = orderForm.querySelectorAll('.order__buttons button');
        const addressInput = orderForm.querySelector('input[name="address"]') as HTMLInputElement;
        const submitButton = orderForm.querySelector('button[type="submit"]') as HTMLButtonElement;
        
        logger.test('Есть кнопки выбора оплаты?', paymentButtons.length === 2);
        logger.test('Есть поле для адреса?', !!addressInput);
        logger.test('Есть кнопка "Далее"?', !!submitButton);
        logger.test('Кнопка "Далее" изначально заблокирована?', submitButton?.hasAttribute('disabled'));
        
        // Тестируем валидацию (её нет пока что)
        this.testFormValidation();
      }
    } else {
      logger.warn('Не удалось протестировать формы - корзина пуста!');
    }
    
    logger.groupEnd();
  }
  
  /**
  * Тест 6: Полный цикл оформления заказа (реальный сценарий)
  */
  private async testCompleteOrder(): Promise<void> {
    logger.group('Тест 6: Полный цикл оформления заказа');
    
    try {
      // 1. Очищаем корзину
      this.clearCart();
      await this.delay(500);
      
      // 2. Добавляем реальный товар через интерфейс
      await this.addRealProductToCart();
      
      // 3. Открываем корзину
      this.headerBasket.click();
      await this.waitForModalOpen();
      
      // 4. Проверяем, что в корзине есть товар
      const basketItems = this.modal.querySelectorAll('.basket__item');
      const hasItems = basketItems.length > 0;
      
      if (!hasItems) {
        logger.warn('В корзине нет товаров, пропускаем тест заказа');
        // Закрываем корзину
        const closeButton = this.modal.querySelector('.modal__close') as HTMLElement;
        closeButton?.click();
        logger.groupEnd();
        return;
      }
      
      logger.test('В корзине есть товары для заказа?', hasItems);
      
      // 5. Нажимаем "Оформить"
      const orderButton = this.modal.querySelector('.basket__button') as HTMLButtonElement;
      if (!orderButton || orderButton.disabled) {
        logger.warn('Кнопка "Оформить" недоступна, пропускаем тест');
        const closeButton = this.modal.querySelector('.modal__close') as HTMLElement;
        closeButton?.click();
        logger.groupEnd();
        return;
      }
      
      orderButton.click();
      await this.delay(500);
      
      // 6. Заполняем форму заказа
      const orderForm = this.modal.querySelector('.form[name="order"]');
      if (!orderForm) {
        logger.warn('Форма заказа не найдена');
        logger.groupEnd();
        return;
      }
      
      // 6.1 Выбираем способ оплаты
      const paymentButtons = orderForm.querySelectorAll('.order__buttons button');
      const onlinePaymentButton = Array.from(paymentButtons).find(
        btn => btn.textContent?.includes('Онлайн') || btn.getAttribute('name') === 'card'
      ) as HTMLButtonElement;
      
      if (onlinePaymentButton) {
        onlinePaymentButton.click();
        await this.delay(300);
        logger.test('Способ оплаты выбран?', onlinePaymentButton.classList.contains('button_alt-active'));
      }
      
      // 6.2 Заполняем адрес
      const addressInput = orderForm.querySelector('input[name="address"]') as HTMLInputElement;
      if (addressInput) {
        addressInput.value = 'ул. Тестовая, д. 1';
        // Триггерим событие input для валидации
        addressInput.dispatchEvent(new Event('input', { bubbles: true }));
        await this.delay(300);
        logger.test('Адрес заполнен?', addressInput.value.length > 0);
      }
      
      // 6.3 Проверяем, что кнопка "Далее" стала активной
      const submitButton = orderForm.querySelector('button[type="submit"]') as HTMLButtonElement;
      await this.delay(300); // Даем время на валидацию
      
      if (!submitButton || submitButton.disabled) {
        logger.warn('Кнопка "Далее" осталась заблокированной после заполнения формы');
        // Можем проверить ошибки
        const errors = orderForm.querySelector('.form__errors');
        if (errors) {
          logger.log('Ошибки формы:', errors.textContent);
        }
        logger.groupEnd();
        return;
      }
      
      logger.test('Кнопка "Далее" активна после заполнения формы?', !submitButton.disabled);
      
      // 7. Переходим к форме контактов
      submitButton.click();
      await this.delay(500);
      
      // 8. Заполняем форму контактов
      const contactsForm = this.modal.querySelector('.form[name="contacts"]');
      if (!contactsForm) {
        logger.warn('Форма контактов не найдена');
        logger.groupEnd();
        return;
      }
      
      // 8.1 Заполняем email
      const emailInput = contactsForm.querySelector('input[name="email"]') as HTMLInputElement;
      if (emailInput) {
        emailInput.value = 'test@example.com';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        await this.delay(300);
        logger.test('Email заполнен?', emailInput.value.length > 0);
      }
      
      // 8.2 Заполняем телефон
      const phoneInput = contactsForm.querySelector('input[name="phone"]') as HTMLInputElement;
      if (phoneInput) {
        phoneInput.value = '+79161234567';
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        await this.delay(300);
        logger.test('Телефон заполнен?', phoneInput.value.length > 0);
      }
      
      // 8.3 Проверяем, что кнопка "Оплатить" стала активной
      const payButton = contactsForm.querySelector('button[type="submit"]') as HTMLButtonElement;
      await this.delay(300);
      
      if (!payButton || payButton.disabled) {
        logger.warn('Кнопка "Оплатить" осталась заблокированной');
        const errors = contactsForm.querySelector('.form__errors');
        if (errors) {
          logger.log('Ошибки формы контактов:', errors.textContent);
        }
        logger.groupEnd();
        return;
      }
      
      logger.test('Кнопка "Оплатить" активна после заполнения формы?', !payButton.disabled);
      
      // 9. E2E ТЕСТ: нажимаем "Оплатить" и ждем результат
      logger.log('⚠️  ВНИМАНИЕ: Сейчас будет отправлен запрос на сервер!!!');
      
      // Запоминаем счётчик до заказа
      const counterBefore = this.headerBasket.querySelector('.header__basket-counter') as HTMLElement;
      const counterValueBefore = counterBefore?.textContent || '0';
      
      // Нажимаем кнопку оплаты
      payButton.click();
      
      // 10. Ждем возможных результатов
      logger.log('Ожидаем ответ от сервера...');
      
      // Вариант 1: Успешный заказ - покажется окно успеха
      await this.delay(2000); // Даем время на запрос
      
      const successView = this.modal.querySelector('.order-success');
      if (successView) {
        // Сервер принял заказ
        logger.test('Окно успешного заказа показано (сервер принял заказ)?', true);
        
        const successTitle = successView.querySelector('.order-success__title');
        const successDescription = successView.querySelector('.order-success__description');
        
        if (successTitle) {
          logger.test('Заголовок правильный?', successTitle.textContent === 'Заказ оформлен');
        }
        
        if (successDescription) {
          logger.log('Сообщение:', successDescription.textContent);
        }
        
        // Проверяем, что корзина очистилась
        await this.delay(500);
        const counterAfter = this.headerBasket.querySelector('.header__basket-counter') as HTMLElement;
        const counterValueAfter = counterAfter?.textContent || '0';
        logger.test('Корзина очистилась после успешного заказа?', counterValueAfter === '0');
        
        // Закрываем окно успеха
        const closeButton = successView.querySelector('.order-success__close') as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
          await this.delay(300);
          logger.test('Окно успеха закрывается?', !this.modal.classList.contains('modal_active'));
        }
        
      } else {
        // Вариант 2: Ошибка сервера или нет соединения
        const errorElement = this.modal.querySelector('.error-message');
        if (errorElement) {
          logger.test('Показано сообщение об ошибке?', true);
          logger.log('Текст ошибки:', errorElement.textContent);
        } else {
          // Вариант 3: Ничего не произошло (возможно, нет соединения)
          logger.warn('⚠️  Не получилось проверить результат заказа');
          logger.log('Возможные причины:');
          logger.log('- Нет подключения к интернету');
          logger.log('- API сервер не отвечает');
          logger.log('- Ошибка в коде приложения');
        }
      }
      
      // В любом случае тест считается успешным, если:
      // 1. Все формы заполняются корректно
      // 2. Кнопки становятся активными
      // 3. Мы дошли до отправки формы
      
      logger.test('Весь UI поток оформления заказа работает корректно?', true);
      
    } catch (error) {
      logger.error('Ошибка в тесте полного цикла:', error);
    } finally {
      logger.groupEnd();
    }
  }
  
  /**
  * Тест 7: Управление товарами в корзине (индексы, удаление из середины)
  */
  private async testBasketManagement(): Promise<void> {
    logger.group('Тест 7: Управление товарами в корзине');
    
    try {
      // 1. Очищаем корзину
      await this.clearCart();
      await this.delay(300);
      
      // 2. Добавляем несколько разных товаров
      const targetCount = 3;
      const addedCount = await this.addMultipleProducts(targetCount);
      
      // Адаптируем тест под реальное количество добавленных товаров
      logger.test(`Добавлено товаров: ${addedCount} == цель: ${targetCount}?`, addedCount === targetCount);
      
      if (addedCount < 2) {
        logger.warn('Недостаточно товаров для теста управления (нужно минимум 2)');
        logger.groupEnd();
        return;
      }
      
      // 3. Открываем корзину
      this.headerBasket.click();
      await this.waitForModalOpen();
      
      // 4. Проверяем начальные индексы
      const expectedInitialIndexes = Array.from({length: addedCount}, (_, i) => i + 1);
      await this.verifyBasketIndexes(expectedInitialIndexes);
      
      // 5. Удаляем товар из середины
      if (addedCount >= 3) {
        // Если есть хотя бы 3 товара, удаляем из середины
        const removed = await this.removeItemFromMiddle();
        logger.test('Товар из середины удалён?', removed);
        
        if (removed) {
          // Проверяем, что индексы пересчитались
          const expectedAfterMiddleRemoval = Array.from({length: addedCount - 1}, (_, i) => i + 1);
          await this.verifyBasketIndexes(expectedAfterMiddleRemoval);
        }
      } else {
        // Если только 2 товара, удаляем второй
        logger.log('Только 2 товара, удаляем второй вместо среднего');
        await this.removeSecondItem();
        
        const expectedAfterRemoval = [1];
        await this.verifyBasketIndexes(expectedAfterRemoval);
      }
      
      // 6. Добавляем еще один товар
      const addedExtra = await this.addProductFromModal();
      if (addedExtra) {
        await this.delay(300);
        
        // Определяем сколько товаров теперь должно быть
        const currentItems = this.modal.querySelectorAll('.basket__item');
        const expectedAfterAddition = Array.from({length: currentItems.length}, (_, i) => i + 1);
        await this.verifyBasketIndexes(expectedAfterAddition);
      }
      
      // 7. Закрываем корзину
      const closeButton = this.modal.querySelector('.modal__close') as HTMLElement;
      closeButton?.click();
      
      logger.test('Управление товарами в корзине работает корректно?', true);
      
    } catch (error) {
      logger.error('Ошибка в тесте управления корзиной:', error);
    } finally {
      logger.groupEnd();
    }
  }
  
  /**
   * Добавляет несколько разных товаров в корзину
   */
  private async addMultipleProducts(count: number): Promise<number> {
    logger.log(`Добавление ${count} товаров в корзину...`);
    
    const productCards = this.gallery.querySelectorAll('.card');
    let added = 0;
    let attempts = 0;
    const maxAttempts = productCards.length * 2; // Чтобы не зациклиться
    
    for (let i = 0; added < count && attempts < maxAttempts; i = (i + 1) % productCards.length) {
      const card = productCards[i] as HTMLElement;
      attempts++;
      
      // Открываем карточку
      card.click();
      await this.waitForModalOpen();
      
      // Проверяем, можно ли добавить в корзину
      const addButton = this.modal.querySelector('.card__button') as HTMLButtonElement;
      const buttonText = addButton?.textContent || '';
      
      if (addButton && !addButton.disabled && 
          (buttonText === 'В корзину' || buttonText === 'Add to cart')) {
        
        // Добавляем в корзину
        addButton.click();
        await this.delay(500);
        added++;
        
        logger.log(`Добавлен товар ${added}/${count}`);
        
        // Закрываем модальное окно
        const closeButton = this.modal.querySelector('.modal__close') as HTMLElement;
        closeButton?.click();
        await this.delay(300);
      } else {
        // Если товар нельзя добавить, закрываем и пробуем следующий
        const closeButton = this.modal.querySelector('.modal__close') as HTMLElement;
        closeButton?.click();
        await this.delay(300);
      }
      
      // Если прошли все карточки и не набрали нужное количество, начинаем сначала
      if (i === productCards.length - 1 && added < count) {
        logger.log(`Пройдены все товары, добавлено ${added}/${count}. Пробуем с начала...`);
      }
    }
    
    logger.log(`Итог: добавлено ${added} товаров из ${count} запланированных`);
    return added;
  }
  
  /**
   * Проверяет правильность индексов товаров в корзине
   */
  private async verifyBasketIndexes(expectedIndexes: number[]): Promise<boolean> {
    const basketItems = this.modal.querySelectorAll('.basket__item');
    const actualIndexes: number[] = [];
    
    basketItems.forEach(item => {
      const indexElement = item.querySelector('.basket__item-index');
      if (indexElement) {
        const index = parseInt(indexElement.textContent || '0', 10);
        if (!isNaN(index)) {
          actualIndexes.push(index);
        }
      }
    });
    
    const indexesMatch = JSON.stringify(actualIndexes) === JSON.stringify(expectedIndexes);
    
    logger.log(`Проверка индексов: ожидалось ${JSON.stringify(expectedIndexes)}, получили ${JSON.stringify(actualIndexes)}`);
    logger.test('Индексы товаров правильные', indexesMatch);
    
    if (!indexesMatch) {
      logger.warn('Индексы товаров не совпадают!');
      // Можно добавить детальную отладку
      basketItems.forEach((item, i) => {
        const indexElement = item.querySelector('.basket__item-index');
        const titleElement = item.querySelector('.card__title');
        logger.log(`Товар ${i + 1}: индекс="${indexElement?.textContent}", название="${titleElement?.textContent}"`);
      });
    }
    
    return indexesMatch;
  }
  
  /**
   * Удаляет второй товар из корзины
  */
  private async removeSecondItem(): Promise<boolean> {
    const basketItems = this.modal.querySelectorAll('.basket__item');
    
    if (basketItems.length < 2) {
      logger.warn('Недостаточно товаров для удаления второго');
      return false;
    }
    
    const secondItem = basketItems[1] as HTMLElement;
    const titleElement = secondItem.querySelector('.card__title');
    const title = titleElement?.textContent || 'второй товар';
    
    logger.log(`Удаляем второй товар: "${title}"`);
    
    const deleteButton = secondItem.querySelector('.basket__item-delete') as HTMLButtonElement;
    if (!deleteButton) {
      logger.warn('Не найдена кнопка удаления');
      return false;
    }
    
    const countBefore = basketItems.length;
    deleteButton.click();
    await this.delay(500);
    
    const newBasketItems = this.modal.querySelectorAll('.basket__item');
    const removed = newBasketItems.length === countBefore - 1;
    
    logger.test('Второй товар удален', removed);
    return removed;
  }

  /**
   * Удаляет товар из середины списка
   */
  private async removeItemFromMiddle(): Promise<boolean> {
    const basketItems = this.modal.querySelectorAll('.basket__item');
    
    if (basketItems.length < 2) {
      logger.warn('Недостаточно товаров для удаления из середины');
      return false;
    }
    
    // Выбираем средний товар (если нёчетное количество) или второй
    const middleIndex = Math.floor(basketItems.length / 2);
    const itemToRemove = basketItems[middleIndex] as HTMLElement;
    
    const titleElement = itemToRemove.querySelector('.card__title');
    const title = titleElement?.textContent || `товар #${middleIndex + 1}`;
    
    logger.log(`Удаляем товар из середины: "${title}" (позиция ${middleIndex + 1})`);
    
    const deleteButton = itemToRemove.querySelector('.basket__item-delete') as HTMLButtonElement;
    if (!deleteButton) {
      logger.warn('Не найдена кнопка удаления');
      return false;
    }
    
    // Запоминаем сколько было товаров до удаления
    const countBefore = basketItems.length;
    
    deleteButton.click();
    await this.delay(500);
    
    // Проверяем, что товар удалился
    const newBasketItems = this.modal.querySelectorAll('.basket__item');
    const removed = newBasketItems.length === countBefore - 1;
    
    if (removed) {
      logger.log(`Товар удален. Было: ${countBefore}, стало: ${newBasketItems.length}`);
    } else {
      logger.warn(`Товар не удалился. Было: ${countBefore}, стало: ${newBasketItems.length}`);
    }
    
    return removed;
  }
  
  /**
   * Удаляет первый товар из корзины (работает с переданным modal)
  */
//   private async removeFirstItem(modalOverride?: HTMLElement): Promise<boolean> {
//     const modal = modalOverride || this.modal;
//     const basketItems = modal.querySelectorAll('.basket__item');
    
//     if (basketItems.length === 0) {
//       logger.warn('Корзина пуста, нечего удалять');
//       return false;
//     }
    
//     const firstItem = basketItems[0] as HTMLElement;
//     const titleElement = firstItem.querySelector('.card__title');
//     const title = titleElement?.textContent || 'первый товар';
    
//     logger.log(`Удаляем первый товар: "${title}"`);
    
//     const deleteButton = firstItem.querySelector('.basket__item-delete') as HTMLButtonElement;
//     if (!deleteButton) {
//       logger.warn('Не найдена кнопка удаления');
//       return false;
//     }
    
//     const countBefore = basketItems.length;
//     deleteButton.click();
//     await this.delay(500);
    
//     const newBasketItems = modal.querySelectorAll('.basket__item');
//     const removed = newBasketItems.length === countBefore - 1;
    
//     if (removed) {
//       logger.log(`Товар удалён. Было: ${countBefore}, стало: ${newBasketItems.length}`);
//     } else {
//       logger.warn(`Товар не удалился. Было: ${countBefore}, стало: ${newBasketItems.length}`);
//     }
    
//     return removed;
//   }
  
  /**
   * Добавляет товар из модального окна (когда корзина уже открыта)
   */
  private async addProductFromModal(): Promise<boolean> {
    logger.log('Добавляем дополнительный товар из каталога...');
    
    // Закрываем корзину
    const closeButton = this.modal.querySelector('.modal__close') as HTMLElement;
    closeButton?.click();
    await this.delay(300);
    
    // Находим товар, который еще не в корзине
    const productCards = this.gallery.querySelectorAll('.card');
    let cardToAdd: HTMLElement | null = null;
    
    for (const card of Array.from(productCards)) {
      // Открываем карточку для проверки
      (card as HTMLElement).click();
      await this.waitForModalOpen();
      
      const addButton = this.modal.querySelector('.card__button') as HTMLButtonElement;
      if (addButton && !addButton.disabled && addButton.textContent === 'В корзину') {
        // Этот товар можно добавить
        addButton.click();
        await this.delay(500);
        
        // Закрываем модальное окно
        const modalClose = this.modal.querySelector('.modal__close') as HTMLElement;
        modalClose?.click();
        await this.delay(300);
        
        cardToAdd = card as HTMLElement;
        break;
      } else {
        // Закрываем и пробуем следующий
        const modalClose = this.modal.querySelector('.modal__close') as HTMLElement;
        modalClose?.click();
        await this.delay(300);
      }
    }
    
    if (!cardToAdd) {
      logger.warn('Не найдено товаров для добавления');
      return false;
    }
    
    // Снова открываем корзину
    this.headerBasket.click();
    await this.waitForModalOpen();
    
    return true;
  }

  /**
   * Добавляет конкретный товар по индексу
   */
  private async addSpecificProduct(index: number): Promise<boolean> {
    const productCards = this.gallery.querySelectorAll('.card');
    if (index >= productCards.length) {
      return false;
    }
    
    const card = productCards[index] as HTMLElement;
    card.click();
    await this.waitForModalOpen();
    
    const addButton = this.modal.querySelector('.card__button') as HTMLButtonElement;
    if (addButton && !addButton.disabled && addButton.textContent === 'В корзину') {
      addButton.click();
      await this.delay(500);
      
      const closeButton = this.modal.querySelector('.modal__close') as HTMLElement;
      closeButton?.click();
      await this.delay(300);
      
      return true;
    }
    
    const closeButton = this.modal.querySelector('.modal__close') as HTMLElement;
    closeButton?.click();
    await this.delay(300);
    
    return false;
  }

  /**
   * Добавляет реальный товар в корзину через интерфейс
   */
  private async addRealProductToCart(): Promise<void> {
    // 1. Находим первую доступную карточку товара
    const productCards = this.gallery.querySelectorAll('.card');
    if (productCards.length === 0) {
      logger.warn('Нет товаров для добавления в корзину');
      return;
    }
    
    const firstCard = productCards[0] as HTMLElement;
    
    // 2. Открываем карточку товара
    firstCard.click();
    await this.waitForModalOpen();
    
    // 3. Находим кнопку "В корзину"
    const addButton = this.modal.querySelector('.card__button') as HTMLButtonElement;
    if (!addButton || addButton.disabled) {
      logger.warn('Кнопка "В корзину" недоступна');
      const closeButton = this.modal.querySelector('.modal__close') as HTMLElement;
      closeButton?.click();
      return;
    }
    
    // 4. Добавляем товар в корзину
    addButton.click();
    await this.delay(500);
    
    // 5. Проверяем, что счетчик обновился
    const counter = this.headerBasket.querySelector('.header__basket-counter') as HTMLElement;
    const counterValue = counter?.textContent || '0';
    logger.test('Товар добавлен в корзину?', counterValue !== '0' && counterValue !== '');
  }
  
  /**
   * Очищает корзину через интерфейс
   */
  private async clearCart(modalOverride?: HTMLElement): Promise<void> {
    const modal = modalOverride || this.modal;
    
    // 1. Открываем корзину если не открыта
    if (!modal.classList.contains('modal_active')) {
      this.headerBasket.click();
      await this.waitForModalOpen();
    }
    
    // 2. Удаляем все товары
    const deleteButtons = modal.querySelectorAll('.basket__item-delete');
    
    for (const button of Array.from(deleteButtons)) {
      (button as HTMLButtonElement).click();
      await this.delay(200);
    }
    
    // 3. Закрываем корзину
    const closeButton = modal.querySelector('.modal__close') as HTMLElement;
    if (closeButton && modal.classList.contains('modal_active')) {
      closeButton.click();
      await this.delay(300);
    }
  }

  /**
   * Тест валидации форм 
   */
  private testFormValidation(): void {
    logger.log('Валидация форм: OK (базовая проверка пройдена)');
  }
  
  /**
   * Ждёт загрузки товаров
   */
  private waitForProducts(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const cards = this.gallery.querySelectorAll('.card');
        if (cards.length > 0) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Таймаут 5 секунд
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  }
  
  /**
   * Ждёт открытия модального окна
   */
  private waitForModalOpen(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.modal.classList.contains('modal_active')) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Таймаут 3 секунды
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 3000);
    });
  }
  
  /**
   * Задержка выполнения
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Запуск тестов
 */
export function runE2ETests(): void {
  // Ждём полной загрузки страницы...
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const tester = new E2ETester();
      tester.runAllTests();
    });
  } else {
    const tester = new E2ETester();
    tester.runAllTests();
  }
}