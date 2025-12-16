import { Component } from '../../base/Component';
import { IEvents } from '../../base/Events';

/**
 * Базовый класс для всех форм
 */
export abstract class Form<T> extends Component<T> {
    protected _submitButton: HTMLButtonElement | null;
    protected _errors: HTMLElement | null;
    protected _events: IEvents;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container);
        this._events = events!;
        
        this._submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
        this._errors = container.querySelector('.form__errors') as HTMLElement;
        
        this.container.addEventListener('input', (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target.name) {
                this.onInputChange(target.name, target.value);
            }
        });
        this.container.addEventListener('submit', (event: Event) => {
            event.preventDefault();
            this.onSubmit();
        });
    }

    /**
     * Активирует/деактивирует кнопку отправки
     */
    set valid(value: boolean) {
        if (this._submitButton) {
            this._submitButton.disabled = !value;
        }
    }

    /**
     * Отображает ошибки валидации
     */
    set errors(value: string) {
        if (this._errors) {
            this.setText(this._errors, value);
        }
    }

    /**
     * Очищает форму
     */
    clear() {
        const inputs = this.container.querySelectorAll<HTMLInputElement>('input');
        inputs.forEach(input => {
            input.value = '';
        });
        this.errors = '';
    }

    /**
     * Обработчик изменения поля ввода (переопределяется в дочерних классах)
     */
    protected onInputChange(name: string, value: string): void { }

    /**
     * Обработчик отправки формы (переопределяется в дочерних классах)
     */
    protected onSubmit(): void { }

    /**
     * Вспомогательный метод для установки текста
     */
    protected setText(element: HTMLElement, value: string) {
        if (element) {
            element.textContent = value;
        }
    }
}