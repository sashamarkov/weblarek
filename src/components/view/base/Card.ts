import { Component } from '../../base/Component';
import { Product } from '../../../types';
import { categoryMap, CDN_URL } from '../../../utils/constants';

/**
 * Базовый класс для всех карточек товаров
 */
export abstract class Card<T> extends Component<T> {
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _price: HTMLElement;
    protected _category: HTMLElement;
    protected _button: HTMLButtonElement | null;

    constructor(container: HTMLElement) {
        super(container);
        
        this._title = container.querySelector('.card__title') as HTMLElement;
        this._image = container.querySelector('.card__image') as HTMLImageElement;
        this._price = container.querySelector('.card__price') as HTMLElement;
        this._category = container.querySelector('.card__category') as HTMLElement;
        this._button = container.querySelector('.card__button') as HTMLButtonElement;
    }

    /**
     * Устанавливает заголовок карточки
     */
    set title(value: string) {
        this.setText(this._title, value);
    }

    /**
     * Устанавливает изображение товара
     */
    set image(value: string) {
        this.setImage(this._image, `${CDN_URL}${value}`);
    }

    /**
     * Устанавливает цену товара
     */
    set price(value: number | null) {
        if (value === null) {
            this.setText(this._price, 'Бесценно');
        } else {
            this.setText(this._price, `${value} синапсов`);
        }
    }

    /**
     * Устанавливает категорию товара
     */
    set category(value: string) {
        this.setText(this._category, value);
        const classList = Array.from(this._category.classList);
        classList.forEach(className => {
            if (className.startsWith('card__category_')) {
                this._category.classList.remove(className);
            }
        });
        
        const modifier = categoryMap[value as keyof typeof categoryMap];
        if (modifier) {
            this._category.classList.add(modifier);
        }
    }

    /**
     * Устанавливает порядковый номер (для корзины)
     */
    set index(value: number) {
        const indexElement = this.container.querySelector('.basket__item-index');
        if (indexElement) {
            this.setText(indexElement as HTMLElement, value.toString());
        }
    }

    /**
     * Устанавливает описание товара (для детального просмотра)
     */
    set description(value: string) {
        const textElement = this.container.querySelector('.card__text');
        if (textElement) {
            this.setText(textElement as HTMLElement, value);
        }
    }

    /**
     * Изменяет состояние кнопки
     */
    set button(state: { label: string, disabled: boolean }) {
        if (this._button) {
            this._button.textContent = state.label;
            this._button.disabled = state.disabled;
        }
    }

    /**
     * Вспомогательный метод для устанвки текста
     */
    protected setText(element: HTMLElement, value: string) {
        if (element) {
            element.textContent = value;
        }
    }
}