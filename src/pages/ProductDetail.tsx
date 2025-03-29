
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { wooCommerceApi } from '@/services/api';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Package, ArrowLeft, Loader2 } from 'lucide-react';

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
    images: []
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
          stock_quantity: data.stock_quantity ? String(data.stock_quantity) : ''
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

  const handleSave = async () => {
    if (!product.name || !product.regular_price) {
      toast.error('Product name and regular price are required');
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
        toast.success('Product created successfully');
      } else {
        await wooCommerceApi.updateProduct(Number(id), productData);
        toast.success('Product updated successfully');
      }
      navigate('/products');
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !isNewProduct) {
    return (
      <MobileLayout title={isNewProduct ? 'New Product' : 'Edit Product'}>
        <div className="py-10 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error && !isNewProduct) {
    return (
      <MobileLayout title="Product Details">
        <div className="py-10 text-center">
          <p className="text-red-500">Failed to load product details</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/products')}
          >
            Back to Products
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={isNewProduct ? 'New Product' : 'Edit Product'}>
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-500"
          onClick={() => navigate('/products')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
        </Button>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-center mb-4">
                {product.images && product.images[0] ? (
                  <img 
                    src={product.images[0].src} 
                    alt={product.name} 
                    className="w-32 h-32 object-contain rounded-md"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-gray-200 rounded-md">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleInputChange}
                  placeholder="Product name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regular_price">Regular Price *</Label>
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
                  <Label htmlFor="sale_price">Sale Price</Label>
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
                <Label htmlFor="on_sale">On Sale</Label>
                <Switch 
                  id="on_sale" 
                  checked={product.on_sale}
                  onCheckedChange={(checked) => handleSwitchChange('on_sale', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="manage_stock">Manage Stock</Label>
                <Switch 
                  id="manage_stock" 
                  checked={product.manage_stock}
                  onCheckedChange={(checked) => handleSwitchChange('manage_stock', checked)}
                />
              </div>

              {product.manage_stock && (
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
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
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={product.sku}
                  onChange={handleInputChange}
                  placeholder="SKU"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  value={product.short_description}
                  onChange={handleInputChange}
                  placeholder="Short description"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleInputChange}
                  placeholder="Full description"
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
                Saving...
              </>
            ) : (
              isNewProduct ? 'Create Product' : 'Update Product'
            )}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default ProductDetail;
