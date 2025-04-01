
import { WooCommerceApiCore } from './core';

export class StatsService extends WooCommerceApiCore {
  async getStats(): Promise<any> {
    try {
      // Fetch recent orders without date filtering (we'll filter client-side)
      const recentOrders = await this.request('orders?per_page=20');
      
      // Fetch product and customer stats
      const [productStats, customerStats] = await Promise.all([
        this.request('reports/products/totals'),
        this.request('reports/customers/totals')
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
}

export const statsService = new StatsService();
