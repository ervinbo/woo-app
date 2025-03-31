
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface ProductSettingsProps {
  stockManagement: boolean;
  lowStockThreshold: number;
  reviewsEnabled: boolean;
  isLoading: boolean;
  handleSetting: (key: string, value: any) => void;
}

const ProductSettings: React.FC<ProductSettingsProps> = ({
  stockManagement,
  lowStockThreshold,
  reviewsEnabled,
  isLoading,
  handleSetting
}) => {
  return (
    <>
      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <Label htmlFor="stock-management">Управљање залихама</Label>
          <p className="text-sm text-muted-foreground">
            Пратите инвентар и управљајте нивоима залиха
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
          <Label htmlFor="low-stock-threshold">Праг ниских залиха</Label>
          <Input
            id="low-stock-threshold"
            type="number"
            min="0"
            value={lowStockThreshold}
            onChange={(e) => handleSetting('LowStockThreshold', parseInt(e.target.value))}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Добијте обавештење када залихе производа достигну овај ниво
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <Label htmlFor="reviews-enabled">Рецензије производа</Label>
          <p className="text-sm text-muted-foreground">
            Дозволите купцима да остављају рецензије производа
          </p>
        </div>
        <Switch
          id="reviews-enabled"
          checked={reviewsEnabled}
          onCheckedChange={(value) => handleSetting('ReviewsEnabled', value)}
          disabled={isLoading}
        />
      </div>
    </>
  );
};

export default ProductSettings;
