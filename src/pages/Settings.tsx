
import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';
import { wooCommerceApi, WooCommerceCredentials } from '@/services/api';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ShoppingCart, Tag, Package, Truck, Shield, CreditCard, Key } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const THEME_COLORS = [
  { name: 'Default Blue', value: 'blue', hsl: '214 80% 51%' },
  { name: 'Green', value: 'green', hsl: '142 76% 36%' },
  { name: 'Purple', value: 'purple', hsl: '270 76% 40%' },
  { name: 'Red', value: 'red', hsl: '0 84% 60%' },
  { name: 'Orange', value: 'orange', hsl: '24 100% 50%' },
];

const Settings = () => {
  const [catalogMode, setCatalogMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [isLoading, setIsLoading] = useState(false);
  
  // WooCommerce settings
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
    const selectedColor = THEME_COLORS.find(c => c.value === colorValue);
    if (selectedColor) {
      document.documentElement.style.setProperty('--primary', selectedColor.hsl);
    }
  };

  const handleThemeChange = (value: string) => {
    setCurrentTheme(value);
    localStorage.setItem('wooTheme', value);
    applyThemeColor(value);
    toast.success('Theme updated');
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

  return (
    <MobileLayout title="Settings">
      <div className="space-y-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how your dashboard looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Theme Color</h3>
                <RadioGroup 
                  value={currentTheme} 
                  onValueChange={handleThemeChange}
                  className="flex flex-wrap gap-3"
                >
                  {THEME_COLORS.map((color) => (
                    <div key={color.value} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={color.value} 
                        id={`theme-${color.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`theme-${color.value}`}
                        className="flex items-center gap-2 rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span 
                          className="h-6 w-6 rounded-full" 
                          style={{ background: `hsl(${color.hsl})` }}
                        />
                        <span>{color.name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              WooCommerce Settings
            </CardTitle>
            <CardDescription>Configure your store settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="catalog-mode">Catalog Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Hide prices and disable purchasing
                </p>
              </div>
              <Switch
                id="catalog-mode"
                checked={catalogMode}
                onCheckedChange={(value) => handleSetting('CatalogMode', value)}
                disabled={isLoading}
              />
            </div>

            <Separator />
            
            {/* Products section */}
            <Collapsible open={settingsSections.products} onOpenChange={() => toggleSection('products')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-2">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    <span>Product Settings</span>
                  </div>
                  {settingsSections.products ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 px-1 pt-2">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="stock-management">Stock Management</Label>
                    <p className="text-sm text-muted-foreground">
                      Track inventory and manage stock levels
                    </p>
                  </div>
                  <Switch
                    id="stock-management"
                    checked={stockManagement}
                    onCheckedChange={(value) => handleSetting('StockManagement', value)}
                    disabled={isLoading}
                  />
                </div>
                
                {stockManagement && (
                  <div className="space-y-2">
                    <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
                    <Input
                      id="low-stock-threshold"
                      type="number"
                      min="0"
                      value={lowStockThreshold}
                      onChange={(e) => handleSetting('LowStockThreshold', parseInt(e.target.value))}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Get notified when product stock reaches this level
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="reviews-enabled">Product Reviews</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to leave product reviews
                    </p>
                  </div>
                  <Switch
                    id="reviews-enabled"
                    checked={reviewsEnabled}
                    onCheckedChange={(value) => handleSetting('ReviewsEnabled', value)}
                    disabled={isLoading}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Separator />
            
            {/* Shipping section */}
            <Collapsible open={settingsSections.shipping} onOpenChange={() => toggleSection('shipping')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-2">
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    <span>Shipping Settings</span>
                  </div>
                  {settingsSections.shipping ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 px-1 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="shipping-notice">Shipping Notice</Label>
                  <Textarea
                    id="shipping-notice"
                    value={shippingNotice}
                    onChange={(e) => handleSetting('ShippingNotice', e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter shipping information to display to customers"
                  />
                  <p className="text-xs text-muted-foreground">
                    This notice will be displayed during checkout
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Separator />
            
            {/* Checkout section */}
            <Collapsible open={settingsSections.checkout} onOpenChange={() => toggleSection('checkout')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-2">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    <span>Checkout Settings</span>
                  </div>
                  {settingsSections.checkout ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 px-1 pt-2">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="guest-checkout">Guest Checkout</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to checkout without creating an account
                    </p>
                  </div>
                  <Switch
                    id="guest-checkout"
                    checked={guestCheckout}
                    onCheckedChange={(value) => handleSetting('GuestCheckout', value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="order-notifications">Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for new orders
                    </p>
                  </div>
                  <Switch
                    id="order-notifications"
                    checked={orderNotifications}
                    onCheckedChange={(value) => handleSetting('OrderNotifications', value)}
                    disabled={isLoading}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Separator />
            
            {/* Taxes section */}
            <Collapsible open={settingsSections.taxes} onOpenChange={() => toggleSection('taxes')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-2">
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    <span>Tax Settings</span>
                  </div>
                  {settingsSections.taxes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 px-1 pt-2">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="tax-included">Prices Include Tax</Label>
                    <p className="text-sm text-muted-foreground">
                      Display prices with tax included
                    </p>
                  </div>
                  <Switch
                    id="tax-included"
                    checked={taxIncludedInPrice}
                    onCheckedChange={(value) => handleSetting('TaxIncluded', value)}
                    disabled={isLoading}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Separator />
            
            {/* API Keys section */}
            <Collapsible open={settingsSections.api} onOpenChange={() => toggleSection('api')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-2">
                  <div className="flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    <span>REST API Keys</span>
                  </div>
                  {settingsSections.api ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 px-1 pt-2">
                <div className="space-y-1 mb-2">
                  <p className="text-sm text-muted-foreground">
                    Enter your WooCommerce REST API credentials to connect to your store
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="site-url">Site URL</Label>
                    <Input
                      id="site-url"
                      type="url"
                      placeholder="https://yourstorename.com"
                      value={apiCredentials.siteUrl}
                      onChange={(e) => handleCredentialChange('siteUrl', e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      The full URL to your WooCommerce store
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="consumer-key">Consumer Key</Label>
                    <Input
                      id="consumer-key"
                      type="password"
                      placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={apiCredentials.consumerKey}
                      onChange={(e) => handleCredentialChange('consumerKey', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="consumer-secret">Consumer Secret</Label>
                    <Input
                      id="consumer-secret"
                      type="password"
                      placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={apiCredentials.consumerSecret}
                      onChange={(e) => handleCredentialChange('consumerSecret', e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      You can generate these keys from WooCommerce &gt; Settings &gt; Advanced &gt; REST API
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button
                      onClick={saveCredentials}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      Save Credentials
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={testConnection}
                      disabled={isLoading || !wooCommerceApi.getAuthStatus()}
                      className="w-full sm:w-auto"
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Settings;
