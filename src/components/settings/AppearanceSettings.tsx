
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';

const THEME_COLORS = [
  { name: 'Подразумевана плава', value: 'blue', hsl: '214 80% 51%' },
  { name: 'Зелена', value: 'green', hsl: '142 76% 36%' },
  { name: 'Љубичаста', value: 'purple', hsl: '270 76% 40%' },
  { name: 'Црвена', value: 'red', hsl: '0 84% 60%' },
  { name: 'Наранџаста', value: 'orange', hsl: '24 100% 50%' },
];

interface AppearanceSettingsProps {
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ 
  currentTheme, 
  setCurrentTheme 
}) => {
  const handleThemeChange = (value: string) => {
    setCurrentTheme(value);
    localStorage.setItem('wooTheme', value);
    applyThemeColor(value);
    toast.success('Тема ажурирана');
  };

  const applyThemeColor = (colorValue: string) => {
    const selectedColor = THEME_COLORS.find(c => c.value === colorValue);
    if (selectedColor) {
      document.documentElement.style.setProperty('--primary', selectedColor.hsl);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Изглед</CardTitle>
        <CardDescription>Прилагодите изглед ваше контролне табле</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Боја теме</h3>
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
  );
};

export default AppearanceSettings;
