import { Form } from '../base/Form';
import { IEvents } from '../../base/Events';
import { cloneTemplate } from '../../../utils/utils';

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
     * Устанавливает email
     */
    set email(value: string) {
        this._emailInput.value = value;
    }

    /**
     * Устанавливает телефон
     */
    set phone(value: string) {
        this._phoneInput.value = value;
    }

    /**
     * Возвращает значения формы
     */
    getValue(): { email: string, phone: string } {
        return {
            email: this._emailInput.value,
            phone: this._phoneInput.value
        };
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
        this._events.emit('contacts:submit', this.getValue());
    }
}

/**
 * Фабрика для создания формы контактов
 */
export function createContactsForm(events: IEvents): ContactsForm {
    const template = cloneTemplate<HTMLElement>('#contacts');
    return new ContactsForm(template, events);
}