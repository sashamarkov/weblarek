import { Api } from '../components/base/Api';
import { API_URL } from './constants';

/**
 * Создает экземпляр API
 */
export function createApi(): Api {
  return new Api(API_URL);
}