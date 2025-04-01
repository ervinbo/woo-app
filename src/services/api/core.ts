
import { toast } from "@/lib/toast";
import { WooCommerceCredentials } from './types';
import { productsService } from './products';
import { ordersService } from './orders';
import { customersService } from './customers';
import { statsService } from './stats';
import { settingsService } from './settings';

export class WooCommerceApi {
  private siteUrl: string = '';
  private consumerKey: string = '';
  private consumerSecret: string = '';
  private isAuthenticated: boolean = false;

  // Define service properties
  public readonly orders: {
    getAll: (page?: number, perPage?: number, status?: string) => Promise<any>;
    get: (id: number) => Promise<any>;
    updateStatus: (id: number, status: string) => Promise<any>;
  };

  public readonly customers: {
    getAll: (page?: number, perPage?: number) => Promise<any>;
    get: (id: number) => Promise<any>;
  };

  public readonly stats: {
    getAll: () => Promise<any>;
  };

  public readonly settings: {
    toggleCatalogMode: (enable: boolean) => Promise<any>;
  };

  constructor() {
    // Try to load credentials from localStorage
    this.loadCredentials();

    // Initialize service properties
    this.orders = {
      getAll: (page = 1, perPage = 10, status = '') => 
        ordersService.getOrders(this, page, perPage, status),
      get: (id: number) => 
        ordersService.getOrder(this, id),
      updateStatus: (id: number, status: string) => 
        ordersService.updateOrderStatus(this, id, status)
    };

    this.customers = {
      getAll: (page = 1, perPage = 10) => 
        customersService.getCustomers(this, page, perPage),
      get: (id: number) => 
        customersService.getCustomer(this, id)
    };

    this.stats = {
      getAll: () => statsService.getStats(this)
    };

    this.settings = {
      toggleCatalogMode: (enable: boolean) => 
        settingsService.toggleCatalogMode(this, enable)
    };
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

  getAuthHeader(): string {
    return 'Basic ' + btoa(this.consumerKey + ':' + this.consumerSecret);
  }

  getApiUrl(endpoint: string): string {
    // Make sure we handle URLs correctly
    if (endpoint.includes('wp-json')) {
      return `${this.siteUrl}/${endpoint}`;
    }
    
    // Make sure URL doesn't have double slashes
    const baseUrl = this.siteUrl.endsWith('/') ? this.siteUrl.slice(0, -1) : this.siteUrl;
    return `${baseUrl}/wp-json/wc/v3/${endpoint}`;
  }

  async request<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
    data?: any
  ): Promise<T> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please enter your WooCommerce API credentials.');
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
        // Don't include credentials for cross-origin requests
        mode: 'cors',
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      console.log(`Sending ${method} request to ${url}`, options);
      
      const response = await fetch(url, options);
      console.log(`Response status: ${response.status}`);
      
      const responseText = await response.text();
      console.log(`Response text: ${responseText}`);
      
      if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Use the text response if it's not JSON
          if (responseText) {
            errorMessage = responseText;
          }
        }
        
        console.error('API error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Parse as JSON only if there's content
      return responseText ? JSON.parse(responseText) as T : {} as T;
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

  // Products methods
  getProducts(page = 1, perPage = 10) {
    return productsService.getProducts(this, page, perPage);
  }

  getProduct(id: number) {
    return productsService.getProduct(this, id);
  }

  createProduct(productData: any) {
    return productsService.createProduct(this, productData);
  }

  updateProduct(id: number, productData: any) {
    return productsService.updateProduct(this, id, productData);
  }

  deleteProduct(id: number) {
    return productsService.deleteProduct(this, id);
  }

  getCategories() {
    return productsService.getCategories(this);
  }

  // Orders methods
  getOrders(page = 1, perPage = 10, status = '') {
    return this.orders.getAll(page, perPage, status);
  }

  getOrder(id: number) {
    return this.orders.get(id);
  }

  updateOrderStatus(id: number, status: string) {
    return this.orders.updateStatus(id, status);
  }

  // Customers methods
  getCustomers(page = 1, perPage = 10) {
    return this.customers.getAll(page, perPage);
  }

  getCustomer(id: number) {
    return this.customers.get(id);
  }

  // Stats methods
  getStats() {
    return this.stats.getAll();
  }

  // Settings methods
  toggleCatalogMode(enable: boolean) {
    return this.settings.toggleCatalogMode(enable);
  }
}

export const wooCommerceApi = new WooCommerceApi();
