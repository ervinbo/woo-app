
import { WooCommerceApiCore, WooCommerceCredentials } from './core';
import { productsService } from './products';
import { ordersService } from './orders';
import { customersService } from './customers';
import { statsService } from './stats';
import { settingsService } from './settings';

// API objekat koji objedinjuje sve servise
class WooCommerceApi extends WooCommerceApiCore {
  products = productsService;
  orders = ordersService;
  customers = customersService;
  stats = statsService;
  settings = settingsService;

  // Override saveCredentials da ažurira kredencijale u svim servisima
  saveCredentials(credentials: WooCommerceCredentials): void {
    super.saveCredentials(credentials);
    this.products.loadCredentials();
    this.orders.loadCredentials();
    this.customers.loadCredentials();
    this.stats.loadCredentials();
    this.settings.loadCredentials();
  }

  // Override clearCredentials da očisti kredencijale u svim servisima
  clearCredentials(): void {
    super.clearCredentials();
    this.products.loadCredentials();
    this.orders.loadCredentials();
    this.customers.loadCredentials();
    this.stats.loadCredentials();
    this.settings.loadCredentials();
  }
}

// Izvoz jedinstvene instance
export const wooCommerceApi = new WooCommerceApi();

// Izvoz tipova i individualnih servisa za direktan pristup
export type { WooCommerceCredentials } from './core';
export { productsService } from './products';
export { ordersService } from './orders';
export { customersService } from './customers';
export { statsService } from './stats';
export { settingsService } from './settings';
