import { Card } from '../base/Card';
import { Product } from '../../../types';
import { IEvents } from '../../base/Events';
import { cloneTemplate } from '../../../utils/utils';

/**
 * Карточка товара в корзине
 */
export class BasketCard extends Card<Product> {
    private _events: IEvents;
    private _id: string;
    private _deleteButton: HTMLButtonElement;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container);
        this._events = events!;
        
        this._id = container.dataset.id || '';
        
        this._deleteButton = container.querySelector('.basket__item-delete') as HTMLButtonElement;
        this._deleteButton.addEventListener('click', () => {
            this._events.emit('basket:remove', { id: this._id });
        });
    }

    /**
     * Устанавливает ID товара
     */
    set id(value: string) {
        this._id = value;
        this.container.dataset.id = value;
    }

    /**
     * Обновляет данные карточки
     */
    update(data: Partial<Product> & { index?: number }) {
        Object.assign(this as object, data);
        return this.container;
    }
}

/**
 * Фабрика для создания карточек корзины
 */
export function createBasketCard(product: Product, events: IEvents): BasketCard {
    const template = cloneTemplate<HTMLElement>('#card-basket');
    const card = new BasketCard(template, events);
    
    card.id = product.id;
    card.title = product.title;
    card.price = product.price;
    
    return card;
}