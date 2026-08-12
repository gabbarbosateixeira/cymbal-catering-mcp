import React, { useState } from 'react';
import { CateringOrder, OrderStatus, PaymentStatus } from '../types';
import { 
  ShoppingBag, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  FileText, 
  Eye, 
  Edit3, 
  Trash2, 
  ChefHat, 
  Filter,
  ArrowUpDown,
  Layers,
  Sparkles
} from 'lucide-react';

interface OrdersViewProps {
  orders: CateringOrder[];
  onSelectOrder: (order: CateringOrder) => void;
  onEditOrder: (order: CateringOrder) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onOpenNewOrderModal: () => void;
  searchQuery: string;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onSelectOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateOrderStatus,
  onOpenNewOrderModal,
  searchQuery,
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'amount-desc'>('date-asc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter logic
  const filteredOrders = orders.filter(order => {
    // Status tab filter
    if (selectedStatusTab !== 'All' && order.status !== selectedStatusTab) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = order.customerName.toLowerCase().includes(q);
      const matchCompany = order.companyName?.toLowerCase().includes(q);
      const matchEvent = order.eventName.toLowerCase().includes(q);
      const matchItems = order.items.some(i => i.menuItemName.toLowerCase().includes(q));
      if (!matchNumber && !matchCustomer && !matchCompany && !matchEvent && !matchItems) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date-asc') return a.eventDate.localeCompare(b.eventDate);
    if (sortBy === 'date-desc') return b.eventDate.localeCompare(a.eventDate);
    if (sortBy === 'amount-desc') return b.totalAmount - a.totalAmount;
    return 0;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F0E5] text-[#4F6348] border border-[#D5E2D1] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Confirmed</span>;
      case 'In Prep':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF4EB] text-[#A35D2A] border border-[#FFE0CC] flex items-center gap-1"><ChefHat className="w-3.5 h-3.5" /> In Prep</span>;
      case 'Out for Delivery':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF3FA] text-[#2D5A7B] border border-[#CDE1F0] flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Out for Delivery</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0EDE6] text-[#7D756D] border border-[#E5E2D9] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF4EB] text-[#A35D2A] border border-[#FFE0CC] flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FDE8E8] text-[#9B2C2C] border border-[#F8B4B4] flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0EDE6] text-[#7D756D]">{status}</span>;
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid':
        return <span className="text-[10px] uppercase tracking-wider font-bold text-[#4F6348] bg-[#E8F0E5] px-2 py-0.5 rounded-full border border-[#D5E2D1]">Paid</span>;
      case 'Deposit Paid':
        return <span className="text-[10px] uppercase tracking-wider font-bold text-[#A35D2A] bg-[#FFF4EB] px-2 py-0.5 rounded-full border border-[#FFE0CC]">Deposit</span>;
      case 'Invoice Pending':
        return <span className="text-[10px] uppercase tracking-wider font-bold text-[#7D756D] bg-[#F0EDE6] px-2 py-0.5 rounded-full border border-[#E5E2D9]">Invoice Sent</span>;
      case 'Overdue':
        return <span className="text-[10px] uppercase tracking-wider font-bold text-[#9B2C2C] bg-[#FDE8E8] px-2 py-0.5 rounded-full border border-[#F8B4B4]">Overdue</span>;
    }
  };

  const statusCounts = {
    All: orders.length,
    Pending: orders.filter(o => o.status === 'Pending').length,
    Confirmed: orders.filter(o => o.status === 'Confirmed').length,
    'In Prep': orders.filter(o => o.status === 'In Prep').length,
    'Out for Delivery': orders.filter(o => o.status === 'Out for Delivery').length,
    Completed: orders.filter(o => o.status === 'Completed').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Filters & Control Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-xs p-4 space-y-4">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {(['All', 'Confirmed', 'In Prep', 'Pending', 'Out for Delivery', 'Completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedStatusTab(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  selectedStatusTab === tab
                    ? 'bg-[#8C9B7A] text-white shadow-xs'
                    : 'bg-[#F9F8F4] text-[#4A453E] border border-[#E5E2D9] hover:bg-[#E5E2D9]/60'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                  selectedStatusTab === tab ? 'bg-white/20 text-white' : 'bg-[#E5E2D9] text-[#7D756D]'
                }`}>
                  {statusCounts[tab as keyof typeof statusCounts] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Sort & Display Toggle */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-[#7D756D]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8C9B7A]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#F9F8F4] border border-[#E5E2D9] rounded-full px-3 py-1 text-xs text-[#2D2A26] font-medium focus:outline-none focus:ring-1 focus:ring-[#8C9B7A]"
              >
                <option value="date-asc">Sort: Event Date (Earliest)</option>
                <option value="date-desc">Sort: Event Date (Latest)</option>
                <option value="amount-desc">Sort: Order Total ($ High-Low)</option>
              </select>
            </div>

            <div className="flex items-center bg-[#F9F8F4] p-1 rounded-full border border-[#E5E2D9]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#8C9B7A] text-white shadow-xs font-bold' : 'text-[#7D756D] hover:text-[#2D2A26]'
                }`}
                title="Grid View"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#8C9B7A] text-white shadow-xs font-bold' : 'text-[#7D756D] hover:text-[#2D2A26]'
                }`}
                title="Table View"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Orders Output */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#E5E2D9] p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-[#A39E93] mx-auto mb-3" />
          <h3 className="text-[#2D2A26] font-serif text-xl">No catering orders found</h3>
          <p className="text-[#7D756D] text-xs max-w-sm mx-auto mt-1">
            {searchQuery 
              ? `No orders matching "${searchQuery}". Try clearing your search filters.`
              : 'There are no catering orders under this status category.'}
          </p>
          <button
            onClick={onOpenNewOrderModal}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#C68B5C] hover:bg-[#B07A4E] text-white font-semibold text-xs rounded-full transition-colors shadow-xs"
          >
            Create New Catering Order
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {filteredOrders.map((order) => {
            const suppliersActionNeeded = order.requiredSuppliers.filter(s => s.procurementStatus === 'Action Needed').length;

            return (
              <div 
                key={order.id}
                className="bg-white rounded-2xl border border-[#E5E2D9] shadow-xs hover:border-[#8C9B7A] hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-[#F0EDE6] bg-[#FDFCF9]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#7D756D] bg-[#E5E2D9]/60 px-2 py-0.5 rounded-md">
                          {order.orderNumber}
                        </span>
                        {getPaymentBadge(order.paymentStatus)}
                      </div>
                      <h3 className="font-serif font-bold text-[#2D2A26] text-lg mt-1.5 group-hover:text-[#8C9B7A] transition-colors">
                        {order.eventName}
                      </h3>
                      <p className="text-xs text-[#7D756D] font-medium mt-0.5">
                        Client: <strong className="text-[#2D2A26]">{order.customerName}</strong>
                        {order.companyName && <span className="text-[#A39E93]"> ({order.companyName})</span>}
                      </p>
                    </div>

                    {/* Status Dropdown / Badge */}
                    <div className="flex flex-col items-end gap-1.5">
                      {getStatusBadge(order.status)}
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="text-[10px] bg-white border border-[#E5E2D9] rounded-full px-2 py-0.5 text-[#7D756D] hover:border-[#8C9B7A] cursor-pointer focus:outline-none"
                      >
                        <option value="Pending">Mark: Pending</option>
                        <option value="Confirmed">Mark: Confirmed</option>
                        <option value="In Prep">Mark: In Prep</option>
                        <option value="Out for Delivery">Mark: Out for Delivery</option>
                        <option value="Completed">Mark: Completed</option>
                        <option value="Cancelled">Mark: Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Event Time & Logistics Pills */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-[#4A453E]">
                    <div className="flex items-center gap-1.5 bg-white border border-[#E5E2D9] px-2.5 py-1 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-[#C68B5C] shrink-0" />
                      <span className="font-semibold text-[#2D2A26]">{order.eventDate}</span>
                      <span className="text-[#A39E93]">@ {order.eventTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border border-[#E5E2D9] px-2.5 py-1 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-[#8C9B7A] shrink-0" />
                      <span className="font-medium text-[#4A453E]">{order.guestCount} Guests</span>
                    </div>
                  </div>
                </div>

                {/* Items Summary Preview */}
                <div className="p-5 space-y-3 flex-1 bg-white">
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#A39E93]">
                      Catering Line Items ({order.items.length})
                    </p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-[#4A453E]">
                          <span className="truncate pr-2">
                            <span className="font-bold text-[#C68B5C]">{item.quantity}x</span> {item.menuItemName}
                          </span>
                          <span className="font-semibold text-[#2D2A26] shrink-0">${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address & Dietary notes */}
                  <div className="pt-2 border-t border-[#F0EDE6] text-xs text-[#7D756D] space-y-1">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#A39E93] shrink-0 mt-0.5" />
                      <span className="truncate">{order.deliveryAddress}</span>
                    </div>
                    {order.dietaryNotes && (
                      <div className="p-2 bg-[#FFF4EB] rounded-lg border border-[#FFE0CC] text-[#A35D2A] text-[11px] font-medium flex items-start gap-1.5 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 text-[#C68B5C] shrink-0 mt-0.5" />
                        <span><strong>Dietary:</strong> {order.dietaryNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Supplier Procurement Badge */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#8C9B7A]" />
                      <span className="text-[#7D756D] font-medium">Suppliers Needed:</span>
                      {suppliersActionNeeded > 0 ? (
                        <span className="bg-[#FFF4EB] text-[#A35D2A] border border-[#FFE0CC] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {suppliersActionNeeded} Pending Action
                        </span>
                      ) : (
                        <span className="bg-[#E8F0E5] text-[#4F6348] border border-[#D5E2D1] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {order.requiredSuppliers.length} Procured ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3.5 bg-[#F9F8F4] border-t border-[#E5E2D9] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#A39E93] uppercase font-bold tracking-wider">Total Amount</span>
                    <p className="text-lg font-serif font-bold text-[#2D2A26] leading-none mt-0.5">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="px-4 py-2 bg-[#C68B5C] hover:bg-[#B07A4E] text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => onEditOrder(order)}
                      className="p-1.5 text-[#7D756D] hover:text-[#2D2A26] hover:bg-[#E5E2D9]/60 rounded-full transition-colors cursor-pointer"
                      title="Edit Order"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {confirmDeleteId === order.id ? (
                      <button
                        onClick={() => {
                          onDeleteOrder(order.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-xs animate-pulse"
                        title="Click to confirm permanent deletion"
                      >
                        Confirm Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(order.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                        title="Delete Order"
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
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#4A453E]">
              <thead className="bg-[#FDFCF9] border-b border-[#E5E2D9] uppercase font-bold text-[#A39E93] tracking-widest text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Order #</th>
                  <th className="py-3.5 px-5">Event & Customer</th>
                  <th className="py-3.5 px-5">Date & Time</th>
                  <th className="py-3.5 px-5">Guests</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Payment</th>
                  <th className="py-3.5 px-5">Total</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE6]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F9F8F4] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#2D2A26]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-[#2D2A26]">{order.eventName}</p>
                      <p className="text-[11px] text-[#7D756D]">{order.customerName} {order.companyName ? `(${order.companyName})` : ''}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-[#8C9B7A]">{order.eventDate}</p>
                      <p className="text-[11px] text-[#7D756D]">{order.eventTime}</p>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-[#2D2A26]">
                      {order.guestCount}
                    </td>
                    <td className="py-3.5 px-5">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3.5 px-5">
                      {getPaymentBadge(order.paymentStatus)}
                    </td>
                    <td className="py-3.5 px-5 font-serif font-bold text-[#2D2A26] text-sm">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="px-3 py-1 bg-[#8C9B7A] hover:bg-[#7A8A69] text-white rounded-full text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => onEditOrder(order)}
                        className="p-1 text-[#7D756D] hover:text-[#2D2A26] hover:bg-[#E5E2D9] rounded-full inline-block cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {confirmDeleteId === order.id ? (
                        <button
                          onClick={() => {
                            onDeleteOrder(order.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[10px] font-bold transition-all inline-block cursor-pointer"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(order.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full inline-block cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
