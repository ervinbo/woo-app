
import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';
import { wooCommerceApi } from '@/services/api';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

  useEffect(() => {
    // Load saved settings from localStorage
    const savedTheme = localStorage.getItem('wooTheme') || 'blue';
    setCurrentTheme(savedTheme);
    
    const savedCatalogMode = localStorage.getItem('wooCatalogMode') === 'true';
    setCatalogMode(savedCatalogMode);
    
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

  const handleCatalogModeToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      // In a real app, we would call the WooCommerce API to update settings
      // For demo, we'll just use localStorage
      setCatalogMode(checked);
      localStorage.setItem('wooCatalogMode', checked.toString());
      
      // Simulate API call
      toast.success(`Catalog mode ${checked ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update catalog mode');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout title="Settings">
      <div className="space-y-4">
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
          <CardHeader>
            <CardTitle>WooCommerce Settings</CardTitle>
            <CardDescription>Configure your store settings</CardDescription>
          </CardHeader>
          <CardContent>
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
                onCheckedChange={handleCatalogModeToggle}
                disabled={isLoading}
              />
            </div>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              More WooCommerce settings will be added in future updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Settings;
