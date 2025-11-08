import { IApi, Product, OrderRequest, OrderResponse } from '../../types';
import { logger } from '../../utils/logger';

export class AppAPI {
  constructor(private api: IApi) {}

  async getProductList(): Promise<Product[]> {
    try {
      const response = await this.api.get<{ total: number; items: Product[] }>('/product/');
      return response.items;
    } catch (error) {
      logger.error('Ошибка при получении списка товаров:', error);
      throw error;
    }
  }

  async submitOrder(orderData: OrderRequest): Promise<OrderResponse> {
    try {
      const response = await this.api.post<OrderResponse>('/order/', orderData);
      return response;
    } catch (error) {
      logger.error('Ошибка при отправке заказа:', error);
      throw error;
    }
  }
}