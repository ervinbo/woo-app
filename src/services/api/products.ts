
import { WooCommerceApi } from './core';

export const productsService = {
  // Simple product data preparation
  prepareProductData(data: any): any {
    // Create a clean copy
    const processedData = { ...data };
    
    // Remove ID for new products
    if (processedData.id) {
      delete processedData.id;
    }
    
    // Handle basic price formatting
    if (processedData.regular_price !== undefined) {
      processedData.regular_price = String(processedData.regular_price);
    }
    
    if (processedData.sale_price !== undefined) {
      processedData.sale_price = processedData.sale_price === '' ? '' : String(processedData.sale_price);
    }
    
    // Handle stock quantity
    if (processedData.manage_stock && processedData.stock_quantity !== undefined) {
      processedData.stock_quantity = parseInt(String(processedData.stock_quantity), 10);
    }
    
    console.log("Prepared product data:", processedData);
    return processedData;
  },

  // Basic product API methods
  async getProducts(api: WooCommerceApi, page = 1, perPage = 10): Promise<any> {
    return api.request(`products?page=${page}&per_page=${perPage}`);
  },

  async getProduct(api: WooCommerceApi, id: number): Promise<any> {
    return api.request(`products/${id}`);
  },

  async createProduct(api: WooCommerceApi, productData: any): Promise<any> {
    console.log("Creating product with data:", productData);
    const processedData = this.prepareProductData(productData);
    console.log("Processed data for create:", processedData);
    return api.request('products', 'POST', processedData);
  },

  async updateProduct(api: WooCommerceApi, id: number, productData: any): Promise<any> {
    console.log("Updating product with ID:", id);
    const processedData = this.prepareProductData(productData);
    console.log("Processed data for update:", processedData);
    return api.request(`products/${id}`, 'PUT', processedData);
  },

  async deleteProduct(api: WooCommerceApi, id: number): Promise<any> {
    return api.request(`products/${id}`, 'DELETE');
  },

  // Categories
  async getCategories(api: WooCommerceApi): Promise<any> {
    return api.request('products/categories?per_page=100');
  }
};
