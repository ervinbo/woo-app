
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CheckoutSettingsProps {
  guestCheckout: boolean;
  orderNotifications: boolean;
  isLoading: boolean;
  handleSetting: (key: string, value: any) => void;
}

const CheckoutSettings: React.FC<CheckoutSettingsProps> = ({
  guestCheckout,
  orderNotifications,
  isLoading,
  handleSetting
}) => {
  return (
    <>
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
    </>
  );
};

export default CheckoutSettings;
