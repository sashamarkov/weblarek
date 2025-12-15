import { Product } from '../../types';
import { EventEmitter } from '../base/Events';

export class ProductCollection extends EventEmitter {
  private products: Product[] = [];
  private selectedProduct: Product | null = null;

  setProducts(products: Product[]): void {
    this.products = products;
    this.emit('products:changed', { products: this.products });
  }

  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  setSelectedProduct(product: Product): void {
    this.selectedProduct = product;
    this.emit('product:selected', { product: this.selectedProduct });
  }

  getSelectedProduct(): Product | null {
    return this.selectedProduct;
  }
}