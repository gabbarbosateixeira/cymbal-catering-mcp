import React, { useState } from 'react';
import { Customer, CateringOrder, ActivityNote } from '../types';
import { 
  X, 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  Clock, 
  Plus, 
  MessageSquare, 
  Send,
  ChefHat,
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer | null;
  orders: CateringOrder[];
  onClose: () => void;
  onBookOrder: (customerId: string) => void;
  onSelectOrder: (order: CateringOrder) => void;
  onAddActivityNote: (customerId: string, note: ActivityNote) => void;
  onDeleteCustomer?: (customerId: string) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  orders,
  onClose,
  onBookOrder,
  onSelectOrder,
  onAddActivityNote,
  onDeleteCustomer,
}) => {
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteType, setNewNoteType] = useState<'Note' | 'Call' | 'Meeting' | 'Email'>('Note');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  if (!customer) return null;

  // Filter orders for this customer
  const customerOrders = orders.filter(o => o.customerId === customer.id);
  const totalSpend = customerOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
  const avgOrderValue = customerOrders.length > 0 ? totalSpend / customerOrders.length : 0;

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const note: ActivityNote = {
      id: `act-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author: 'Cymbal Manager',
      text: newNoteText.trim(),
      type: newNoteType
    };

    onAddActivityNote(customer.id, note);
    setNewNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2A26]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#2D2A26] text-white p-5 flex items-center justify-between border-b border-[#E5E2D9]">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full bg-[#8C9B7A] text-white font-bold flex items-center justify-center text-lg shadow-md`}>
              {customer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-white tracking-tight">
                  {customer.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#8C9B7A]/20 text-[#8C9B7A] font-semibold border border-[#8C9B7A]/30">
                  {customer.segment}
                </span>
              </div>
              <p className="text-xs text-[#A39E93] font-medium mt-0.5 flex items-center gap-2">
                {customer.company && <span>{customer.company} •</span>}
                <span>Status: <strong className="text-[#8C9B7A]">{customer.status}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onBookOrder(customer.id);
              }}
              className="px-4 py-2 bg-[#C68B5C] hover:bg-[#B07A4E] text-white font-semibold text-xs rounded-full inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Book Catering Event</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#A39E93] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#F9F8F4]">
          
          {/* LTV Financial Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#A39E93] tracking-wider">Lifetime Revenue</span>
              <p className="text-xl font-serif font-bold text-[#2D2A26] mt-0.5">${totalSpend.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#A39E93] tracking-wider">Total Events</span>
              <p className="text-xl font-serif font-bold text-[#2D2A26] mt-0.5">{customerOrders.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#A39E93] tracking-wider">Average Order Spend</span>
              <p className="text-xl font-serif font-bold text-[#2D2A26] mt-0.5">${avgOrderValue.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E5E2D9] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#A39E93] tracking-wider">Account Created</span>
              <p className="text-sm font-bold text-[#7D756D] mt-1">{customer.createdDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Catering Order History */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Order History */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
                  <h3 className="font-serif font-bold text-[#2D2A26] text-base flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-[#C68B5C]" />
                    Catering Event History ({customerOrders.length})
                  </h3>
                  <button
                    onClick={() => {
                      onClose();
                      onBookOrder(customer.id);
                    }}
                    className="text-xs font-semibold text-[#C68B5C] hover:text-[#B07A4E] cursor-pointer"
                  >
                    + Book Catering Event
                  </button>
                </div>

                {customerOrders.length === 0 ? (
                  <p className="text-xs text-[#7D756D] italic py-4 text-center">
                    No catering orders recorded for this client yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="p-3.5 bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl flex items-center justify-between hover:bg-[#E5E2D9]/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#2D2A26]">{order.orderNumber}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-[#E5E2D9] text-[#7D756D]">
                              {order.status}
                            </span>
                          </div>
                          <p className="font-semibold text-[#2D2A26] text-xs mt-1">{order.eventName}</p>
                          <p className="text-[11px] text-[#7D756D]">{order.eventDate} @ {order.eventTime} • {order.guestCount} guests</p>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="font-serif font-bold text-[#2D2A26] text-sm">${order.totalAmount.toFixed(2)}</span>
                            <p className="text-[10px] text-[#A39E93]">{order.paymentStatus}</p>
                          </div>
                          <button
                            onClick={() => {
                              onClose();
                              onSelectOrder(order);
                            }}
                            className="p-2 bg-[#2D2A26] text-white rounded-lg hover:bg-[#8C9B7A] transition-colors cursor-pointer"
                            title="View Order Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity & Note History Timeline */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#2D2A26] text-base flex items-center gap-2 border-b border-[#E5E2D9] pb-3">
                  <MessageSquare className="w-4 h-4 text-[#C68B5C]" />
                  CRM Activity & Note Timeline
                </h3>

                {/* Add Note Form */}
                <form onSubmit={handleAddNoteSubmit} className="bg-[#F9F8F4] p-3.5 rounded-xl border border-[#E5E2D9] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase text-[#A39E93] tracking-wider">Log Activity Note</span>
                    <select
                      value={newNoteType}
                      onChange={(e) => setNewNoteType(e.target.value as any)}
                      className="bg-white border border-[#E5E2D9] rounded-lg text-xs px-2.5 py-1 text-[#2D2A26] font-medium"
                    >
                      <option value="Note">Note</option>
                      <option value="Call">Phone Call</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add interaction detail, preference update, or feedback..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-1 bg-white border border-[#E5E2D9] rounded-xl px-3 py-1.5 text-xs text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#8C9B7A]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#C68B5C] hover:bg-[#B07A4E] text-white font-semibold text-xs rounded-full inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Log
                    </button>
                  </div>
                </form>

                {/* Notes List */}
                <div className="space-y-3 pt-1">
                  {!customer.activityLog || customer.activityLog.length === 0 ? (
                    <p className="text-xs text-[#A39E93] italic">No activity logs recorded yet.</p>
                  ) : (
                    customer.activityLog.map((act) => (
                      <div key={act.id} className="p-3 bg-[#F9F8F4] border-l-4 border-[#8C9B7A] rounded-r-xl space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-[#7D756D]">
                          <span className="font-semibold text-[#2D2A26]">{act.type} by {act.author}</span>
                          <span>{act.date}</span>
                        </div>
                        <p className="text-xs text-[#2D2A26] font-medium">{act.text}</p>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>

            {/* Right Column: Customer Info & Preferences */}
            <div className="space-y-6">
              
              <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-[#2D2A26] text-base border-b border-[#E5E2D9] pb-2">
                  Client Contact Details
                </h3>

                <div className="space-y-3 text-xs text-[#2D2A26]">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-[#A39E93] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-[#A39E93] uppercase font-bold block tracking-wider">Email Address</span>
                      <a href={`mailto:${customer.email}`} className="text-[#C68B5C] font-semibold hover:underline">
                        {customer.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-[#A39E93] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-[#A39E93] uppercase font-bold block tracking-wider">Phone Number</span>
                      <span className="font-semibold text-[#2D2A26]">{customer.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#A39E93] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-[#A39E93] uppercase font-bold block tracking-wider">Primary Delivery Address</span>
                      <span className="font-medium text-[#7D756D]">{customer.deliveryAddress}</span>
                    </div>
                  </div>
                </div>

                {customer.dietaryPreferences && customer.dietaryPreferences.length > 0 && (
                  <div className="pt-3 border-t border-[#E5E2D9]">
                    <span className="text-[10px] text-[#A39E93] uppercase font-bold block mb-1.5 tracking-wider">
                      Dietary Requirements
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {customer.dietaryPreferences.map((pref, idx) => (
                        <span key={idx} className="bg-[#8C9B7A]/15 text-[#8C9B7A] border border-[#8C9B7A]/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {customer.notes && (
                  <div className="pt-3 border-t border-[#E5E2D9]">
                    <span className="text-[10px] text-[#A39E93] uppercase font-bold block mb-1 tracking-wider">
                      Account Notes
                    </span>
                    <p className="text-xs text-[#7D756D] italic bg-[#F9F8F4] p-3 rounded-xl border border-[#E5E2D9]">
                      {customer.notes}
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-[#E5E2D9] p-4 flex items-center justify-between">
          <div>
            {onDeleteCustomer && (
              confirmDelete ? (
                <button
                  onClick={() => {
                    onDeleteCustomer(customer.id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full transition-colors cursor-pointer animate-pulse"
                >
                  Confirm Delete Client
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-full font-semibold text-xs transition-colors cursor-pointer"
                >
                  Delete Client
                </button>
              )
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#F9F8F4] border border-[#E5E2D9] hover:bg-[#E5E2D9] text-[#2D2A26] font-semibold text-xs rounded-full transition-colors cursor-pointer"
          >
            Close CRM Profile
          </button>
        </div>

      </div>
    </div>
  );
};
