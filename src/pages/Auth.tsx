
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wooCommerceApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import { ShoppingCart } from 'lucide-react';

const Auth = () => {
  const [siteUrl, setSiteUrl] = useState('https://berkesel.com');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated
    if (wooCommerceApi.getAuthStatus()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!siteUrl || !consumerKey || !consumerSecret) {
      toast.error('Молимо попуните сва поља');
      return;
    }

    setIsLoading(true);

    try {
      // Save credentials
      wooCommerceApi.saveCredentials({ 
        siteUrl: siteUrl.replace(/\/$/, ''), // Remove trailing slash if present
        consumerKey, 
        consumerSecret 
      });

      // Test connection by fetching products
      await wooCommerceApi.products.getAll(1, 1);
      
      toast.success('Успешно повезано са WooCommerce продавницом!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Connection error:', error);
      wooCommerceApi.clearCredentials();
      toast.error('Грешка при повезивању. Проверите своје податке.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/20 p-3 flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">WooCommerce Менаџер Продавнице</CardTitle>
          <CardDescription>Повежите се са вашом WooCommerce продавницом</CardDescription>
        </CardHeader>
        <form onSubmit={handleConnect}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="siteUrl">
                URL продавнице
              </label>
              <Input
                id="siteUrl"
                type="url"
                placeholder="https://berkesel.com"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="consumerKey">
                Потрошачки кључ
              </label>
              <Input
                id="consumerKey"
                type="text"
                placeholder="ck_xxxxxxxxxxxxxxxxxxxx"
                value={consumerKey}
                onChange={(e) => setConsumerKey(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="consumerSecret">
                Потрошачка тајна
              </label>
              <Input
                id="consumerSecret"
                type="password"
                placeholder="cs_xxxxxxxxxxxxxxxxxxxx"
                value={consumerSecret}
                onChange={(e) => setConsumerSecret(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Повезивање...' : 'Повежи се са продавницом'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
