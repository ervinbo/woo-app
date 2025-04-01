
import { WooCommerceApi } from './core';

export const ordersService = {
  async getOrders(api: WooCommerceApi, page = 1, perPage = 10, status = ''): Promise<any> {
    const statusParam = status ? `&status=${status}` : '';
    return api.request(`orders?page=${page}&per_page=${perPage}${statusParam}`);
  },

  async getOrder(api: WooCommerceApi, id: number): Promise<any> {
    return api.request(`orders/${id}`);
  },

  async updateOrderStatus(api: WooCommerceApi, id: number, status: string): Promise<any> {
    return api.request(`orders/${id}`, 'PUT', { status });
  }
};
