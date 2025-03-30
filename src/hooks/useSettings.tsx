
import { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { wooCommerceApi, WooCommerceCredentials } from '@/services/api';

export const useSettings = () => {
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [isLoading, setIsLoading] = useState(false);
  const [catalogMode, setCatalogMode] = useState(false);
  const [stockManagement, setStockManagement] = useState(true);
  const [reviewsEnabled, setReviewsEnabled] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [shippingNotice, setShippingNotice] = useState('Orders usually ship within 2-3 business days.');
  const [taxIncludedInPrice, setTaxIncludedInPrice] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(true);
  const [settingsSections, setSettingsSections] = useState({
    products: true,
    shipping: false,
    checkout: false,
    taxes: false,
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
    
    const savedOrderNotifications = localStorage.getItem('wooOrderNotifications') !== 'false';
    setOrderNotifications(savedOrderNotifications);
    
    const savedLowStockThreshold = parseInt(localStorage.getItem('wooLowStockThreshold') || '5');
    setLowStockThreshold(savedLowStockThreshold);
    
    const savedShippingNotice = localStorage.getItem('wooShippingNotice') || 'Orders usually ship within 2-3 business days.';
    setShippingNotice(savedShippingNotice);
    
    const savedTaxIncluded = localStorage.getItem('wooTaxIncluded') === 'true';
    setTaxIncludedInPrice(savedTaxIncluded);
    
    const savedGuestCheckout = localStorage.getItem('wooGuestCheckout') !== 'false';
    setGuestCheckout(savedGuestCheckout);
    
    // Load API credentials if they exist
    const savedCredentials = localStorage.getItem('woocommerce_credentials');
    if (savedCredentials) {
      try {
        setApiCredentials(JSON.parse(savedCredentials));
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
      }
    }
    
    // Apply theme color on load
    applyThemeColor(savedTheme);
  }, []);

  const applyThemeColor = (colorValue: string) => {
    const THEME_COLORS = [
      { name: 'Default Blue', value: 'blue', hsl: '214 80% 51%' },
      { name: 'Green', value: 'green', hsl: '142 76% 36%' },
      { name: 'Purple', value: 'purple', hsl: '270 76% 40%' },
      { name: 'Red', value: 'red', hsl: '0 84% 60%' },
      { name: 'Orange', value: 'orange', hsl: '24 100% 50%' },
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
        case 'OrderNotifications':
          setOrderNotifications(value);
          break;
        case 'LowStockThreshold':
          setLowStockThreshold(value);
          break;
        case 'ShippingNotice':
          setShippingNotice(value);
          break;
        case 'TaxIncluded':
          setTaxIncludedInPrice(value);
          break;
        case 'GuestCheckout':
          setGuestCheckout(value);
          break;
      }
      
      // Simulate API call
      toast.success(`Setting updated successfully`);
    } catch (error) {
      toast.error('Failed to update setting');
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
        toast.error('Site URL is required');
        setIsLoading(false);
        return;
      }
      
      if (!apiCredentials.siteUrl.startsWith('https://') && !apiCredentials.siteUrl.startsWith('http://')) {
        toast.error('Site URL must start with http:// or https://');
        setIsLoading(false);
        return;
      }
      
      if (!apiCredentials.consumerKey || !apiCredentials.consumerSecret) {
        toast.error('Consumer Key and Consumer Secret are required');
        setIsLoading(false);
        return;
      }
      
      // Save credentials to API service and localStorage
      wooCommerceApi.saveCredentials(apiCredentials);
      toast.success('API credentials saved successfully');
      
      // Test connection
      testConnection();
    } catch (error) {
      toast.error('Failed to save credentials');
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
      toast.success('Connection successful! API credentials are working.');
    } catch (error) {
      toast.error('Connection failed. Please check your credentials.');
      console.error('API connection test failed:', error);
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
    orderNotifications,
    lowStockThreshold,
    shippingNotice,
    taxIncludedInPrice,
    guestCheckout,
    settingsSections,
    apiCredentials,
    handleSetting,
    toggleSection,
    handleCredentialChange,
    saveCredentials,
    testConnection,
  };
};
