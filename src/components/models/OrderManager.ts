import { OrderData, OrderRequest, ValidationResult } from '../../types';
import { ShoppingCart } from './ShoppingCart';
import { EventEmitter } from '../base/Events';

export class OrderManager extends EventEmitter {
  private orderData: OrderData = {
    payment: '',
    email: '',
    phone: '',
    address: ''
  };

  createRequest(cart: ShoppingCart): OrderRequest {
    const errors = this.validate();
    if (Object.keys(errors).length > 0) {
      throw new Error('Не все данные заполнены: ' + Object.values(errors).join(', '));
    }

    // Проверяем, что корзина не пуста
    if (cart.getItemsCount() === 0) {
      throw new Error('Корзина пуста');
    }
    const payment = this.orderData.payment as 'card' | 'cash';
    return {
      payment: payment,
      email: this.orderData.email,
      phone: this.orderData.phone,
      address: this.orderData.address,
      total: cart.getTotalPrice(),
      items: cart.getItems().map(item => item.id)
    };
  }

  setPayment(payment: 'card' | 'cash'): void {
    this.orderData.payment = payment;
    this.emit('order:changed', { order: this.orderData });
  }

  setAddress(address: string): void {
    this.orderData.address = address;
    this.emit('order:changed', { order: this.orderData });
  }

  setEmail(email: string): void {
    this.orderData.email = email;
    this.emit('order:changed', { order: this.orderData });
  }

  setPhone(phone: string): void {
    this.orderData.phone = phone;
    this.emit('order:changed', { order: this.orderData });
  }

  getOrderData(): OrderData {
    return { ...this.orderData };
  }

  clear(): void {
    this.orderData = {
      payment: '',
      email: '',
      phone: '',
      address: ''
    };
    this.emit('order:changed', { order: this.orderData });
  }

  validate(): ValidationResult {
    const errors: ValidationResult = {};

    if (!this.orderData.payment) {
      errors.payment = 'Не выбран способ оплаты';
    }

    if (!this.orderData.address.trim()) {
      errors.address = 'Укажите адрес доставки';
    }

    if (!this.orderData.email.trim()) {
      errors.email = 'Укажите email';
    }

    if (!this.orderData.phone.trim()) {
      errors.phone = 'Укажите телефон';
    }

    return errors;
  }
}