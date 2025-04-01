
import { toast } from "@/lib/toast";

export interface WooCommerceCredentials {
  siteUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

export class WooCommerceApiCore {
  protected siteUrl: string = '';
  protected consumerKey: string = '';
  protected consumerSecret: string = '';
  protected isAuthenticated: boolean = false;

  constructor() {
    // Učitaj kredencijale iz localStorage
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

  protected getAuthHeader(): string {
    return 'Basic ' + btoa(this.consumerKey + ':' + this.consumerSecret);
  }

  protected getApiUrl(endpoint: string): string {
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
        options.body = JSON.stringify(data);
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
}
