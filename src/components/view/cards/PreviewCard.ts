import { Card } from '../base/Card';
import { Product } from '../../../types';
import { IEvents } from '../../base/Events';

/**
 * Карточка товара для детального просмотра
 */
export class PreviewCard extends Card<Product> {
    private _events: IEvents;
    private _id: string;
    private _inBasket: boolean = false;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container);
        this._events = events!;
        
        // Инициализируем id пустой строкой, он будет установлен позже
        this._id = '';
        
        if (this._button) {
            this._button.addEventListener('click', () => {
                if (this._inBasket) {
                    this._events.emit('card:remove', { id: this._id });
                } else {
                    this._events.emit('card:add', { id: this._id });
                }
            });
        }
    }

    /**
     * Устанавливает id товара
     */
    set id(value: string) {
        this._id = value;
        this.container.dataset.id = value;
    }

    /**
     * Устанавливает состояние товара в корзине
     */
    set inBasket(value: boolean) {
        this._inBasket = value;
        
        if (this._button) {
            if (value) {
                this._button.textContent = 'Удалить из корзины';
            } else {
                this._button.textContent = 'В корзину';
            }
        }
    }

    /**
     * Обновляет данные карточки
     */
    update(data: Partial<Product> & { inBasket?: boolean }) {
        Object.assign(this as object, data);
        return this.container;
    }
}