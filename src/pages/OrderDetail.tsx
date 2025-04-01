import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { wooCommerceApi } from '@/services/api';
import MobileLayout from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { ArrowLeft, Package, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!wooCommerceApi.getAuthStatus()) {
      navigate('/');
    }
  }, [navigate]);

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      try {
        const data = await wooCommerceApi.orders.get(Number(id));
        setStatus(data.status);
        return data;
      } catch (error) {
        console.error('Failed to fetch order:', error);
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
    enabled: !!id,
  });

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await wooCommerceApi.orders.updateStatus(Number(id), newStatus);
      setStatus(newStatus);
      toast.success('Order status updated successfully');
      refetch();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContactCustomer = (type: 'email' | 'phone') => {
    if (!order || !order.billing) return;
    
    if (type === 'email' && order.billing.email) {
      window.open(`mailto:${order.billing.email}`);
    } else if (type === 'phone' && order.billing.phone) {
      window.open(`tel:${order.billing.phone}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusOptions = () => {
    return [
      { value: 'pending', label: 'Pending Payment' },
      { value: 'processing', label: 'Processing' },
      { value: 'on-hold', label: 'On Hold' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'refunded', label: 'Refunded' },
      { value: 'failed', label: 'Failed' },
    ];
  };

  if (isLoading) {
    return (
      <MobileLayout title="Order Details">
        <div className="py-10 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title="Order Details">
        <div className="py-10 text-center">
          <p className="text-red-500">Failed to load order details</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/orders')}
          >
            Back to Orders
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Order Details">
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-500"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
        </Button>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Order #{order.number}</h2>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Select
                value={status}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {getStatusOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {isUpdating && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span>{formatDate(order.date_created)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method</span>
              <span>{order.payment_method_title || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span>{order.billing.first_name} {order.billing.last_name}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.line_items && order.line_items.map((item: any) => (
                <div key={item.id} className="flex items-center pb-3 border-b last:border-b-0 last:pb-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium truncate max-w-[200px]">{item.name}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{item.quantity} × ${parseFloat(item.price).toFixed(2)}</span>
                      <span>${parseFloat(item.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-3" />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${parseFloat(order.total_ex_tax || order.total).toFixed(2)}</span>
              </div>
              
              {order.shipping_total && parseFloat(order.shipping_total) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>${parseFloat(order.shipping_total).toFixed(2)}</span>
                </div>
              )}
              
              {order.total_tax && parseFloat(order.total_tax) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span>${parseFloat(order.total_tax).toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{order.billing.first_name} {order.billing.last_name}</p>
                {order.billing.company && (
                  <p className="text-sm text-gray-500">{order.billing.company}</p>
                )}
              </div>
              <div className="flex gap-2">
                {order.billing.email && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleContactCustomer('email')}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                )}
                {order.billing.phone && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleContactCustomer('phone')}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div>
              <p className="font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" /> Billing Address
              </p>
              <p className="text-sm">{order.billing.address_1}</p>
              {order.billing.address_2 && <p className="text-sm">{order.billing.address_2}</p>}
              <p className="text-sm">
                {order.billing.city}, {order.billing.state} {order.billing.postcode}
              </p>
              <p className="text-sm">{order.billing.country}</p>
            </div>
            
            {order.shipping && (order.shipping.address_1 || order.shipping.city) && (
              <div>
                <p className="font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" /> Shipping Address
                </p>
                <p className="text-sm">{order.shipping.address_1}</p>
                {order.shipping.address_2 && <p className="text-sm">{order.shipping.address_2}</p>}
                <p className="text-sm">
                  {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}
                </p>
                <p className="text-sm">{order.shipping.country}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-purple-100 text-purple-800';
    case 'cancelled':
    case 'failed':
    case 'refunded':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default OrderDetail;
