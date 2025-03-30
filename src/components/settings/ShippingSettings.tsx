
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ShippingSettingsProps {
  shippingNotice: string;
  isLoading: boolean;
  handleSetting: (key: string, value: any) => void;
}

const ShippingSettings: React.FC<ShippingSettingsProps> = ({
  shippingNotice,
  isLoading,
  handleSetting
}) => {
  return (
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
  );
};

export default ShippingSettings;
