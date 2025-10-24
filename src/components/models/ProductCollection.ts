import { Product } from '../../types';

export class ProductCollection {
  private products: Product[] = [];
  private selectedProduct: Product | null = null;

  setProducts(products: Product[]): void {
    this.products = products;
  }

  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  setSelectedProduct(product: Product): void {
    this.selectedProduct = product;
  }

  getSelectedProduct(): Product | null {
    return this.selectedProduct;
  }
}