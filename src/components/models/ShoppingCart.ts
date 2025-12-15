import { Product } from '../../types';
import { EventEmitter } from '../base/Events';

export class ShoppingCart extends EventEmitter {
  private items: Product[] = [];

  getItems(): Product[] {
    return this.items;
  }

  addItem(product: Product): void {
    this.items.push(product);
    this.emit('basket:changed', { items: this.items });
  }

  removeItem(id: string): void {
    this.items = this.items.filter(item => item.id !== id);
    this.emit('basket:changed', { items: this.items });
  }

  clear(): void {
    this.items = [];
    this.emit('basket:changed', { items: this.items });
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => {
      return total + (item.price || 0);
    }, 0);
  }

  getItemsCount(): number {
    return this.items.length;
  }

  hasItem(id: string): boolean {
    return this.items.some(item => item.id === id);
  }
}