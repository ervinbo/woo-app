
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wooCommerceApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/toast'; // Updated import
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
      toast.error('Please fill in all fields');
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
      await wooCommerceApi.getProducts(1, 1);
      
      toast.success('Successfully connected to WooCommerce store!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Connection error:', error);
      wooCommerceApi.clearCredentials();
      toast.error('Failed to connect. Please check your credentials.');
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
          <CardTitle className="text-2xl">WooCommerce Store Manager</CardTitle>
          <CardDescription>Connect to your WooCommerce store</CardDescription>
        </CardHeader>
        <form onSubmit={handleConnect}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="siteUrl">
                Store URL
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
                Consumer Key
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
                Consumer Secret
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
              {isLoading ? 'Connecting...' : 'Connect to Store'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
