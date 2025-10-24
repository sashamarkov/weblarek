import { Product } from '../../types';

export class ShoppingCart {
  private items: Product[] = [];

  getItems(): Product[] {
    return this.items;
  }

  addItem(product: Product): void {
    this.items.push(product);
  }

  removeItem(id: string): void {
    this.items = this.items.filter(item => item.id !== id);
  }

  clear(): void {
    this.items = [];
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