export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface Product {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface OrderData {
  payment: 'card' | 'cash' | '';
  email: string;
  phone: string;
  address: string;
}

// Отдельный интерфейс для самого заказа
export interface OrderRequest {
  payment: 'card' | 'cash';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

// Отдельный интерфейс для ошибок валидации - только сообщения об ошибках
export interface ValidationErrors {
  payment?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ProductListResponse {
  total: number;
  items: Product[];
}

export interface OrderResponse {
  id: string;
  total: number;
}