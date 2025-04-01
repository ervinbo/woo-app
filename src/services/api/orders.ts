
import { WooCommerceApiCore } from './core';

export class OrdersService extends WooCommerceApiCore {
  async getOrders(page = 1, perPage = 10, status = ''): Promise<any> {
    const statusParam = status ? `&status=${status}` : '';
    return this.request(`orders?page=${page}&per_page=${perPage}${statusParam}`);
  }

  async getOrder(id: number): Promise<any> {
    return this.request(`orders/${id}`);
  }

  async updateOrderStatus(id: number, status: string): Promise<any> {
    return this.request(`orders/${id}`, 'PUT', { status });
  }
}

export const ordersService = new OrdersService();
