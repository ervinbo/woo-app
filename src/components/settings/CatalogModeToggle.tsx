
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CatalogModeToggleProps {
  catalogMode: boolean;
  isLoading: boolean;
  handleSetting: (key: string, value: any) => void;
}

const CatalogModeToggle: React.FC<CatalogModeToggleProps> = ({
  catalogMode,
  isLoading,
  handleSetting
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <Label htmlFor="catalog-mode">Režim kataloga</Label>
        <p className="text-sm text-muted-foreground">
          Sakrij cene i onemogući kupovinu
        </p>
      </div>
      <Switch
        id="catalog-mode"
        checked={catalogMode}
        onCheckedChange={(value) => handleSetting('CatalogMode', value)}
        disabled={isLoading}
      />
    </div>
  );
};

export default CatalogModeToggle;
