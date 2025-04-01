import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wooCommerceApi, ordersService } from '@/services/api';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Calendar, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Orders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const perPage = 10;

  useEffect(() => {
    if (!wooCommerceApi.getAuthStatus()) {
      navigate('/');
    }
  }, [navigate]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', page, statusFilter],
    queryFn: async () => {
      try {
        const actualStatusFilter = statusFilter === 'all' ? '' : statusFilter;
        return await ordersService.getOrders(page, perPage, actualStatusFilter);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
  });

  const handleViewOrder = (id: number) => {
    navigate(`/orders/${id}`);
  };

  const filteredOrders = data?.filter(order => 
    (order.number && order.number.toString().includes(searchTerm)) ||
    (order.billing && order.billing.first_name && order.billing.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.billing && order.billing.last_name && order.billing.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'failed', label: 'Failed' },
  ];

  if (isLoading) {
    return (
      <MobileLayout title="Orders">
        <div className="py-10 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title="Orders">
        <div className="py-10 text-center">
          <p className="text-red-500">Failed to load orders</p>
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
    <MobileLayout title="Orders">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Orders</h2>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Search by order # or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredOrders && filteredOrders.length > 0 ? (
            filteredOrders.map((order: any) => (
              <Card 
                key={order.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewOrder(order.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">Order #{order.number}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(order.date_created).toLocaleDateString()}
                  </div>
                  
                  {order.billing && (
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <User className="h-4 w-4 mr-1" />
                      {order.billing.first_name} {order.billing.last_name}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Package className="h-4 w-4 mr-1" />
                    {order.line_items?.length || 0} items
                  </div>
                  
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="font-semibold">${parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              {searchTerm ? 'No orders match your search' : 'No orders found'}
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

export default Orders;
