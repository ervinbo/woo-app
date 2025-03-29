
import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Users, BarChart, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { wooCommerceApi } from '@/services/api';
import { toast } from '@/lib/toast';

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    wooCommerceApi.clearCredentials();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', icon: <Home size={24} />, path: '/dashboard' },
    { label: 'Products', icon: <Package size={24} />, path: '/products' },
    { label: 'Orders', icon: <ShoppingCart size={24} />, path: '/orders' },
    { label: 'Customers', icon: <Users size={24} />, path: '/customers' },
    { label: 'Stats', icon: <BarChart size={24} />, path: '/stats' },
    { label: 'Settings', icon: <Settings size={24} />, path: '/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold">{title}</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout}
          className="text-white hover:bg-primary/80"
        >
          <LogOut size={22} />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {children}
      </main>

      {/* Navigation Bar - Fixed at the bottom */}
      <nav className="bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] px-2 py-1 fixed bottom-0 left-0 right-0 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`flex flex-col items-center py-2 px-1 ${
                isActive(item.path) 
                  ? 'text-primary' 
                  : 'text-gray-500 hover:text-primary hover:bg-transparent'
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
