import { Component } from '../../base/Component';

/**
 * Главная страница
 */
export class Page extends Component<{ catalog: HTMLElement[] }> {
    protected _gallery: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        this._gallery = container.querySelector('.gallery') as HTMLElement;
    }

    /**
     * Устанавивает каталог товаров
     */
    set catalog(items: HTMLElement[]) {
        this._gallery.replaceChildren(...items);
    }
}