import { Component } from '../../base/Component';
import { IEvents } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

/**
 * Шапка сайта
 */
export class Header extends Component<{ counter: number }> {
    protected _counter: HTMLElement;
    protected _basketButton: HTMLButtonElement;
    protected _events: IEvents;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container);
        this._events = events!;
        this._counter = ensureElement<HTMLElement>('.header__basket-counter', container);
        this._basketButton = ensureElement<HTMLButtonElement>('.header__basket', container);
        this._basketButton.addEventListener('click', () => {
            this._events.emit('header:basket');
        });
    }

    /**
     * Устанавливает счётчик товаров
     */
    set counter(value: number) {
        this.setText(this._counter, value.toString());
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