import { ensureElement } from '../../../utils/utils';

/**
 * Модальное окно
 */
export class Modal {
    protected _container: HTMLElement;
    protected _content: HTMLElement;
    protected _closeButton: HTMLButtonElement;


    constructor(container: HTMLElement) {
        this._container = container;
        this._content = ensureElement<HTMLElement>('.modal__content', container);
        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        
        this._closeButton.addEventListener('click', this.close.bind(this));
        this._container.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    /**
     * Открывает модальное окно
     */
    open(content?: HTMLElement): void {
        if (content) {
            this._content.replaceChildren(content);
        }
        
        this._container.classList.add('modal_active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Закрывает модальное окно
     */
    close(): void {
        this._container.classList.remove('modal_active');
        this._content.innerHTML = '';
        document.body.style.overflow = '';
    }

    /**
     * Возвращает содержимое модального окна
     */
    get content(): HTMLElement {
        return this._content;
    }

    /**
     * Обработчик клика вне модального окна
     */
    private handleOutsideClick(event: MouseEvent): void {
        if (event.target === this._container) {
            this.close();
        }
    }

    /**
     * Показывает ошибку в модалке
    */
    public showError(errorMessage: string) {
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-message')
        errorElement.textContent = errorMessage;
        this.content.appendChild(errorElement);
    }
}