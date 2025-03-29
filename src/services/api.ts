
import { toast } from "@/lib/toast";

export interface WooCommerceCredentials {
  siteUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

class WooCommerceApi {
  private siteUrl: string = '';
  private consumerKey: string = '';
  private consumerSecret: string = '';
  private isAuthenticated: boolean = false;

  constructor() {
    // Try to load credentials from localStorage
    this.loadCredentials();
  }

  loadCredentials(): void {
    const savedCredentials = localStorage.getItem('woocommerce_credentials');
    if (savedCredentials) {
      const { siteUrl, consumerKey, consumerSecret } = JSON.parse(savedCredentials);
      this.siteUrl = siteUrl;
      this.consumerKey = consumerKey;
      this.consumerSecret = consumerSecret;
      this.isAuthenticated = true;
    }
  }

  saveCredentials(credentials: WooCommerceCredentials): void {
    this.siteUrl = credentials.siteUrl;
    this.consumerKey = credentials.consumerKey;
    this.consumerSecret = credentials.consumerSecret;
    this.isAuthenticated = true;
    localStorage.setItem('woocommerce_credentials', JSON.stringify(credentials));
  }

  clearCredentials(): void {
    this.siteUrl = '';
    this.consumerKey = '';
    this.consumerSecret = '';
    this.isAuthenticated = false;
    localStorage.removeItem('woocommerce_credentials');
  }

  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }

  private getAuthHeader(): string {
    return 'Basic ' + btoa(this.consumerKey + ':' + this.consumerSecret);
  }

  private getApiUrl(endpoint: string): string {
    return `${this.siteUrl}/wp-json/wc/v3/${endpoint}`;
  }

  async request<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
    data?: any
  ): Promise<T> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please set your WooCommerce API credentials.');
    }

    try {
      const url = this.getApiUrl(endpoint);
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader()
      };

      const options: RequestInit = {
        method,
        headers,
        credentials: 'same-origin',
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof Error) {
        toast.error(`API Error: ${error.message}`);
      } else {
        toast.error('An unknown error occurred with the API request');
      }
      throw error;
    }
  }

  // Products
  async getProducts(page = 1, perPage = 10): Promise<any> {
    return this.request(`products?page=${page}&per_page=${perPage}`);
  }

  async getProduct(id: number): Promise<any> {
    return this.request(`products/${id}`);
  }

  async createProduct(productData: any): Promise<any> {
    return this.request('products', 'POST', productData);
  }

  async updateProduct(id: number, productData: any): Promise<any> {
    return this.request(`products/${id}`, 'PUT', productData);
  }

  async deleteProduct(id: number): Promise<any> {
    return this.request(`products/${id}`, 'DELETE');
  }

  // Orders
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

  // Customers
  async getCustomers(page = 1, perPage = 10): Promise<any> {
    return this.request(`customers?page=${page}&per_page=${perPage}`);
  }

  async getCustomer(id: number): Promise<any> {
    return this.request(`customers/${id}`);
  }

  // Stats
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
      console.error('Failed to fetch stats:', error);
      return {
        recentOrders: [],
        productStats: [],
        customerStats: []
      };
    }
  }
}

// Export a singleton instance
export const wooCommerceApi = new WooCommerceApi();
