
import { WooCommerceApiCore } from './core';

export class CustomersService extends WooCommerceApiCore {
  async getCustomers(page = 1, perPage = 10): Promise<any> {
    return this.request(`customers?page=${page}&per_page=${perPage}`);
  }

  async getCustomer(id: number): Promise<any> {
    return this.request(`customers/${id}`);
  }
}

export const customersService = new CustomersService();
