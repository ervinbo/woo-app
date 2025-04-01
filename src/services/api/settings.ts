
import { WooCommerceApi } from './core';
import { toast } from "@/lib/toast";

export const settingsService = {
  async toggleCatalogMode(api: WooCommerceApi, enable: boolean): Promise<any> {
    if (!api.getAuthStatus()) {
      throw new Error('Niste autentifikovani. Unesite svoje WooCommerce API kredencijale.');
    }

    try {
      const url = `${api.getApiUrl('custom/v1/catalog-mode')}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': api.getAuthHeader()
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
};
