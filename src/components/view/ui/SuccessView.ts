import { Component } from '../../base/Component';
import { IEvents } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

/**
 * Сообщение об успешном заказе
 */
export class SuccessView extends Component<{ total: number }> {
    protected _total: HTMLElement;
    protected _closeButton: HTMLButtonElement;
    protected _events: IEvents;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container);
        this._events = events!;
        this._total = ensureElement<HTMLElement>('.order-success__description', container);
        this._closeButton = ensureElement<HTMLButtonElement>('.order-success__close', container);
        this._closeButton.addEventListener('click', () => {
            this._events.emit('success:close');
        });
    }

    /**
     * Устанавливает сумму заказа
     */
    set total(value: number) {
        this.setText(this._total, `Списано ${value} синапсов`);
    }

    /**
     * Вспомогательный метод для установки текста
     */
    protected setText(element: HTMLElement, value: string) {
        if (element) {
            element.textContent = value;
        }
    }
}