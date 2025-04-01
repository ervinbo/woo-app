
import { WooCommerceApi } from './core';

export const productsService = {
  // Helper function to prepare product data
  prepareProductData(data: any): any {
    // Create a copy to avoid modifying original data
    const processedData = { ...data };
    
    // Remove ID from data if present - WooCommerce doesn't allow sending ID for new products
    if (processedData.id) {
      delete processedData.id;
    }
    
    // Process images if they exist
    if (processedData.images && processedData.images.length > 0) {
      processedData.images = processedData.images.map((image: any) => {
        // If image source is base64 URL data, process it
        if (image.src && image.src.startsWith('data:image')) {
          return {
            alt: image.alt || '',
            src: image.src  // Send the full src, server will process it
          };
        }
        // For existing images, send only id
        if (image.id) {
          return { id: image.id };
        }
        // For images with URL, send src
        return { src: image.src, alt: image.alt || '' };
      });
    }
    
    // Check and format prices (always as string)
    if (processedData.regular_price !== undefined) {
      processedData.regular_price = String(processedData.regular_price);
    }
    
    if (processedData.sale_price !== undefined && processedData.sale_price !== '') {
      processedData.sale_price = String(processedData.sale_price);
    } else if (processedData.sale_price === '') {
      // Send empty string to remove sale price
      processedData.sale_price = '';
    }
    
    // Ensure stock_quantity is a number if manage_stock is enabled
    if (processedData.manage_stock && processedData.stock_quantity !== undefined) {
      processedData.stock_quantity = parseInt(String(processedData.stock_quantity), 10);
    }
    
    // Prepare categories if they exist
    if (processedData.categories && Array.isArray(processedData.categories)) {
      // Ako su kategorije već u obliku objekta sa id, zadrži ih
      if (processedData.categories.length > 0 && typeof processedData.categories[0] === 'object') {
        // No change needed
      } 
      // If categories are an array of IDs, convert them to an array of objects with ID
      else if (processedData.categories.length > 0 && typeof processedData.categories[0] === 'number') {
        processedData.categories = processedData.categories.map((id: number) => ({ id }));
      }
    }
    
    return processedData;
  },

  // Product methods
  async getProducts(api: WooCommerceApi, page = 1, perPage = 10): Promise<any> {
    return api.request(`products?page=${page}&per_page=${perPage}`);
  },

  async getProduct(api: WooCommerceApi, id: number): Promise<any> {
    return api.request(`products/${id}`);
  },

  async createProduct(api: WooCommerceApi, productData: any): Promise<any> {
    const processedData = this.prepareProductData(productData);
    return api.request('products', 'POST', processedData);
  },

  async updateProduct(api: WooCommerceApi, id: number, productData: any): Promise<any> {
    const processedData = this.prepareProductData(productData);
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
