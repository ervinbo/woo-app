import { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { wooCommerceApi, WooCommerceCredentials, settingsService } from '@/services/api';

export const useSettings = () => {
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [isLoading, setIsLoading] = useState(false);
  const [catalogMode, setCatalogMode] = useState(false);
  const [stockManagement, setStockManagement] = useState(true);
  const [reviewsEnabled, setReviewsEnabled] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [settingsSections, setSettingsSections] = useState({
    products: true,
    api: false,
  });
  
  // API credentials
  const [apiCredentials, setApiCredentials] = useState<WooCommerceCredentials>({
    siteUrl: '',
    consumerKey: '',
    consumerSecret: '',
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedTheme = localStorage.getItem('wooTheme') || 'blue';
    setCurrentTheme(savedTheme);
    
    const savedCatalogMode = localStorage.getItem('wooCatalogMode') === 'true';
    setCatalogMode(savedCatalogMode);
    
    const savedStockManagement = localStorage.getItem('wooStockManagement') !== 'false';
    setStockManagement(savedStockManagement);
    
    const savedReviewsEnabled = localStorage.getItem('wooReviewsEnabled') !== 'false';
    setReviewsEnabled(savedReviewsEnabled);
    
    const savedLowStockThreshold = parseInt(localStorage.getItem('wooLowStockThreshold') || '5');
    setLowStockThreshold(savedLowStockThreshold);
    
    // Load API credentials if they exist
    const savedCredentials = localStorage.getItem('woocommerce_credentials');
    if (savedCredentials) {
      try {
        setApiCredentials(JSON.parse(savedCredentials));
      } catch (error) {
        console.error('Greška prilikom analize sačuvanih kredencijala:', error);
      }
    }
    
    // Apply theme color on load
    applyThemeColor(savedTheme);
  }, []);

  const applyThemeColor = (colorValue: string) => {
    const THEME_COLORS = [
      { name: 'Podrazumevana plava', value: 'blue', hsl: '214 80% 51%' },
      { name: 'Zelena', value: 'green', hsl: '142 76% 36%' },
      { name: 'Ljubičasta', value: 'purple', hsl: '270 76% 40%' },
      { name: 'Crvena', value: 'red', hsl: '0 84% 60%' },
      { name: 'Narandžasta', value: 'orange', hsl: '24 100% 50%' },
    ];
    
    const selectedColor = THEME_COLORS.find(c => c.value === colorValue);
    if (selectedColor) {
      document.documentElement.style.setProperty('--primary', selectedColor.hsl);
    }
  };

  const handleSetting = async (key: string, value: any) => {
    setIsLoading(true);
    try {
      // Sačuvaj u localStorage za perzistentnost na klijentu
      localStorage.setItem(`woo${key}`, value.toString());
      
      // Ažuriraj lokalno stanje na osnovu ključa
      switch(key) {
        case 'CatalogMode':
          setCatalogMode(value);
          
          // Pozovi WordPress REST API za Catalog Mode
          if (apiCredentials.siteUrl) {
            try {
              await settingsService.toggleCatalogMode(value);
            } catch (apiError) {
              console.error('Greška pri pozivu WordPress API-ja:', apiError);
              toast.error(`Ažuriranje catalog mode-a na WordPress sajtu nije uspelo: ${apiError instanceof Error ? apiError.message : 'Nepoznata greška'}`);
            }
          }
          break;
        case 'StockManagement':
          setStockManagement(value);
          break;
        case 'ReviewsEnabled':
          setReviewsEnabled(value);
          break;
        case 'LowStockThreshold':
          setLowStockThreshold(value);
          break;
      }
      
      toast.success(`Podešavanje uspešno ažurirano`);
    } catch (error) {
      toast.error('Nije uspelo ažuriranje podešavanja');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof settingsSections) => {
    setSettingsSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const handleCredentialChange = (field: keyof WooCommerceCredentials, value: string) => {
    setApiCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const saveCredentials = () => {
    setIsLoading(true);
    try {
      // Validiraj unose
      if (!apiCredentials.siteUrl) {
        toast.error('URL sajta je obavezan');
        setIsLoading(false);
        return;
      }
      
      if (!apiCredentials.siteUrl.startsWith('https://') && !apiCredentials.siteUrl.startsWith('http://')) {
        toast.error('URL sajta mora počinjati sa http:// ili https://');
        setIsLoading(false);
        return;
      }
      
      if (!apiCredentials.consumerKey || !apiCredentials.consumerSecret) {
        toast.error('Korisnički ključ i tajna su obavezni');
        setIsLoading(false);
        return;
      }
      
      // Sačuvaj kredencijale u API servis i localStorage
      wooCommerceApi.saveCredentials(apiCredentials);
      toast.success('API kredencijali sačuvani uspešno');
      
      // Testiraj vezu
      testConnection();
    } catch (error) {
      toast.error('Nije uspelo čuvanje kredencijala');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Pokušaj da dobiješ malu količinu podataka da testiraš vezu
      await productsService.getProducts(1, 1);
      toast.success('Uspešna veza! API kredencijali rade.');
    } catch (error) {
      toast.error('Veza nije uspela. Proverite vaše kredencijale.');
      console.error('API test veze nije uspeo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentTheme,
    setCurrentTheme,
    isLoading,
    catalogMode,
    stockManagement,
    reviewsEnabled,
    lowStockThreshold,
    settingsSections,
    apiCredentials,
    handleSetting,
    toggleSection,
    handleCredentialChange,
    saveCredentials,
    testConnection,
  };
};
