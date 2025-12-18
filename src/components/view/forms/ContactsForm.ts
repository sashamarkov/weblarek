import { Form } from '../base/Form';
import { IEvents } from '../../base/Events';

/**
 * Форма ввода контактных данных
 */
export class ContactsForm extends Form<{ email: string, phone: string }> {
    protected _emailInput: HTMLInputElement;
    protected _phoneInput: HTMLInputElement;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container, events);
        this._emailInput = this.container.querySelector('input[name="email"]') as HTMLInputElement;
        this._phoneInput = this.container.querySelector('input[name="phone"]') as HTMLInputElement;
    }

    /**
     * Возвращает текущее значение email
     */
    get email(): string {
        return this._emailInput.value;
    }

    /**
     * Устанавливает email
     */
    set email(value: string) {
        this._emailInput.value = value;
    }

    /**
     * Возвращает текущее значение телефона
     */
    get phone(): string {
        return this._phoneInput.value;
    }

    /**
     * Устанавливает телефон
     */
    set phone(value: string) {
        this._phoneInput.value = value;
    }

    /**
     * Обработчик изменения поля ввода
     */
    protected onInputChange(name: string, value: string): void {
        if (name === 'email') {
            this._events.emit('contacts.email:change', { email: value });
        } else if (name === 'phone') {
            this._events.emit('contacts.phone:change', { phone: value });
        }
    }

    /**
     * Обработчик отправки формы
     */
    protected onSubmit(): void {
        this._events.emit('contacts:submit');
    }
}