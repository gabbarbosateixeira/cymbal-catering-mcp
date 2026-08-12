import React, { useState } from 'react';
import { Customer, CateringOrder, ClientSegment, RelationshipStatus } from '../types';
import { 
  Users, 
  User, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  ShoppingBag, 
  MessageSquare,
  Search,
  Filter,
  Sparkles,
  Award,
  ChevronRight,
  LayoutGrid,
  List,
  MapPin
} from 'lucide-react';

interface CustomerCRMViewProps {
  customers: Customer[];
  orders: CateringOrder[];
  onSelectCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onBookOrderForCustomer: (customerId: string) => void;
  onOpenNewCustomerModal: () => void;
  searchQuery: string;
}

export const CustomerCRMView: React.FC<CustomerCRMViewProps> = ({
  customers,
  orders,
  onSelectCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onBookOrderForCustomer,
  onOpenNewCustomerModal,
  searchQuery,
}) => {
  const [selectedSegment, setSelectedSegment] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Compute spend and order stats per customer
  const customerStatsMap = customers.reduce((acc, cust) => {
    const custOrders = orders.filter(o => o.customerId === cust.id && o.status !== 'Cancelled');
    const totalSpend = custOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const orderCount = custOrders.length;
    const lastOrder = custOrders.sort((a, b) => b.eventDate.localeCompare(a.eventDate))[0];
    acc[cust.id] = {
      totalSpend,
      orderCount,
      lastEventDate: lastOrder ? lastOrder.eventDate : 'No events yet'
    };
    return acc;
  }, {} as Record<string, { totalSpend: number; orderCount: number; lastEventDate: string }>);

  // Filter logic
  const filteredCustomers = customers.filter(cust => {
    if (selectedSegment !== 'All' && cust.segment !== selectedSegment) return false;
    if (selectedStatus !== 'All' && cust.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cust.name.toLowerCase().includes(q);
      const matchCompany = cust.company?.toLowerCase().includes(q);
      const matchEmail = cust.email.toLowerCase().includes(q);
      const matchPhone = cust.phone.toLowerCase().includes(q);
      if (!matchName && !matchCompany && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const getSegmentBadge = (segment: ClientSegment) => {
    switch (segment) {
      case 'Corporate Tech':
        return <span className="bg-[#EAF3FA] text-[#2D5A7B] border border-[#CDE1F0] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Corporate Tech</span>;
      case 'Weddings & Celebrations':
        return <span className="bg-[#FFF4EB] text-[#A35D2A] border border-[#FFE0CC] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Weddings & Milestone</span>;
      case 'Small Business':
        return <span className="bg-[#E8F0E5] text-[#4F6348] border border-[#D5E2D1] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Small Business</span>;
      case 'Educational / Non-Profit':
        return <span className="bg-[#F0EDE6] text-[#7D756D] border border-[#E5E2D9] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Educational / Non-Profit</span>;
      default:
        return <span className="bg-[#F0EDE6] text-[#7D756D] border border-[#E5E2D9] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">{segment}</span>;
    }
  };

  const getStatusBadge = (status: RelationshipStatus) => {
    switch (status) {
      case 'Active Recurring':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#4F6348] bg-[#E8F0E5] px-2.5 py-0.5 rounded-full border border-[#D5E2D1]">Active Recurring</span>;
      case 'Regular Client':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#2D5A7B] bg-[#EAF3FA] px-2.5 py-0.5 rounded-full border border-[#CDE1F0]">Regular Client</span>;
      case 'New Lead':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#A35D2A] bg-[#FFF4EB] px-2.5 py-0.5 rounded-full border border-[#FFE0CC]">New Lead</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#7D756D] bg-[#F0EDE6] px-2.5 py-0.5 rounded-full border border-[#E5E2D9]">Inactive</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* CRM Filter Controls */}
      <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-xs p-4 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Segment Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="text-xs font-bold text-[#A39E93] uppercase tracking-widest shrink-0 mr-1">
              Segment:
            </span>
            {['All', 'Corporate Tech', 'Weddings & Celebrations', 'Small Business', 'Educational / Non-Profit'].map((seg) => (
              <button
                key={seg}
                onClick={() => setSelectedSegment(seg)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedSegment === seg
                    ? 'bg-[#8C9B7A] text-white shadow-xs'
                    : 'bg-[#F9F8F4] text-[#4A453E] border border-[#E5E2D9] hover:bg-[#E5E2D9]/60'
                }`}
              >
                {seg}
              </button>
            ))}
          </div>

          {/* Relationship Status Filter & View Toggle */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-medium text-[#7D756D]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#F9F8F4] border border-[#E5E2D9] rounded-full px-3 py-1 text-xs text-[#2D2A26] font-medium focus:outline-none focus:ring-1 focus:ring-[#8C9B7A]"
            >
              <option value="All">All Statuses</option>
              <option value="Active Recurring">Active Recurring</option>
              <option value="Regular Client">Regular Client</option>
              <option value="New Lead">New Lead</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#F9F8F4] border border-[#E5E2D9] rounded-full p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#8C9B7A] text-white shadow-xs'
                    : 'text-[#7D756D] hover:text-[#2D2A26]'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#8C9B7A] text-white shadow-xs'
                    : 'text-[#7D756D] hover:text-[#2D2A26]'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onOpenNewCustomerModal}
              className="px-4 py-1.5 bg-[#C68B5C] hover:bg-[#B07A4E] text-white font-semibold text-xs rounded-full inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Client</span>
            </button>
          </div>

        </div>

      </div>

      {/* Customer Directory */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#E5E2D9] p-12 text-center">
          <Users className="w-12 h-12 text-[#A39E93] mx-auto mb-3" />
          <h3 className="text-[#2D2A26] font-serif text-xl">No clients found</h3>
          <p className="text-[#7D756D] text-xs max-w-sm mx-auto mt-1">
            No CRM contacts match your current segment or search parameters.
          </p>
          <button
            onClick={onOpenNewCustomerModal}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#C68B5C] hover:bg-[#B07A4E] text-white font-semibold text-xs rounded-full transition-colors cursor-pointer"
          >
            Add New Client
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2D2A26]">
              <thead className="bg-[#F9F8F4] border-b border-[#E5E2D9] text-[#7D756D] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Client Contact</th>
                  <th className="py-3 px-4">Segment & Status</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE6]">
                {filteredCustomers.map((customer) => {
                  const stats = customerStatsMap[customer.id] || { totalSpend: 0, orderCount: 0, lastEventDate: 'None' };
                  return (
                    <tr key={customer.id} className="hover:bg-[#FDFCF9] transition-colors">
                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${customer.avatarColor || 'bg-[#C68B5C]'} text-white font-serif font-bold flex items-center justify-center text-xs shrink-0`}>
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-[#2D2A26] text-sm hover:text-[#8C9B7A] cursor-pointer" onClick={() => onSelectCustomer(customer)}>
                              {customer.name}
                            </div>
                            {customer.company && (
                              <div className="text-[11px] text-[#7D756D] flex items-center gap-1">
                                <Building className="w-3 h-3 text-[#A39E93]" />
                                {customer.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <div>{getSegmentBadge(customer.segment)}</div>
                        <div>{getStatusBadge(customer.status)}</div>
                      </td>
                      <td className="py-3.5 px-4 space-y-1 text-xs text-[#4A453E]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-[#A39E93]" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[#A39E93]" />
                          <span>{customer.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#4A453E] max-w-xs truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#A39E93] shrink-0" />
                          <span className="truncate">{customer.deliveryAddress}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-serif font-bold text-sm text-[#2D2A26]">
                          ${stats.totalSpend.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-[#7D756D]">
                          {stats.orderCount} catering event{stats.orderCount !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onBookOrderForCustomer(customer.id)}
                            className="px-2.5 py-1 bg-[#8C9B7A] hover:bg-[#7A8A69] text-white rounded-full text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            title="Book Catering Order"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Book</span>
                          </button>
                          <button
                            onClick={() => onSelectCustomer(customer)}
                            className="px-2.5 py-1 bg-[#C68B5C] hover:bg-[#B07A4E] text-white rounded-full text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            title="View Profile"
                          >
                            <Eye className="w-3 h-3" /> Profile
                          </button>
                          <button
                            onClick={() => onEditCustomer(customer)}
                            className="p-1 text-[#7D756D] hover:text-[#2D2A26] hover:bg-[#E5E2D9]/60 rounded-full cursor-pointer transition-colors"
                            title="Edit Client"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {confirmDeleteId === customer.id ? (
                            <button
                              onClick={() => {
                                onDeleteCustomer(customer.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[10px] font-bold transition-all cursor-pointer animate-pulse"
                              title="Click to confirm client deletion"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(customer.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full cursor-pointer transition-colors"
                              title="Delete Client"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((customer) => {
            const stats = customerStatsMap[customer.id] || { totalSpend: 0, orderCount: 0, lastEventDate: 'None' };

            return (
              <div 
                key={customer.id}
                className="bg-white rounded-2xl border border-[#E5E2D9] shadow-xs hover:border-[#8C9B7A] hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-[#F0EDE6] bg-[#FDFCF9]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full ${customer.avatarColor || 'bg-[#C68B5C]'} text-white font-serif font-bold flex items-center justify-center text-sm shadow-xs shrink-0`}>
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-[#2D2A26] text-lg group-hover:text-[#8C9B7A] transition-colors">
                          {customer.name}
                        </h3>
                        {customer.company && (
                          <p className="text-xs font-semibold text-[#7D756D] flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-[#A39E93]" />
                            {customer.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      {getStatusBadge(customer.status)}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {getSegmentBadge(customer.segment)}
                  </div>
                </div>

                {/* Contact & LTV Stats */}
                <div className="p-5 space-y-3 bg-white flex-1">
                  
                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-[#4A453E]">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#A39E93] shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#A39E93] shrink-0" />
                      <span>{customer.phone}</span>
                    </p>
                  </div>

                  {/* LTV & Order Count Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0EDE6] text-xs">
                    <div className="bg-[#F9F8F4] p-2.5 rounded-xl border border-[#E5E2D9]">
                      <span className="text-[10px] text-[#A39E93] font-bold uppercase tracking-wider">Lifetime Spend</span>
                      <p className="text-base font-serif font-bold text-[#2D2A26] mt-0.5">
                        ${stats.totalSpend.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-[#F9F8F4] p-2.5 rounded-xl border border-[#E5E2D9]">
                      <span className="text-[10px] text-[#A39E93] font-bold uppercase tracking-wider">Catering Events</span>
                      <p className="text-base font-serif font-bold text-[#2D2A26] mt-0.5">
                        {stats.orderCount} <span className="text-xs font-sans font-normal text-[#7D756D]">orders</span>
                      </p>
                    </div>
                  </div>

                  {/* Dietary / Preference Tag */}
                  {customer.dietaryPreferences && customer.dietaryPreferences.length > 0 && (
                    <div className="text-[11px] text-[#A35D2A] bg-[#FFF4EB] p-2.5 rounded-xl border border-[#FFE0CC]">
                      <strong>Preferences:</strong> {customer.dietaryPreferences.join(', ')}
                    </div>
                  )}

                  {/* Activity Log preview */}
                  {customer.activityLog && customer.activityLog.length > 0 && (
                    <p className="text-[11px] text-[#7D756D] italic flex items-center gap-1 truncate pt-1">
                      <MessageSquare className="w-3 h-3 text-[#A39E93] shrink-0" />
                      <span>Latest Note: "{customer.activityLog[0].text}"</span>
                    </p>
                  )}

                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3.5 bg-[#F9F8F4] border-t border-[#E5E2D9] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onBookOrderForCustomer(customer.id)}
                    className="px-3.5 py-1.5 bg-[#8C9B7A] hover:bg-[#7A8A69] text-white rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Book Order</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectCustomer(customer)}
                      className="px-3 py-1.5 bg-[#C68B5C] hover:bg-[#B07A4E] text-white rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> Profile
                    </button>
                    <button
                      onClick={() => onEditCustomer(customer)}
                      className="p-1.5 text-[#7D756D] hover:text-[#2D2A26] hover:bg-[#E5E2D9]/60 rounded-full transition-colors cursor-pointer"
                      title="Edit Client"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {confirmDeleteId === customer.id ? (
                      <button
                        onClick={() => {
                          onDeleteCustomer(customer.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[11px] font-bold transition-all cursor-pointer animate-pulse"
                        title="Click to confirm client deletion"
                      >
                        Confirm Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(customer.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                        title="Delete Client"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
