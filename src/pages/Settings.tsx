
import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Tag, Package, Truck, Shield, CreditCard, Key } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { wooCommerceApi } from '@/services/api';

// Import refactored components
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import SettingsSection from '@/components/settings/SettingsSection';
import ProductSettings from '@/components/settings/ProductSettings';
import ShippingSettings from '@/components/settings/ShippingSettings';
import CheckoutSettings from '@/components/settings/CheckoutSettings';
import TaxSettings from '@/components/settings/TaxSettings';
import ApiKeySettings from '@/components/settings/ApiKeySettings';
import CatalogModeToggle from '@/components/settings/CatalogModeToggle';

const Settings = () => {
  const {
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
  } = useSettings();

  return (
    <MobileLayout title="Settings">
      <div className="space-y-4 pb-20">
        <AppearanceSettings 
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              WooCommerce Settings
            </CardTitle>
            <CardDescription>Configure your store settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CatalogModeToggle 
              catalogMode={catalogMode} 
              isLoading={isLoading} 
              handleSetting={handleSetting} 
            />

            <Separator />
            
            {/* Products section */}
            <SettingsSection 
              title="Product Settings"
              icon={<Package className="h-5 w-5 mr-2" />}
              isOpen={settingsSections.products}
              onToggle={() => toggleSection('products')}
            >
              <ProductSettings 
                stockManagement={stockManagement}
                lowStockThreshold={lowStockThreshold}
                reviewsEnabled={reviewsEnabled}
                isLoading={isLoading}
                handleSetting={handleSetting}
              />
            </SettingsSection>
            
            <Separator />
            
            {/* Shipping section */}
            <SettingsSection 
              title="Shipping Settings"
              icon={<Truck className="h-5 w-5 mr-2" />}
              isOpen={settingsSections.shipping}
              onToggle={() => toggleSection('shipping')}
            >
              <ShippingSettings 
                shippingNotice={shippingNotice}
                isLoading={isLoading}
                handleSetting={handleSetting}
              />
            </SettingsSection>
            
            <Separator />
            
            {/* Checkout section */}
            <SettingsSection 
              title="Checkout Settings"
              icon={<CreditCard className="h-5 w-5 mr-2" />}
              isOpen={settingsSections.checkout}
              onToggle={() => toggleSection('checkout')}
            >
              <CheckoutSettings 
                guestCheckout={guestCheckout}
                orderNotifications={orderNotifications}
                isLoading={isLoading}
                handleSetting={handleSetting}
              />
            </SettingsSection>
            
            <Separator />
            
            {/* Taxes section */}
            <SettingsSection 
              title="Tax Settings"
              icon={<Tag className="h-5 w-5 mr-2" />}
              isOpen={settingsSections.taxes}
              onToggle={() => toggleSection('taxes')}
            >
              <TaxSettings 
                taxIncludedInPrice={taxIncludedInPrice}
                isLoading={isLoading}
                handleSetting={handleSetting}
              />
            </SettingsSection>
            
            <Separator />
            
            {/* API Keys section */}
            <SettingsSection 
              title="REST API Keys"
              icon={<Key className="h-5 w-5 mr-2" />}
              isOpen={settingsSections.api}
              onToggle={() => toggleSection('api')}
            >
              <ApiKeySettings 
                apiCredentials={apiCredentials}
                isLoading={isLoading}
                handleCredentialChange={handleCredentialChange}
                saveCredentials={saveCredentials}
                testConnection={testConnection}
                isConnected={wooCommerceApi.getAuthStatus()}
              />
            </SettingsSection>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Settings;
