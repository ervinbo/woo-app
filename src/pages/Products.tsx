
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wooCommerceApi } from '@/services/api';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const Products = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const perPage = 10;

  useEffect(() => {
    if (!wooCommerceApi.getAuthStatus()) {
      navigate('/');
    }
  }, [navigate]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', page],
    queryFn: async () => {
      try {
        return await wooCommerceApi.getProducts(page, perPage);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
  });

  const handleAddProduct = () => {
    navigate('/products/new');
  };

  const handleEditProduct = (id: number) => {
    navigate(`/products/${id}`);
  };

  const confirmDelete = (id: number) => {
    setDeleteProductId(id);
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    try {
      await wooCommerceApi.deleteProduct(deleteProductId);
      toast.success('Product deleted successfully');
      refetch();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteProductId(null);
    }
  };

  const filteredProducts = data?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <MobileLayout title="Products">
        <div className="py-10 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title="Products">
        <div className="py-10 text-center">
          <p className="text-red-500">Failed to load products</p>
          <Button 
            className="mt-4"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Products">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Products</h2>
          <Button size="sm" onClick={handleAddProduct}>
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((product: any) => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-3">
                    <div 
                      className="w-16 h-16 rounded-md bg-gray-100 mr-3 flex-shrink-0 overflow-hidden"
                      onClick={() => handleEditProduct(product.id)}
                    >
                      {product.images && product.images.length > 0 ? (
                        product.images.length === 1 ? (
                          <img 
                            src={product.images[0].src} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Carousel className="w-full h-full">
                            <CarouselContent className="h-full">
                              {product.images.map((image: any, index: number) => (
                                <CarouselItem key={index} className="h-full">
                                  <img 
                                    src={image.src} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover"
                                  />
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="h-6 w-6 -left-1" />
                            <CarouselNext className="h-6 w-6 -right-1" />
                          </Carousel>
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div 
                      className="flex-1 min-w-0"
                      onClick={() => handleEditProduct(product.id)}
                    >
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500 truncate" 
                         dangerouslySetInnerHTML={{ __html: product.short_description || '' }} />
                      <p className="text-sm font-medium">
                        {product.on_sale && product.sale_price ? (
                          <>
                            <span className="text-primary">${product.sale_price}</span>
                            <span className="text-gray-400 line-through ml-2">${product.regular_price}</span>
                          </>
                        ) : (
                          <span>${product.price}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditProduct(product.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => confirmDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              {searchTerm ? 'No products match your search' : 'No products found'}
            </div>
          )}
        </div>

        {data && data.length > 0 && (
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <Button
              variant="outline"
              disabled={data.length < perPage}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
};

export default Products;
