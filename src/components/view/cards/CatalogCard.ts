import { Card } from '../base/Card';
import { Product } from '../../../types';
import { IEvents } from '../../base/Events';
import { cloneTemplate } from '../../../utils/utils';

/**
 * Карточка товара в каталоге
 */
export class CatalogCard extends Card<Product> {
    private _events: IEvents;
    private _id: string;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container);
        this._events = events!;
        
        // Извлекаем id товара из data-атрибута или используем фолбэк
        this._id = container.dataset.id || '';
        
        // Обработчик клика по карточке, просто пробрасываем дальше, используя брокер событий
        this.container.addEventListener('click', () => {
            this._events.emit('card:select', { id: this._id });
        });
    }

    /**
     * Устанавливает id товара
     */
    set id(value: string) {
        this._id = value;
        this.container.dataset.id = value;
    }

    /**
     * Обновляет данные карточки
     */
    update(data: Partial<Product>) {
        Object.assign(this as object, data);
        return this.container;
    }
}

/**
 * Метод-фабрика для создания карточек каталога
 */
export function createCatalogCard(product: Product, events: IEvents): CatalogCard {
    const template = cloneTemplate<HTMLElement>('#card-catalog');
    const card = new CatalogCard(template, events);
    
    card.id = product.id;
    card.title = product.title;
    card.image = product.image;
    card.price = product.price;
    card.category = product.category;
    
    return card;
}