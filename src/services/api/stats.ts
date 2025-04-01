
import { WooCommerceApi } from './core';

export const statsService = {
  async getStats(api: WooCommerceApi): Promise<any> {
    try {
      // Fetch recent orders without date filtering (we'll filter client-side)
      const recentOrders = await api.request('orders?per_page=20');
      
      // Fetch product and customer stats
      const [productStats, customerStats] = await Promise.all([
        api.request('reports/products/totals'),
        api.request('reports/customers/totals')
      ]);

      return {
        recentOrders: Array.isArray(recentOrders) ? recentOrders : [],
        productStats: Array.isArray(productStats) ? productStats : [],
        customerStats: Array.isArray(customerStats) ? customerStats : []
      };
    } catch (error) {
      console.error('Nije uspelo preuzimanje statistike:', error);
      return {
        recentOrders: [],
        productStats: [],
        customerStats: []
      };
    }
  }
};
