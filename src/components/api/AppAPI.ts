import { IApi, Product, OrderRequest } from '../../types';

export class AppAPI {
  constructor(private api: IApi) {}

  async getProductList(): Promise<Product[]> {
    try {
      const response = await this.api.get<{ total: number; items: Product[] }>('/product/');
      return response.items;
    } catch (error) {
      console.error('Ошибка при получении списка товаров:', error);
      throw error;
    }
  }

  async submitOrder(orderData: OrderRequest): Promise<void> {
    try {
      await this.api.post('/order/', orderData);
      console.log('Заказ успешно отправлен на сервер');
    } catch (error) {
      console.error('Ошибка при отправке заказа:', error);
      throw error;
    }
  }
}