
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { WooCommerceCredentials } from '@/services/api';

interface ApiKeySettingsProps {
  apiCredentials: WooCommerceCredentials;
  isLoading: boolean;
  handleCredentialChange: (field: keyof WooCommerceCredentials, value: string) => void;
  saveCredentials: () => void;
  testConnection: () => void;
  isConnected: boolean;
}

const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({
  apiCredentials,
  isLoading,
  handleCredentialChange,
  saveCredentials,
  testConnection,
  isConnected
}) => {
  return (
    <div className="space-y-3">
      <div className="space-y-1 mb-2">
        <p className="text-sm text-muted-foreground">
          Enter your WooCommerce REST API credentials to connect to your store
        </p>
      </div>
      
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
          disabled={isLoading || !isConnected}
          className="w-full sm:w-auto"
        >
          Test Connection
        </Button>
      </div>
    </div>
  );
};

export default ApiKeySettings;
