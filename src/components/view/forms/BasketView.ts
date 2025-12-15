import { Component } from '../../base/Component';
import { IEvents } from '../../base/Events';
import { cloneTemplate, ensureElement } from '../../../utils/utils';

/**
 * Отображение корзины
 */
export class BasketView extends Component<{ items: HTMLElement[], total: number }> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _events: IEvents;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container);
        this._events = events!;
    
        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', container);
        
        this._button.addEventListener('click', () => {
            this._events.emit('basket:order');
        });
    }

    /**
     * Устанавливает список товаров
     */
    set items(value: HTMLElement[]) {
        this._list.replaceChildren(...value);
    
        if (value.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Корзина пуста';
            emptyMessage.classList.add('basket__empty');
            this._list.append(emptyMessage);
        }
    }

    /**
     * Устанавливает общую сумму
     */
    set total(value: number) {
        this.setText(this._total, `${value} синапсов`);
    }

    /**
     * Блокирует или разблокирует кнопку оформления
     */
    set button(state: boolean) {
        this._button.disabled = !state;
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

/**
 * Фабрика для создания корзины
 */
export function createBasketView(events: IEvents): BasketView {
    const template = cloneTemplate<HTMLElement>('#basket');
    return new BasketView(template, events);
}