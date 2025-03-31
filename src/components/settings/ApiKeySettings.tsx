
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
          Unesite vaše WooCommerce REST API podatke za povezivanje sa vašom prodavnicom
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="site-url">URL sajta</Label>
        <Input
          id="site-url"
          type="url"
          placeholder="https://vasaprodavnica.com"
          value={apiCredentials.siteUrl}
          onChange={(e) => handleCredentialChange('siteUrl', e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Kompletan URL do vaše WooCommerce prodavnice
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="consumer-key">Potrošački ključ</Label>
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
        <Label htmlFor="consumer-secret">Potrošačka tajna</Label>
        <Input
          id="consumer-secret"
          type="password"
          placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          value={apiCredentials.consumerSecret}
          onChange={(e) => handleCredentialChange('consumerSecret', e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Ove ključeve možete generisati iz WooCommerce &gt; Podešavanja &gt; Napredno &gt; REST API
        </p>
      </div>
      
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Button
          onClick={saveCredentials}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Sačuvaj podatke
        </Button>
        
        <Button
          variant="outline"
          onClick={testConnection}
          disabled={isLoading || !isConnected}
          className="w-full sm:w-auto"
        >
          Testiraj vezu
        </Button>
      </div>
    </div>
  );
};

export default ApiKeySettings;
