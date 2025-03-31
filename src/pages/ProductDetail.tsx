
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { wooCommerceApi } from '@/services/api';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ImageUploader from '@/components/product/ImageUploader';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewProduct = id === 'new';
  const [isSaving, setIsSaving] = useState(false);

  const [product, setProduct] = useState({
    name: '',
    regular_price: '',
    sale_price: '',
    description: '',
    short_description: '',
    on_sale: false,
    status: 'publish',
    manage_stock: false,
    stock_quantity: '',
    sku: '',
    categories: [],
    images: [] as Array<{ id?: number, src: string, alt?: string }>
  });

  useEffect(() => {
    if (!wooCommerceApi.getAuthStatus()) {
      navigate('/');
    }
  }, [navigate]);

  const { isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (isNewProduct) return null;
      try {
        const data = await wooCommerceApi.getProduct(Number(id));
        setProduct({
          ...data,
          regular_price: data.regular_price || '',
          sale_price: data.sale_price || '',
          stock_quantity: data.stock_quantity ? String(data.stock_quantity) : '',
          images: data.images || []
        });
        return data;
      } catch (error) {
        console.error('Failed to fetch product:', error);
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
    enabled: !isNewProduct && !!id,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProduct({ ...product, [name]: checked });
  };

  const handleImagesUpdate = (updatedImages: Array<{ id?: number, src: string, alt?: string }>) => {
    setProduct({
      ...product,
      images: updatedImages
    });
  };

  const handleSave = async () => {
    if (!product.name || !product.regular_price) {
      toast.error('Назив производа и редовна цена су обавезни');
      return;
    }

    const productData = {
      ...product,
      // Convert price strings to strings just to be safe
      regular_price: String(product.regular_price),
      sale_price: String(product.sale_price),
      // Convert stock quantity to number if present
      stock_quantity: product.stock_quantity ? parseInt(product.stock_quantity) : null
    };

    setIsSaving(true);

    try {
      if (isNewProduct) {
        await wooCommerceApi.createProduct(productData);
        toast.success('Производ је успешно креиран');
      } else {
        await wooCommerceApi.updateProduct(Number(id), productData);
        toast.success('Производ је успешно ажуриран');
      }
      navigate('/products');
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Грешка при чувању производа');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !isNewProduct) {
    return (
      <MobileLayout title={isNewProduct ? 'Нови производ' : 'Измена производа'}>
        <div className="py-10 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error && !isNewProduct) {
    return (
      <MobileLayout title="Детаљи производа">
        <div className="py-10 text-center">
          <p className="text-red-500">Грешка при учитавању детаља производа</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/products')}
          >
            Назад на производе
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={isNewProduct ? 'Нови производ' : 'Измена производа'}>
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-500"
          onClick={() => navigate('/products')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Назад на производе
        </Button>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="mb-4">
                <Label>Слике производа</Label>
                <ImageUploader 
                  images={product.images}
                  onImagesUpdate={handleImagesUpdate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Назив производа *</Label>
                <Input
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleInputChange}
                  placeholder="Назив производа"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regular_price">Редовна цена *</Label>
                  <Input
                    id="regular_price"
                    name="regular_price"
                    type="number"
                    step="0.01"
                    value={product.regular_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Акцијска цена</Label>
                  <Input
                    id="sale_price"
                    name="sale_price"
                    type="number"
                    step="0.01"
                    value={product.sale_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="on_sale">На акцији</Label>
                <Switch 
                  id="on_sale" 
                  checked={product.on_sale}
                  onCheckedChange={(checked) => handleSwitchChange('on_sale', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="manage_stock">Управљање залихама</Label>
                <Switch 
                  id="manage_stock" 
                  checked={product.manage_stock}
                  onCheckedChange={(checked) => handleSwitchChange('manage_stock', checked)}
                />
              </div>

              {product.manage_stock && (
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Количина залиха</Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={product.stock_quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="sku">Шифра производа</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={product.sku}
                  onChange={handleInputChange}
                  placeholder="SKU"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Кратак опис</Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  value={product.short_description}
                  onChange={handleInputChange}
                  placeholder="Кратак опис"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleInputChange}
                  placeholder="Комплетан опис"
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Чување...
              </>
            ) : (
              isNewProduct ? 'Креирај производ' : 'Ажурирај производ'
            )}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default ProductDetail;
