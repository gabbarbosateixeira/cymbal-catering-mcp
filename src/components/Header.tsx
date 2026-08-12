import React from 'react';
import { 
  ShoppingBag, 
  Users, 
  Truck, 
  BookOpen, 
  Calendar, 
  Plus, 
  Search,
  Sparkles,
  ChefHat
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'orders' | 'crm' | 'menu' | 'calendar';
  setActiveTab: (tab: 'orders' | 'crm' | 'menu' | 'calendar') => void;
  onOpenNewOrderModal: () => void;
  onOpenNewCustomerModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  orderCount: number;
  customerCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewOrderModal,
  onOpenNewCustomerModal,
  searchQuery,
  setSearchQuery,
  orderCount,
  customerCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white text-[#2D2A26] border-b border-[#E5E2D9] shadow-xs">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('orders')}>
            <div className="w-10 h-10 bg-[#8C9B7A] rounded-full flex items-center justify-center text-white shadow-xs shrink-0">
              <span className="font-serif text-xl font-bold">C</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-semibold text-[#2D2A26] tracking-tight">
                  Cymbal Bakery
                </span>
                <span className="text-[#8C9B7A] bg-[#E8F0E5] border border-[#D5E2D1] font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Catering
                </span>
              </div>
              <p className="text-xs text-[#7D756D] font-medium">
                Catering Orders & Customer CRM
              </p>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#A39E93]" />
              <input
                type="text"
                placeholder="Search orders, clients, events, or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-[#F9F8F4] border border-[#E5E2D9] rounded-full text-xs text-[#2D2A26] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#8C9B7A]/50 focus:border-[#8C9B7A] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-xs text-[#A39E93] hover:text-[#2D2A26]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenNewCustomerModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F9F8F4] hover:bg-[#E5E2D9] text-[#2D2A26] border border-[#E5E2D9] rounded-full text-xs font-semibold transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-[#8C9B7A]" />
              <span>+ Add Client</span>
            </button>

            <button
              onClick={onOpenNewOrderModal}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#C68B5C] hover:bg-[#B07A4E] text-white font-semibold rounded-full text-xs tracking-wide shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ New Order</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#A39E93]" />
            <input
              type="text"
              placeholder="Search orders, clients, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#F9F8F4] border border-[#E5E2D9] rounded-full text-xs text-[#2D2A26] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#8C9B7A]"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-t border-[#F0EDE6] pt-2 pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 pb-1 transition-all whitespace-nowrap text-xs font-medium cursor-pointer ${
              activeTab === 'orders'
                ? 'text-[#8C9B7A] border-b-2 border-[#8C9B7A] font-bold'
                : 'text-[#4A453E] hover:text-[#8C9B7A]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Catering Orders</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'orders' ? 'bg-[#E8F0E5] text-[#4F6348]' : 'bg-[#E5E2D9]/50 text-[#7D756D]'
            }`}>
              {orderCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('crm')}
            className={`flex items-center gap-2 pb-1 transition-all whitespace-nowrap text-xs font-medium cursor-pointer ${
              activeTab === 'crm'
                ? 'text-[#8C9B7A] border-b-2 border-[#8C9B7A] font-bold'
                : 'text-[#4A453E] hover:text-[#8C9B7A]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer CRM</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'crm' ? 'bg-[#E8F0E5] text-[#4F6348]' : 'bg-[#E5E2D9]/50 text-[#7D756D]'
            }`}>
              {customerCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 pb-1 transition-all whitespace-nowrap text-xs font-medium cursor-pointer ${
              activeTab === 'menu'
                ? 'text-[#8C9B7A] border-b-2 border-[#8C9B7A] font-bold'
                : 'text-[#4A453E] hover:text-[#8C9B7A]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Menu Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 pb-1 transition-all whitespace-nowrap text-xs font-medium cursor-pointer ${
              activeTab === 'calendar'
                ? 'text-[#8C9B7A] border-b-2 border-[#8C9B7A] font-bold'
                : 'text-[#4A453E] hover:text-[#8C9B7A]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Event Calendar</span>
          </button>
        </div>

      </div>
    </header>
  );
};
