
import { WooCommerceApiCore } from './core';

export class ProductsService extends WooCommerceApiCore {
  // Pomoćna funkcija za pripremu podataka proizvoda pre slanja na API
  prepareProductData(data: any): any {
    // Napravi kopiju da ne menjamo originalne podatke
    const processedData = { ...data };
    
    // Ukloni ID iz podataka ako je prisutan - WooCommerce ne dozvoljava slanje ID-a
    if (processedData.id) {
      delete processedData.id;
    }
    
    // Obradi slike ako postoje
    if (processedData.images && processedData.images.length > 0) {
      processedData.images = processedData.images.map((image: any) => {
        // Ako je izvor slike base64 URL podatak, obradi ga
        if (image.src && image.src.startsWith('data:image')) {
          return {
            alt: image.alt || '',
            src: image.src  // Pošalji ceo src, server će ga obraditi
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
    
    // Proveri i formatiraj cene (uvek kao string)
    if (processedData.regular_price !== undefined) {
      processedData.regular_price = String(processedData.regular_price);
    }
    
    if (processedData.sale_price !== undefined && processedData.sale_price !== '') {
      processedData.sale_price = String(processedData.sale_price);
    } else if (processedData.sale_price === '') {
      // Pošalji empty string za uklanjanje akcijske cene
      processedData.sale_price = '';
    }
    
    // Osiguraj da je stock_quantity broj ako je manage_stock uključen
    if (processedData.manage_stock && processedData.stock_quantity !== undefined) {
      processedData.stock_quantity = parseInt(String(processedData.stock_quantity), 10);
    }
    
    // Pripremi kategorije ako postoje
    if (processedData.categories && Array.isArray(processedData.categories)) {
      // Ako su kategorije već u obliku objekta sa id, zadrži ih
      if (processedData.categories.length > 0 && typeof processedData.categories[0] === 'object') {
        // Ništa ne menjamo
      } 
      // Ako su kategorije niz ID-eva, pretvori ih u niz objekata sa ID
      else if (processedData.categories.length > 0 && typeof processedData.categories[0] === 'number') {
        processedData.categories = processedData.categories.map((id: number) => ({ id }));
      }
    }
    
    return processedData;
  }

  async getProducts(page = 1, perPage = 10): Promise<any> {
    return this.request(`products?page=${page}&per_page=${perPage}`);
  }

  async getProduct(id: number): Promise<any> {
    return this.request(`products/${id}`);
  }

  async createProduct(productData: any): Promise<any> {
    const preparedData = this.prepareProductData(productData);
    return this.request('products', 'POST', preparedData);
  }

  async updateProduct(id: number, productData: any): Promise<any> {
    const preparedData = this.prepareProductData(productData);
    return this.request(`products/${id}`, 'PUT', preparedData);
  }

  async deleteProduct(id: number): Promise<any> {
    return this.request(`products/${id}`, 'DELETE');
  }

  async getCategories(): Promise<any> {
    return this.request('products/categories?per_page=100');
  }
}

export const productsService = new ProductsService();
