import { Form } from '../base/Form';
import { IEvents } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

/**
 * Форма оформления заказа (выбор оплаты и адрес)
 */
export class OrderForm extends Form<{ payment: string, address: string }> {
    protected _paymentButtons: NodeListOf<HTMLButtonElement>;
    protected _addressInput: HTMLInputElement;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container, events);
        
        this._paymentButtons = container.querySelectorAll('.order__buttons button');
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);
        
        this._paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.selectPayment(button.name);
                // Уведомляем об изменении способа оплаты, если кликнули на кнопку
                this._events.emit('order.payment:change', { payment: button.name });
            });
        });
    }

    /**
    * Полностью стирает все данные из формы, включая выделение с кнопки оплаты
    */
    clear(): void {
        super.clear(); // очистка инпутов
        this.clearPayment();
    }

    /**
     * Выбирает способ оплаты (подсвечиваем кнопку)
     */
    private selectPayment(payment:string) {
        this.clearPayment();
        const selectedButton = Array.from(this._paymentButtons).find(
            button => button.name === payment
        );
        if (selectedButton) {
            selectedButton.classList.add('button_alt-active');
        }
    }

    /*
    * Сбрасывает выбранный способ оплаты
    */
    private clearPayment() {
        this._paymentButtons.forEach(button => {
            button.classList.remove('button_alt-active');
        });
    }

    /**
     * Устанавливает способ оплаты
     */
    set payment(value: string) {
        this.selectPayment(value);
    }

    /**
     * Возвращает введенный адрес
     */
    get address(): string {
        return this._addressInput.value;
    }

    /**
     * Устанавливает адрес
     */
    set address(value: string) {
        this._addressInput.value = value;
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
        this._events.emit('order:submit');
    }
}