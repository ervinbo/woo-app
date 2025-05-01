
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewProduct = id === 'new';
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; }>>([]); 
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Simple product state with required fields
  const [product, setProduct] = useState({
    name: '',
    regular_price: '',
    sale_price: '',
    description: '',
    short_description: '',
    status: 'publish',
    manage_stock: false,
    stock_quantity: '',
    sku: '',
    categories: [] as Array<{ id: number, name?: string }>,
    images: [] as Array<{ id?: number, src: string, alt?: string }>
  });

  // Check authentication
  useEffect(() => {
    if (!wooCommerceApi.getAuthStatus()) {
      navigate('/');
      return;
    }
    
    // Load categories when component mounts
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await wooCommerceApi.getCategories();
        console.log("Categories loaded:", response);
        if (Array.isArray(response)) {
          setCategories(response);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Failed to load product categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [navigate]);

  // Load product if editing an existing one
  const { isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (isNewProduct) return null;
      try {
        const data = await wooCommerceApi.products.get(Number(id));
        console.log("Loaded product:", data);
        setProduct({
          ...data,
          regular_price: data.regular_price || '',
          sale_price: data.sale_price || '',
          stock_quantity: data.stock_quantity ? String(data.stock_quantity) : '',
          images: data.images || [],
          categories: data.categories || []
        });
        return data;
      } catch (error) {
        console.error('Error loading product:', error);
        throw error;
      }
    },
    staleTime: 60000,
    enabled: !isNewProduct && !!id,
  });

  // Input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProduct({ ...product, [name]: checked });
  };

  const handleImagesUpdate = (updatedImages: Array<{ id?: number, src: string, alt?: string }>) => {
    setProduct({ ...product, images: updatedImages });
  };

  const handleCategoryChange = (categoryId: string) => {
    const catId = parseInt(categoryId, 10);
    const selectedCategory = categories.find(cat => cat.id === catId);
    
    if (selectedCategory) {
      setProduct({
        ...product,
        categories: [{ id: catId, name: selectedCategory.name }]
      });
    }
  };

  // Simplified save function with better error handling
  const handleSave = async () => {
    if (!product.name) {
      toast.error('Product name is required');
      return;
    }

    if (!product.regular_price) {
      toast.error('Regular price is required');
      return;
    }

    setIsSaving(true);
    console.log('Saving product...', isNewProduct ? 'Creating new' : 'Updating existing');
    console.log('Product data:', product);

    try {
      if (isNewProduct) {
        // Create new product
        const result = await wooCommerceApi.products.create(product);
        console.log('Create product result:', result);
        toast.success('Product created successfully');
        navigate('/products');
      } else if (id) {
        // Update existing product
        await wooCommerceApi.products.update(Number(id), product);
        toast.success('Product updated successfully');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to save product');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading && !isNewProduct) {
    return (
      <MobileLayout title={isNewProduct ? 'New Product' : 'Edit Product'}>
        <div className="py-10 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  // Error state
  if (error && !isNewProduct) {
    return (
      <MobileLayout title="Product Details">
        <div className="py-10 text-center">
          <p className="text-red-500">Error loading product details</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/products')}
          >
            Back to products
          </Button>
        </div>
      </MobileLayout>
    );
  }

  // Render product form
  return (
    <MobileLayout title={isNewProduct ? 'New Product' : 'Edit Product'}>
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-500"
          onClick={() => navigate('/products')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to products
        </Button>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Product Images */}
              <div className="mb-4">
                <Label>Product Images</Label>
                <ImageUploader 
                  images={product.images}
                  onImagesUpdate={handleImagesUpdate}
                />
              </div>

              {/* Basic Info */}
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

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={product.categories.length > 0 ? String(product.categories[0].id) : ''} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="none" disabled>No categories available</SelectItem>
                    ) : (
                      categories.map(category => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing */}
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

              {/* Inventory */}
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

              {/* SKU */}
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

              {/* Descriptions */}
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
          
          {/* Save Button */}
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
