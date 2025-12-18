import { Card } from '../base/Card';
import { Product } from '../../../types';
import { IEvents } from '../../base/Events';

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