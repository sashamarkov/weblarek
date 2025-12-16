import { Form } from '../base/Form';
import { IEvents } from '../../base/Events';
import { cloneTemplate, ensureElement } from '../../../utils/utils';

/**
 * Форма оформления заказа (выбор оплаты и адрес)
 */
export class OrderForm extends Form<{ payment: string, address: string }> {
    protected _paymentButtons: NodeListOf<HTMLButtonElement>;
    protected _addressInput: HTMLInputElement;
    protected _selectedPayment: string = '';

    constructor(container: HTMLElement, events?: IEvents) {
        super(container, events);
        
        this._paymentButtons = container.querySelectorAll('.order__buttons button');
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);
        
        this._paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.selectPayment(button.name as 'card' | 'cash');
            });
        });
        
        // Оработчик изменения адреса
        this._addressInput.addEventListener('input', () => {
            this._events.emit('order.address:change', { 
                address: this._addressInput.value 
            });
        });
    }

    /**
    * Полностью стирает все данные из формы, включая выделение с кнопки оплаты
    */
    clear(): void {
        super.clear(); // очистка инпутов
        // Снимаем выделение со всех кнопок оплаты
        this._paymentButtons.forEach(button => {
            button.classList.remove('button_alt-active');
        });
    }


    /**
     * Выбирает способ оплаты
     */
    private selectPayment(method: 'card' | 'cash') {
        this._selectedPayment = method;
        
        // Снимаем выделение со всех кнопок
        this._paymentButtons.forEach(button => {
            button.classList.remove('button_alt-active');
        });
    
        const selectedButton = Array.from(this._paymentButtons).find(
            button => button.name === method
        );
        if (selectedButton) {
            selectedButton.classList.add('button_alt-active');
        }
        
        // Форсим событие 
        this._events.emit('order.payment:change', { payment: method });
    }

    /**
     * Устанавливает способ оплаты
     */
    set payment(value: string) {
        if (value === 'card' || value === 'cash') {
            this.selectPayment(value);
        }
    }

    /**
     * Устанавливает адрес
     */
    set address(value: string) {
        this._addressInput.value = value;
    }

    /**
     * Возвращает значения формы
     */
    getValue(): { payment: string, address: string } {
        return {
            payment: this._selectedPayment,
            address: this._addressInput.value
        };
    }

    /**
     * Обработчик изменения поля ввода
     */
    protected onInputChange(name: string, value: string): void {
        if (name === 'address') {
            this._events.emit('order.address:change', { address: value });
        }
    }

    /**
     * Обработчик отправки формы
     */
    protected onSubmit(): void {
        this._events.emit('order:submit', this.getValue());
    }
}

/**
 * Фабрика для создания формы заказа
 */
export function createOrderForm(events: IEvents): OrderForm {
    const template = cloneTemplate<HTMLElement>('#order');
    return new OrderForm(template, events);
}