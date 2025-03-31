
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
        let processedData = { ...data };
        
        // Ograniči polja koja se šalju na API
        if (processedData.images && processedData.images.length > 0) {
          processedData.images = processedData.images.map((image: any) => {
            // Ako je izvor slike base64 URL podatak, obradi ga
            if (image.src && image.src.startsWith('data:image')) {
              return {
                alt: image.alt || '',
                base64_img: image.src.split(',')[1]  // Izvuci base64 podatke bez data:image prefiksa
              };
            }
            // Za postojeće slike, pošalji samo id
            if (image.id) {
              return { id: image.id };
            }
            // Za slike sa URL-om, pošalji src
            return { src: image.src, alt: image.alt || '' };
          });
        }
        
        // Proveri i formatíraj numerička polja
        if (processedData.regular_price) {
          processedData.regular_price = String(processedData.regular_price);
        }
        
        if (processedData.sale_price) {
          processedData.sale_price = String(processedData.sale_price);
        }
        
        if (processedData.manage_stock && processedData.stock_quantity) {
          processedData.stock_quantity = parseInt(String(processedData.stock_quantity), 10);
        }
        
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

  // Products
  async getProducts(page = 1, perPage = 10): Promise<any> {
    return this.request(`products?page=${page}&per_page=${perPage}`);
  }

  async getProduct(id: number): Promise<any> {
    return this.request(`products/${id}`);
  }

  async createProduct(productData: any): Promise<any> {
    // Filtriramo nepotrebna polja koja mogu izazvati probleme sa API-jem
    const { id, ...filteredData } = productData;
    return this.request('products', 'POST', filteredData);
  }

  async updateProduct(id: number, productData: any): Promise<any> {
    // Filtriramo nepotrebna polja koja mogu izazvati probleme sa API-jem
    const { id: productId, ...filteredData } = productData;
    return this.request(`products/${id}`, 'PUT', filteredData);
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
      console.error('Nije uspelo preuzimanje statistike:', error);
      return {
        recentOrders: [],
        productStats: [],
        customerStats: []
      };
    }
  }

  // Catalog Mode
  async toggleCatalogMode(enable: boolean): Promise<any> {
    if (!this.isAuthenticated) {
      throw new Error('Niste autentifikovani. Unesite svoje WooCommerce API kredencijale.');
    }

    try {
      const url = `${this.siteUrl}/wp-json/custom/v1/catalog-mode`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify({ enable })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API zahtev nije uspeo sa statusom ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Greška u postavljanju catalog mode:', error);
      if (error instanceof Error) {
        toast.error(`Catalog Mode Greška: ${error.message}`);
      } else {
        toast.error('Došlo je do nepoznate greške pri menjanju catalog mode');
      }
      throw error;
    }
  }
}

// Export a singleton instance
export const wooCommerceApi = new WooCommerceApi();
