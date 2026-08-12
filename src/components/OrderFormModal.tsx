import React, { useState, useEffect } from 'react';
import { CateringOrder, Customer, MenuItem, Supplier, OrderLineItem, OrderStatus, PaymentStatus, OrderSupplierItem } from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  ChefHat, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  Truck
} from 'lucide-react';

interface OrderFormModalProps {
  initialOrder?: CateringOrder | null;
  customers: Customer[];
  menuItems: MenuItem[];
  suppliers: Supplier[];
  preselectedCustomerId?: string;
  onSave: (order: CateringOrder) => void;
  onClose: () => void;
  onQuickAddCustomer?: (customer: Customer) => void;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  initialOrder,
  customers,
  menuItems,
  suppliers,
  preselectedCustomerId,
  onSave,
  onClose,
}) => {
  // Form State
  const [customerId, setCustomerId] = useState<string>(
    initialOrder?.customerId || preselectedCustomerId || (customers[0]?.id || '')
  );
  const [eventName, setEventName] = useState<string>(initialOrder?.eventName || '');
  const [eventDate, setEventDate] = useState<string>(
    initialOrder?.eventDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [eventTime, setEventTime] = useState<string>(initialOrder?.eventTime || '09:00 AM');
  const [guestCount, setGuestCount] = useState<number>(initialOrder?.guestCount || 20);
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    initialOrder?.deliveryAddress || ''
  );
  const [status, setStatus] = useState<OrderStatus>(initialOrder?.status || 'Confirmed');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    initialOrder?.paymentStatus || 'Invoice Pending'
  );
  const [dietaryNotes, setDietaryNotes] = useState<string>(initialOrder?.dietaryNotes || '');
  const [internalNotes, setInternalNotes] = useState<string>(initialOrder?.internalNotes || '');
  
  const [deliveryFee, setDeliveryFee] = useState<number>(initialOrder?.deliveryFee ?? 35.00);

  // Line Items
  const [items, setItems] = useState<OrderLineItem[]>(
    initialOrder?.items || [
      {
        menuItemId: menuItems[0]?.id || '',
        menuItemName: menuItems[0]?.name || '',
        quantity: 2,
        unitPrice: menuItems[0]?.price || 0,
        totalPrice: (menuItems[0]?.price || 0) * 2,
      }
    ]
  );

  // When customer selection changes, update default address
  useEffect(() => {
    if (customerId && !initialOrder) {
      const cust = customers.find(c => c.id === customerId);
      if (cust) {
        setDeliveryAddress(cust.deliveryAddress);
        if (cust.dietaryPreferences && cust.dietaryPreferences.length > 0) {
          setDietaryNotes(cust.dietaryPreferences.join(', '));
        }
      }
    }
  }, [customerId, customers, initialOrder]);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Number((subtotal * 0.085).toFixed(2));
  const grandTotal = Number((subtotal + tax + deliveryFee).toFixed(2));

  // Item change handlers
  const handleItemMenuChange = (index: number, menuItemId: string) => {
    const selectedMenu = menuItems.find(m => m.id === menuItemId);
    if (!selectedMenu) return;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      menuItemId: selectedMenu.id,
      menuItemName: selectedMenu.name,
      unitPrice: selectedMenu.price,
      totalPrice: selectedMenu.price * newItems[index].quantity
    };
    setItems(newItems);
  };

  const handleItemQtyChange = (index: number, quantity: number) => {
    const q = Math.max(1, quantity);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity: q,
      totalPrice: newItems[index].unitPrice * q
    };
    setItems(newItems);
  };

  const handleAddItem = () => {
    const defaultMenu = menuItems[0];
    if (!defaultMenu) return;
    setItems([
      ...items,
      {
        menuItemId: defaultMenu.id,
        menuItemName: defaultMenu.name,
        quantity: 1,
        unitPrice: defaultMenu.price,
        totalPrice: defaultMenu.price
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Auto-generate required suppliers based on selected menu items
  const generateRequiredSuppliers = (): OrderSupplierItem[] => {
    const supplierMap = new Map<string, OrderSupplierItem>();

    items.forEach(lineItem => {
      const menuObj = menuItems.find(m => m.id === lineItem.menuItemId);
      if (menuObj) {
        menuObj.supplierIds.forEach(supId => {
          const supObj = suppliers.find(s => s.id === supId);
          if (supObj && !supplierMap.has(supId)) {
            supplierMap.set(supId, {
              supplierId: supObj.id,
              supplierName: supObj.name,
              ingredientOrItem: `${supObj.category} Supplies`,
              procurementStatus: 'Procured',
              requiredByDate: eventDate
            });
          }
        });
      }
    });

    return Array.from(supplierMap.values());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      alert('Please enter an Event Name.');
      return;
    }

    const selectedCust = customers.find(c => c.id === customerId);
    const customerName = selectedCust ? selectedCust.name : 'Walk-in Client';
    const companyName = selectedCust?.company;

    const orderNumber = initialOrder?.orderNumber || `CYM-2026-${Math.floor(800 + Math.random() * 100)}`;

    const autoSuppliers = generateRequiredSuppliers();

    const newOrder: CateringOrder = {
      id: initialOrder?.id || `ord-${Date.now()}`,
      orderNumber,
      customerId,
      customerName,
      companyName,
      eventName,
      eventDate,
      eventTime,
      guestCount,
      deliveryAddress,
      status,
      paymentStatus,
      items,
      subtotal,
      tax,
      deliveryFee,
      totalAmount: grandTotal,
      dietaryNotes,
      internalNotes,
      requiredSuppliers: initialOrder?.requiredSuppliers?.length ? initialOrder.requiredSuppliers : autoSuppliers,
      createdDate: initialOrder?.createdDate || new Date().toISOString().split('T')[0]
    };

    onSave(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2A26]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Form Modal Header */}
        <div className="bg-[#2D2A26] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#E5E2D9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8C9B7A] text-white font-bold flex items-center justify-center text-sm shadow-md">
              <ChefHat className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
                {initialOrder ? `Edit Order (${initialOrder.orderNumber})` : 'New Catering Event Order'}
              </h2>
              <p className="text-xs text-[#A39E93]">
                Configure catering items, logistics, and pricing for Cymbal Bakery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#A39E93] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#F9F8F4]">
          
          {/* Customer & Event Basic Info */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-[#A39E93] tracking-widest">
              1. Customer & Event Overview
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                  Select Customer (CRM) *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A] focus:outline-none"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''} - {c.segment}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Name */}
              <div>
                <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Tech All-Hands Breakfast"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A] focus:outline-none"
                  required
                />
              </div>

            </div>

            {/* Date, Time, Guest Count */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                  Delivery / Pickup Time *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 08:30 AM"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                  Guest Count *
                </label>
                <input
                  type="number"
                  min="1"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#F9F8F4] border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                Delivery Location / Venue Address *
              </label>
              <input
                type="text"
                placeholder="Full delivery street address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full bg-[#F9F8F4] border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Line Items Selection */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase font-bold text-[#A39E93] tracking-widest">
                2. Catering Menu Items
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-1.5 bg-[#C68B5C] hover:bg-[#B07A4E] text-white font-semibold text-xs rounded-full inline-flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Menu Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="p-3 bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl grid grid-cols-12 gap-3 items-center">
                  
                  {/* Select Menu Item */}
                  <div className="col-span-12 sm:col-span-6">
                    <label className="block text-[10px] font-semibold text-[#A39E93] uppercase mb-0.5">
                      Select Reserve Menu Item
                    </label>
                    <select
                      value={item.menuItemId}
                      onChange={(e) => handleItemMenuChange(index, e.target.value)}
                      className="w-full bg-white border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-lg p-2 font-medium focus:ring-1 focus:ring-[#8C9B7A]"
                    >
                      {Array.from(new Set(menuItems.map(m => m.category))).map((cat: string) => (
                        <optgroup key={cat} label={`✦ ${cat.toUpperCase()}`}>
                          {menuItems.filter(m => m.category === cat).map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} — ${m.price.toFixed(2)} ({m.servings})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {(() => {
                      const selectedItem = menuItems.find(m => m.id === item.menuItemId);
                      if (!selectedItem) return null;
                      return (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[#7D756D]">
                          <span className="px-2 py-0.5 rounded-md bg-[#8C9B7A]/15 text-[#4F6348] font-bold text-[10px]">
                            {selectedItem.category}
                          </span>
                          <span className="font-semibold text-[#2D2A26]">${selectedItem.price.toFixed(2)} unit price</span>
                          <span className="text-[#A39E93]">•</span>
                          <span className="italic truncate max-w-xs">{selectedItem.servings}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-[#A39E93] uppercase mb-0.5">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemQtyChange(index, parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-lg p-2 font-bold text-center focus:ring-1 focus:ring-[#8C9B7A]"
                    />
                  </div>

                  {/* Price */}
                  <div className="col-span-5 sm:col-span-3 text-right">
                    <label className="block text-[10px] font-semibold text-[#A39E93] uppercase mb-0.5">Subtotal</label>
                    <span className="font-serif font-bold text-[#2D2A26] text-sm">
                      ${item.totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <div className="col-span-3 sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-[#C68B5C] hover:text-[#B07A4E] disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Financial Summary Calculation */}
            <div className="bg-[#FDFCF9] p-4 rounded-xl border border-[#E5E2D9] space-y-2 text-xs font-mono text-[#7D756D]">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8.5%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans">Delivery Fee ($):</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-white border border-[#E5E2D9] text-right text-xs p-1 rounded-lg font-mono text-[#2D2A26]"
                />
              </div>
              <div className="flex justify-between text-sm font-bold text-[#2D2A26] border-t border-[#E5E2D9] pt-2 font-sans">
                <span>Calculated Order Total:</span>
                <span className="text-[#C68B5C] text-lg font-serif font-bold">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-4">
            <h3 className="text-[10px] uppercase font-bold text-[#A39E93] tracking-widest">
              3. Order Status & Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D2A26] mb-1">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full bg-[#F9F8F4] border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Prep">In Prep</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2A26] mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full bg-[#F9F8F4] border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium"
                >
                  <option value="Paid">Paid</option>
                  <option value="Deposit Paid">Deposit Paid</option>
                  <option value="Invoice Pending">Invoice Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                Dietary & Special Instructions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Nut allergy flags on croissant platter, 5 gluten-free boxes"
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                className="w-full bg-[#F9F8F4] border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                Internal Bakery Kitchen Prep Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Dough room bake starts 4 AM, refrigerated delivery vehicle required"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full bg-[#F9F8F4] border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#F9F8F4] border border-[#E5E2D9] hover:bg-[#E5E2D9] text-[#2D2A26] font-semibold text-xs rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#C68B5C] hover:bg-[#B07A4E] text-white font-semibold text-xs rounded-full transition-all shadow-xs cursor-pointer"
            >
              {initialOrder ? 'Save Order Changes' : 'Create Catering Order'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
