import { OrderData, ValidationErrors } from '../../types';
import { EventEmitter } from '../base/Events';

export class OrderManager extends EventEmitter {
  private orderData: OrderData = {
    payment: '',
    email: '',
    phone: '',
    address: ''
  };

  setPayment(payment: 'card' | 'cash'): void {
    this.orderData.payment = payment;
    this.emit('order.details:changed');
  }

  setAddress(address: string): void {
    this.orderData.address = address;
    this.emit('order.details:changed');
  }

  setEmail(email: string): void {
    this.orderData.email = email;
    this.emit('order.contacts:changed');
  }

  setPhone(phone: string): void {
    this.orderData.phone = phone;
    this.emit('order.contacts:changed');
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
    this.emit('order:reset');
  }

  validate(): ValidationErrors {
    const errors: ValidationErrors = {};

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