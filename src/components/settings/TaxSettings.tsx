
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface TaxSettingsProps {
  taxIncludedInPrice: boolean;
  isLoading: boolean;
  handleSetting: (key: string, value: any) => void;
}

const TaxSettings: React.FC<TaxSettingsProps> = ({
  taxIncludedInPrice,
  isLoading,
  handleSetting
}) => {
  return (
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
  );
};

export default TaxSettings;
