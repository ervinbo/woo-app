
import { WooCommerceApi } from './core';

export const customersService = {
  async getCustomers(api: WooCommerceApi, page = 1, perPage = 10): Promise<any> {
    return api.request(`customers?page=${page}&per_page=${perPage}`);
  },

  async getCustomer(api: WooCommerceApi, id: number): Promise<any> {
    return api.request(`customers/${id}`);
  }
};
