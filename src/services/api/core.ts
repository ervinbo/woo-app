
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

  constructor() {
    // Try to load credentials from localStorage
    this.loadCredentials();
  }

  // Core authentication methods
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
    // Proveri da li endpoint već sadrži "wp-json"
    if (endpoint.includes('wp-json')) {
      return `${this.siteUrl}/${endpoint}`;
    }
    return `${this.siteUrl}/wp-json/wc/v3/${endpoint}`;
  }

  async request<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
    data?: any
  ): Promise<T> {
    if (!this.isAuthenticated) {
      throw new Error('Niste autentifikovani. Unesite svoje WooCommerce API kredencijale.');
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
        // Pripremi podatke pre slanja API-ju
        const processedData = productsService.prepareProductData(data);
        options.body = JSON.stringify(processedData);
      }

      console.log(`Slanje ${method} zahteva na ${url}`, options);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API zahtev nije uspeo sa statusom ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Ako ne može da se parsira kao JSON, koristi originalni tekst
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        console.error('API greška:', errorMessage);
        throw new Error(errorMessage);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API zahtev nije uspeo:', error);
      if (error instanceof Error) {
        toast.error(`API Greška: ${error.message}`);
      } else {
        toast.error('Došlo je do nepoznate greške sa API zahtevom');
      }
      throw error;
    }
  }

  // Service properties to expose methods from service modules
  get products() {
    return {
      getAll: (page = 1, perPage = 10) => productsService.getProducts(this, page, perPage),
      get: (id: number) => productsService.getProduct(this, id),
      create: (productData: any) => productsService.createProduct(this, productData),
      update: (id: number, productData: any) => productsService.updateProduct(this, id, productData),
      delete: (id: number) => productsService.deleteProduct(this, id),
      getCategories: () => productsService.getCategories(this)
    };
  }

  get orders() {
    return {
      getAll: (page = 1, perPage = 10, status = '') => ordersService.getOrders(this, page, perPage, status),
      get: (id: number) => ordersService.getOrder(this, id),
      updateStatus: (id: number, status: string) => ordersService.updateOrderStatus(this, id, status)
    };
  }

  get customers() {
    return {
      getAll: (page = 1, perPage = 10) => customersService.getCustomers(this, page, perPage),
      get: (id: number) => customersService.getCustomer(this, id)
    };
  }

  get stats() {
    return {
      getAll: () => statsService.getStats(this)
    };
  }

  get settings() {
    return {
      toggleCatalogMode: (enable: boolean) => settingsService.toggleCatalogMode(this, enable)
    };
  }

  // Legacy methods to maintain backward compatibility
  getProducts(page = 1, perPage = 10) {
    return this.products.getAll(page, perPage);
  }

  getProduct(id: number) {
    return this.products.get(id);
  }

  createProduct(productData: any) {
    return this.products.create(productData);
  }

  updateProduct(id: number, productData: any) {
    return this.products.update(id, productData);
  }

  deleteProduct(id: number) {
    return this.products.delete(id);
  }

  getCategories() {
    return this.products.getCategories();
  }

  getOrders(page = 1, perPage = 10, status = '') {
    return this.orders.getAll(page, perPage, status);
  }

  getOrder(id: number) {
    return this.orders.get(id);
  }

  updateOrderStatus(id: number, status: string) {
    return this.orders.updateStatus(id, status);
  }

  getCustomers(page = 1, perPage = 10) {
    return this.customers.getAll(page, perPage);
  }

  getCustomer(id: number) {
    return this.customers.get(id);
  }

  getStats() {
    return this.stats.getAll();
  }

  toggleCatalogMode(enable: boolean) {
    return this.settings.toggleCatalogMode(enable);
  }
}

export const wooCommerceApi = new WooCommerceApi();
