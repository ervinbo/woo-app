
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wooCommerceApi } from '@/services/api';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Stats = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!wooCommerceApi.getAuthStatus()) {
      navigate('/');
    }
  }, [navigate]);

  const { data: recentOrders, isLoading, error } = useQuery({
    queryKey: ['statsOrders'],
    queryFn: async () => {
      try {
        // Get orders from the last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const formatDate = (date: Date) => {
          return date.toISOString().split('T')[0];
        };

        const after = formatDate(thirtyDaysAgo);
        const before = formatDate(today);
        
        // Fetch orders for the last 30 days with a larger per_page value
        const orders = await wooCommerceApi.request(`orders?after=${after}&before=${before}&per_page=50`);
        return orders;
      } catch (error) {
        console.error('Failed to fetch orders for stats:', error);
        throw error;
      }
    },
    staleTime: 300000, // 5 minutes
  });

  // Prepare data for charts
  const prepareChartData = () => {
    if (!recentOrders || !recentOrders.length) return [];

    // Group orders by date and calculate daily revenue
    const dailyRevenue: Record<string, number> = {};
    
    recentOrders.forEach((order: any) => {
      const date = new Date(order.date_created).toISOString().split('T')[0];
      const total = parseFloat(order.total);
      
      if (dailyRevenue[date]) {
        dailyRevenue[date] += total;
      } else {
        dailyRevenue[date] = total;
      }
    });

    // Convert to array and sort by date
    return Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: parseFloat(revenue.toFixed(2))
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const calculateProductStats = () => {
    if (!recentOrders || !recentOrders.length) return [];

    // Count products by quantity sold
    const productCounts: Record<string, { id: number, name: string, count: number }> = {};
    
    recentOrders.forEach((order: any) => {
      if (order.line_items && order.line_items.length) {
        order.line_items.forEach((item: any) => {
          const productId = item.product_id;
          const productName = item.name;
          const quantity = item.quantity;
          
          if (productCounts[productId]) {
            productCounts[productId].count += quantity;
          } else {
            productCounts[productId] = {
              id: productId,
              name: productName,
              count: quantity
            };
          }
        });
      }
    });

    // Convert to array, sort by count, and get top 5
    return Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const calculateOrderStats = () => {
    if (!recentOrders || !recentOrders.length) return { total: 0, average: 0 };

    const total = recentOrders.length;
    const totalRevenue = recentOrders.reduce((sum: number, order: any) => 
      sum + parseFloat(order.total), 0);
    const average = totalRevenue / total;

    return {
      total,
      average: parseFloat(average.toFixed(2))
    };
  };

  const chartData = prepareChartData();
  const topProducts = calculateProductStats();
  const orderStats = calculateOrderStats();

  if (isLoading) {
    return (
      <MobileLayout title="Statistics">
        <div className="py-10 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title="Statistics">
        <div className="py-10 text-center">
          <p className="text-red-500">Failed to load statistics data</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Statistics">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Store Statistics</h2>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Revenue (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      tickMargin={5}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Revenue']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No data available for the selected period</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total Orders</span>
                  <span className="font-semibold">{orderStats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Avg. Order Value</span>
                  <span className="font-semibold">${orderStats.average}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-2">
                  {topProducts.map((product) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <span className="text-gray-500 truncate max-w-[70%]">{product.name}</span>
                      <span className="font-semibold">{product.count} sold</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-2 text-gray-500">No product data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Stats;
