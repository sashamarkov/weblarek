import { OrderData, ValidationResult } from '../../types';

export class OrderManager {
  private orderData: OrderData = {
    payment: '',
    email: '',
    phone: '',
    address: ''
  };

  setPayment(payment: 'card' | 'cash'): void {
    this.orderData.payment = payment;
  }

  setAddress(address: string): void {
    this.orderData.address = address;
  }

  setEmail(email: string): void {
    this.orderData.email = email;
  }

  setPhone(phone: string): void {
    this.orderData.phone = phone;
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