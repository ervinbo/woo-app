
import { WooCommerceApi } from './core';

export const productsService = {
  // Simplified product data preparation
  prepareProductData(data: any): any {
    const processedData = { ...data };
    
    // Remove ID for new products
    if (processedData.id) {
      delete processedData.id;
    }
    
    // Process images if they exist
    if (processedData.images && processedData.images.length > 0) {
      processedData.images = processedData.images.map((image: any) => {
        // For base64 images
        if (image.src && image.src.startsWith('data:image')) {
          return { alt: image.alt || '', src: image.src };
        }
        // For existing images
        if (image.id) {
          return { id: image.id };
        }
        // For images with URL
        return { src: image.src, alt: image.alt || '' };
      });
    }
    
    // Format prices as strings
    if (processedData.regular_price !== undefined) {
      processedData.regular_price = String(processedData.regular_price);
    }
    
    if (processedData.sale_price !== undefined) {
      processedData.sale_price = processedData.sale_price === '' ? '' : String(processedData.sale_price);
    }
    
    // Convert stock quantity to number if manage_stock is enabled
    if (processedData.manage_stock && processedData.stock_quantity !== undefined) {
      processedData.stock_quantity = parseInt(String(processedData.stock_quantity), 10);
    }
    
    // Simplify categories handling
    if (processedData.categories && Array.isArray(processedData.categories)) {
      processedData.categories = processedData.categories.map((cat: any) => 
        typeof cat === 'number' ? { id: cat } : { id: cat.id }
      );
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
