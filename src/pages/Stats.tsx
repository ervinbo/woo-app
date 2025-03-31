
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wooCommerceApi } from '@/services/api';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from '@/lib/toast';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { addDays, format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import the Chart components from shadcn
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const Stats = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30), // Default to last 30 days
    to: new Date(),
  });
  const [chartType, setChartType] = useState('revenue');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('earnings');

  useEffect(() => {
    if (!wooCommerceApi.getAuthStatus()) {
      navigate('/');
    }
  }, [navigate]);

  const { data: recentOrders, isLoading, error, refetch } = useQuery({
    queryKey: ['statsOrders', dateRange],
    queryFn: async () => {
      try {
        // Fetch orders and do client-side filtering
        const orders = await wooCommerceApi.request('orders?per_page=100');
        
        // Filter for the selected date range
        const fromDate = dateRange.from;
        const toDate = dateRange.to;
        
        if (!fromDate) return [];
        
        return Array.isArray(orders) 
          ? orders.filter((order: any) => {
              const orderDate = new Date(order.date_created);
              return orderDate >= fromDate && (!toDate || orderDate <= toDate);
            })
          : [];
      } catch (error) {
        console.error('Failed to fetch orders for stats:', error);
        toast.error('Грешка при учитавању статистичких података');
        throw error;
      }
    },
    staleTime: 300000, // 5 minutes
  });

  // Prepare data for charts
  const prepareChartData = () => {
    const orders = recentOrders as any[] | undefined;
    if (!orders || !orders.length) return [];

    // Group orders by date and calculate daily revenue
    const dailyRevenue: Record<string, number> = {};
    const dailyOrders: Record<string, number> = {};
    
    orders.forEach((order: any) => {
      const date = new Date(order.date_created).toISOString().split('T')[0];
      const total = parseFloat(order.total);
      
      if (dailyRevenue[date]) {
        dailyRevenue[date] += total;
        dailyOrders[date] += 1;
      } else {
        dailyRevenue[date] = total;
        dailyOrders[date] = 1;
      }
    });

    // Convert to array and sort by date
    return Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('sr-RS', { month: 'short', day: 'numeric' }),
        revenue: parseFloat(revenue.toFixed(2)),
        orders: dailyOrders[date]
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const calculateProductStats = () => {
    const orders = recentOrders as any[] | undefined;
    if (!orders || !orders.length) return [];

    // Count products by quantity sold
    const productCounts: Record<string, { id: number, name: string, count: number, revenue: number }> = {};
    
    orders.forEach((order: any) => {
      if (order.line_items && order.line_items.length) {
        order.line_items.forEach((item: any) => {
          const productId = item.product_id;
          const productName = item.name;
          const quantity = item.quantity;
          const lineTotal = parseFloat(item.total);
          
          if (productCounts[productId]) {
            productCounts[productId].count += quantity;
            productCounts[productId].revenue += lineTotal;
          } else {
            productCounts[productId] = {
              id: productId,
              name: productName,
              count: quantity,
              revenue: lineTotal
            };
          }
        });
      }
    });

    // Convert to array and sort by count
    return Object.values(productCounts)
      .sort((a, b) => b.count - a.count);
  };

  const calculateCustomerStats = () => {
    const orders = recentOrders as any[] | undefined;
    if (!orders || !orders.length) return [];

    // Group orders by customer
    const customerStats: Record<string, { 
      id: number, 
      name: string, 
      orderCount: number, 
      revenue: number 
    }> = {};
    
    orders.forEach((order: any) => {
      const customerId = order.customer_id;
      if (!customerId) return; // Skip orders without customer ID
      
      const customerName = 
        order.billing?.first_name && order.billing?.last_name
          ? `${order.billing.first_name} ${order.billing.last_name}`
          : `Купац #${customerId}`;
      
      const total = parseFloat(order.total);
      
      if (customerStats[customerId]) {
        customerStats[customerId].orderCount += 1;
        customerStats[customerId].revenue += total;
      } else {
        customerStats[customerId] = {
          id: customerId,
          name: customerName,
          orderCount: 1,
          revenue: total
        };
      }
    });

    // Convert to array and sort by revenue
    return Object.values(customerStats)
      .sort((a, b) => b.revenue - a.revenue);
  };

  const calculateGeographicalStats = () => {
    const orders = recentOrders as any[] | undefined;
    if (!orders || !orders.length) return [];

    // Group orders by country/region
    const regionStats: Record<string, { 
      region: string, 
      orderCount: number, 
      revenue: number 
    }> = {};
    
    orders.forEach((order: any) => {
      const country = order.billing?.country || 'Непознато';
      const state = order.billing?.state || '';
      const region = state ? `${country} (${state})` : country;
      
      const total = parseFloat(order.total);
      
      if (regionStats[region]) {
        regionStats[region].orderCount += 1;
        regionStats[region].revenue += total;
      } else {
        regionStats[region] = {
          region,
          orderCount: 1,
          revenue: total
        };
      }
    });

    // Convert to array and sort by revenue
    return Object.values(regionStats)
      .sort((a, b) => b.revenue - a.revenue);
  };

  const calculateOrderStats = () => {
    const orders = recentOrders as any[] | undefined;
    if (!orders || !orders.length) return { total: 0, average: 0 };

    const total = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: any) => 
      sum + parseFloat(order.total), 0);
    const average = totalRevenue / total;

    return {
      total,
      average: parseFloat(average.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2))
    };
  };

  const applyFilters = () => {
    refetch();
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setDateRange({
      from: subDays(new Date(), 30),
      to: new Date(),
    });
    setChartType('revenue');
    setIsFilterOpen(false);
  };

  const chartData = prepareChartData();
  const productStats = calculateProductStats();
  const orderStats = calculateOrderStats();
  const customerStats = calculateCustomerStats();
  const geoStats = calculateGeographicalStats();

  if (isLoading) {
    return (
      <MobileLayout title="Статистика">
        <div className="py-10 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title="Статистика">
        <div className="py-10 text-center">
          <p className="text-red-500">Грешка при учитавању статистичких података</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Статистика">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Статистика продавнице</h2>
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Филтери
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h3 className="font-medium">Филтрирај статистику</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Временски период</label>
                  <DatePickerWithRange 
                    date={dateRange} 
                    setDate={setDateRange} 
                  />
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>Поништи</Button>
                  <Button size="sm" onClick={applyFilters}>Примени филтере</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Tabs defaultValue="earnings" value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="earnings">Зарада</TabsTrigger>
            <TabsTrigger value="products">Производи</TabsTrigger>
            <TabsTrigger value="customers">Купци</TabsTrigger>
            <TabsTrigger value="geography">Географија</TabsTrigger>
          </TabsList>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Преглед прихода</span>
                  {dateRange.from && dateRange.to && (
                    <span className="text-sm font-normal text-gray-500">
                      {format(dateRange.from, 'dd.MM.yyyy')} - {format(dateRange.to, 'dd.MM.yyyy')}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
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
                          tickFormatter={(value) => `${value} дин`}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value} дин`, 'Приход']}
                          labelFormatter={(label) => `Датум: ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          fill="#8884d8" 
                          stroke="#8884d8"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">Нема података за изабрани период</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Детаљи зараде</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Укупан приход</span>
                    <span className="font-semibold">{orderStats.totalRevenue} дин</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Укупно наруџбина</span>
                    <span className="font-semibold">{orderStats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Просечна вредност наруџбине</span>
                    <span className="font-semibold">{orderStats.average} дин</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {chartData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Приход по датуму</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-72 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Датум</TableHead>
                          <TableHead>Број продаја</TableHead>
                          <TableHead className="text-right">Зарада</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chartData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{item.orders}</TableCell>
                            <TableCell className="text-right font-medium">{item.revenue} дин</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Преглед производа</CardTitle>
                </CardHeader>
                <CardContent>
                  {productStats.length > 0 ? (
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={productStats.slice(0, 8)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {productStats.slice(0, 8).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name, props) => [`${value} комада`, props.payload.name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">Нема података о производима</p>
                  )}
                </CardContent>
              </Card>

              {productStats.length > 0 && (
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Детаљи продаје производа</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Производ</TableHead>
                            <TableHead>Број продаја</TableHead>
                            <TableHead className="text-right">Приход</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productStats.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium truncate max-w-48">{product.name}</TableCell>
                              <TableCell>{product.count}</TableCell>
                              <TableCell className="text-right">{product.revenue.toFixed(2)} дин</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Преглед купаца</CardTitle>
                </CardHeader>
                <CardContent>
                  {customerStats.length > 0 ? (
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={customerStats.slice(0, 8)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="revenue"
                            nameKey="name"
                            label={({name, percent}) => `${name.substring(0, 15)}${name.length > 15 ? '...' : ''}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {customerStats.slice(0, 8).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name, props) => [`${Number(value).toFixed(2)} дин`, props.payload.name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">Нема података о купцима</p>
                  )}
                </CardContent>
              </Card>

              {customerStats.length > 0 && (
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Детаљи о купцима</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Име</TableHead>
                            <TableHead>Наруџбине</TableHead>
                            <TableHead className="text-right">Потрошено</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerStats.map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell className="font-medium truncate max-w-48">{customer.name}</TableCell>
                              <TableCell>{customer.orderCount}</TableCell>
                              <TableCell className="text-right">{customer.revenue.toFixed(2)} дин</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Geography Tab */}
          <TabsContent value="geography" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Зарада по подручју</CardTitle>
              </CardHeader>
              <CardContent>
                {geoStats.length > 0 ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={geoStats.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 5, bottom: 5, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" tickFormatter={(value) => `${value} дин`} />
                        <YAxis 
                          type="category" 
                          dataKey="region" 
                          tick={{ fontSize: 12 }}
                          width={120}
                          tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                        />
                        <Tooltip formatter={(value) => [`${value} дин`, 'Приход']} />
                        <Bar dataKey="revenue" fill="#8884d8" barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">Нема географских података</p>
                )}
              </CardContent>
            </Card>

            {geoStats.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Детаљи продаје по регионима</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Регион</TableHead>
                          <TableHead>Наруџбине</TableHead>
                          <TableHead className="text-right">Приход</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {geoStats.map((region, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium truncate max-w-48">{region.region}</TableCell>
                            <TableCell>{region.orderCount}</TableCell>
                            <TableCell className="text-right">{region.revenue.toFixed(2)} дин</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Stats;
