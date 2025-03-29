
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wooCommerceApi } from '@/services/api';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Mail, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    if (!wooCommerceApi.getAuthStatus()) {
      navigate('/');
    }
  }, [navigate]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', page],
    queryFn: async () => {
      try {
        return await wooCommerceApi.getCustomers(page, perPage);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
  });

  const handleContactEmail = (email: string) => {
    window.open(`mailto:${email}`);
  };

  const handleContactPhone = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const filteredCustomers = data?.filter(customer => 
    customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <MobileLayout title="Customers">
        <div className="py-10 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title="Customers">
        <div className="py-10 text-center">
          <p className="text-red-500">Failed to load customers</p>
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
    <MobileLayout title="Customers">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Customers</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredCustomers && filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer: any) => (
              <Card key={customer.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      ID: {customer.id}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    {customer.billing?.company || 'Personal Account'}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                    {customer.email && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactEmail(customer.email);
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    )}
                    
                    {customer.billing?.phone && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactPhone(customer.billing.phone);
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              {searchTerm ? 'No customers match your search' : 'No customers found'}
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

export default Customers;
