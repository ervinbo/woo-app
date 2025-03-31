
import { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { wooCommerceApi, WooCommerceCredentials } from '@/services/api';

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
        console.error('Грешка приликом анализе сачуваних веродајница:', error);
      }
    }
    
    // Apply theme color on load
    applyThemeColor(savedTheme);
  }, []);

  const applyThemeColor = (colorValue: string) => {
    const THEME_COLORS = [
      { name: 'Подразумевана плава', value: 'blue', hsl: '214 80% 51%' },
      { name: 'Зелена', value: 'green', hsl: '142 76% 36%' },
      { name: 'Љубичаста', value: 'purple', hsl: '270 76% 40%' },
      { name: 'Црвена', value: 'red', hsl: '0 84% 60%' },
      { name: 'Наранџаста', value: 'orange', hsl: '24 100% 50%' },
    ];
    
    const selectedColor = THEME_COLORS.find(c => c.value === colorValue);
    if (selectedColor) {
      document.documentElement.style.setProperty('--primary', selectedColor.hsl);
    }
  };

  const handleSetting = (key: string, value: any) => {
    setIsLoading(true);
    try {
      // In a real app, we would call the WooCommerce API to update settings
      // For demo, we'll just use localStorage
      localStorage.setItem(`woo${key}`, value.toString());
      
      // Update local state based on the key
      switch(key) {
        case 'CatalogMode':
          setCatalogMode(value);
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
      
      // Simulate API call
      toast.success(`Подешавање успешно ажурирано`);
    } catch (error) {
      toast.error('Није успело ажурирање подешавања');
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
      // Validate inputs
      if (!apiCredentials.siteUrl) {
        toast.error('URL сајта је обавезан');
        setIsLoading(false);
        return;
      }
      
      if (!apiCredentials.siteUrl.startsWith('https://') && !apiCredentials.siteUrl.startsWith('http://')) {
        toast.error('URL сајта мора почињати са http:// или https://');
        setIsLoading(false);
        return;
      }
      
      if (!apiCredentials.consumerKey || !apiCredentials.consumerSecret) {
        toast.error('Кориснички кључ и тајна су обавезни');
        setIsLoading(false);
        return;
      }
      
      // Save credentials to API service and localStorage
      wooCommerceApi.saveCredentials(apiCredentials);
      toast.success('API веродајнице сачуване успешно');
      
      // Test connection
      testConnection();
    } catch (error) {
      toast.error('Није успело чување веродајница');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Try to fetch a small amount of data to test the connection
      await wooCommerceApi.getProducts(1, 1);
      toast.success('Успешна веза! API веродајнице раде.');
    } catch (error) {
      toast.error('Веза није успела. Проверите ваше веродајнице.');
      console.error('API тест везе није успео:', error);
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
