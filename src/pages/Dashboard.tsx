
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wooCommerceApi } from '@/services/api';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { toast } from '@/lib/toast'; // Updated import
import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  recentOrders: any[];
  productStats: any;
  customerStats: any;
  totalRevenue?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!wooCommerceApi.getAuthStatus()) {
      navigate('/');
    }
  }, [navigate]);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        // Fetch initial stats
        const data = await wooCommerceApi.getStats();
        
        // Calculate total revenue from recent orders
        const totalRevenue = data.recentOrders.reduce(
          (sum: number, order: any) => sum + parseFloat(order.total), 
          0
        );

        return { ...data, totalRevenue };
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <MobileLayout title="Dashboard">
        <div className="py-10 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    toast.error('Failed to load dashboard data');
    return (
      <MobileLayout title="Dashboard">
        <div className="py-10 text-center">
          <p className="text-red-500">Failed to load dashboard data</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => navigate(0)} // Refresh the page
          >
            Retry
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Dashboard">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Store Overview</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatsCard 
            title="Products" 
            value={stats?.productStats?.length || 0} 
            icon={<Package className="h-8 w-8 text-blue-500" />} 
            onClick={() => navigate('/products')}
          />
          <StatsCard 
            title="Orders" 
            value={stats?.recentOrders?.length || 0} 
            icon={<ShoppingCart className="h-8 w-8 text-green-500" />} 
            onClick={() => navigate('/orders')}
          />
          <StatsCard 
            title="Customers" 
            value={stats?.customerStats?.length || 0} 
            icon={<Users className="h-8 w-8 text-purple-500" />} 
            onClick={() => navigate('/customers')}
          />
          <StatsCard 
            title="Revenue" 
            value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`} 
            icon={<DollarSign className="h-8 w-8 text-amber-500" />} 
            onClick={() => navigate('/stats')}
            valueClassName="text-lg"
          />
        </div>
        
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders?.length ? (
              <div className="space-y-3">
                {stats.recentOrders.map((order: any) => (
                  <div 
                    key={order.id} 
                    className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm border cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div>
                      <p className="font-medium">#{order.number}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.date_created).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${parseFloat(order.total).toFixed(2)}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                <button 
                  className="w-full mt-2 py-2 text-center text-primary font-medium hover:underline"
                  onClick={() => navigate('/orders')}
                >
                  View All Orders
                </button>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No recent orders</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  onClick: () => void;
  valueClassName?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  onClick,
  valueClassName = "text-2xl" 
}) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {icon}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`font-bold ${valueClassName}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get color based on order status
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

export default Dashboard;
