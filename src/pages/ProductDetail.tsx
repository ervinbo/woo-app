
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

interface Category {
  id: number;
  name: string;
  slug: string;
  parent?: number;
  count?: number;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewProduct = id === 'new';
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Simplified product state
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
    }
  }, [navigate]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!wooCommerceApi.getAuthStatus()) return;
      
      setIsLoadingCategories(true);
      try {
        const fetchedCategories = await wooCommerceApi.products.getCategories();
        if (Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error('Greška pri učitavanju kategorija:', error);
        toast.error('Nije uspelo učitavanje kategorija proizvoda');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Load product if editing
  const { isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (isNewProduct) return null;
      try {
        const data = await wooCommerceApi.products.get(Number(id));
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
        console.error('Greška pri učitavanju proizvoda:', error);
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

  // Simplified save function
  const handleSave = async () => {
    if (!product.name || !product.regular_price) {
      toast.error('Naziv proizvoda i redovna cena su obavezni');
      return;
    }

    setIsSaving(true);
    console.log('Saving product...', isNewProduct ? 'Creating new' : 'Updating existing');

    try {
      if (isNewProduct) {
        console.log('Creating new product with data:', product);
        const result = await wooCommerceApi.products.create(product);
        console.log('Create product result:', result);
        toast.success('Proizvod je uspešno kreiran');
      } else {
        console.log('Updating product with ID:', id);
        await wooCommerceApi.products.update(Number(id), product);
        toast.success('Proizvod je uspešno ažuriran');
      }
      navigate('/products');
    } catch (error) {
      console.error('Greška pri čuvanju proizvoda:', error);
      
      if (error instanceof Error) {
        toast.error(`Greška: ${error.message}`);
      } else {
        toast.error('Greška pri čuvanju proizvoda');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading && !isNewProduct) {
    return (
      <MobileLayout title={isNewProduct ? 'Novi proizvod' : 'Izmena proizvoda'}>
        <div className="py-10 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  // Error state
  if (error && !isNewProduct) {
    return (
      <MobileLayout title="Detalji proizvoda">
        <div className="py-10 text-center">
          <p className="text-red-500">Greška pri učitavanju detalja proizvoda</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/products')}
          >
            Nazad na proizvode
          </Button>
        </div>
      </MobileLayout>
    );
  }

  // Render product form
  return (
    <MobileLayout title={isNewProduct ? 'Novi proizvod' : 'Izmena proizvoda'}>
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-500"
          onClick={() => navigate('/products')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Nazad na proizvode
        </Button>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="mb-4">
                <Label>Slike proizvoda</Label>
                <ImageUploader 
                  images={product.images}
                  onImagesUpdate={handleImagesUpdate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Naziv proizvoda *</Label>
                <Input
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleInputChange}
                  placeholder="Naziv proizvoda"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategorija</Label>
                <Select 
                  value={product.categories.length > 0 ? String(product.categories[0].id) : ''} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Izaberite kategoriju" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>Učitavanje kategorija...</SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="none" disabled>Nema dostupnih kategorija</SelectItem>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regular_price">Redovna cena *</Label>
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
                  <Label htmlFor="sale_price">Akcijska cena</Label>
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
                <Label htmlFor="manage_stock">Upravljanje zalihama</Label>
                <Switch 
                  id="manage_stock" 
                  checked={product.manage_stock}
                  onCheckedChange={(checked) => handleSwitchChange('manage_stock', checked)}
                />
              </div>

              {product.manage_stock && (
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Količina zaliha</Label>
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
                <Label htmlFor="sku">Šifra proizvoda</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={product.sku}
                  onChange={handleInputChange}
                  placeholder="SKU"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Kratak opis</Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  value={product.short_description}
                  onChange={handleInputChange}
                  placeholder="Kratak opis"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleInputChange}
                  placeholder="Kompletan opis"
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
                Čuvanje...
              </>
            ) : (
              isNewProduct ? 'Kreiraj proizvod' : 'Ažuriraj proizvod'
            )}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default ProductDetail;
