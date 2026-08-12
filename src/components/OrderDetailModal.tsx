import React, { useState } from 'react';
import { CateringOrder, Customer, OrderStatus } from '../types';
import { 
  X, 
  Printer, 
  ChefHat, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Building, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  DollarSign, 
  Phone, 
  Mail, 
  FileText,
  ExternalLink,
  Tag,
  PackageCheck,
  Trash2
} from 'lucide-react';

interface OrderDetailModalProps {
  order: CateringOrder | null;
  customer?: Customer;
  onClose: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onToggleSupplierProcurement: (orderId: string, supplierId: string, currentStatus: 'Procured' | 'Ordered' | 'Action Needed') => void;
  onOpenCustomerCRM: (customerId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  customer,
  onClose,
  onUpdateOrderStatus,
  onToggleSupplierProcurement,
  onOpenCustomerCRM,
  onDeleteOrder,
}) => {
  const [printMode, setPrintMode] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2A26]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Header Bar */}
        <div className="bg-[#2D2A26] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#E5E2D9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8C9B7A] text-white font-bold flex items-center justify-center text-sm shadow-md">
              <ChefHat className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#E5E2D9] font-bold tracking-wider">
                  {order.orderNumber}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#8C9B7A]/30 text-white font-semibold">
                  {order.paymentStatus}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
                {order.eventName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrintMode(!printMode)}
              className={`p-2 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                printMode ? 'bg-[#C68B5C] text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Toggle Invoice / Kitchen Ticket Preview"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{printMode ? 'Standard View' : 'Print Invoice'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#A39E93] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#F9F8F4]">
          
          {printMode ? (
            /* PRINT / INVOICE PREVIEW MODE */
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E2D9] shadow-sm space-y-6 text-[#2D2A26]" id="printable-invoice">
              
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-[#E5E2D9] pb-6">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-[#2D2A26] tracking-tight">Cymbal Bakery</h1>
                  <p className="text-xs text-[#7D756D]">Artisan Bakery & Catering Management</p>
                  <p className="text-xs text-[#7D756D]">550 Mission St, San Francisco, CA 94105</p>
                  <p className="text-xs text-[#7D756D]">catering@cymbalbakery.com • (415) 555-BAKE</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-serif font-bold text-[#C68B5C] uppercase tracking-wider">Catering Invoice</h2>
                  <p className="font-mono text-sm font-bold text-[#2D2A26]">{order.orderNumber}</p>
                  <p className="text-xs text-[#7D756D]">Issued: {order.createdDate}</p>
                  <p className="text-xs text-[#7D756D] font-semibold mt-1">Event Date: {order.eventDate}</p>
                </div>
              </div>

              {/* Billed To / Logistics */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h3 className="font-bold uppercase text-[10px] tracking-widest text-[#A39E93] mb-1">Billed To</h3>
                  <p className="font-serif font-bold text-[#2D2A26] text-sm">{order.customerName}</p>
                  {order.companyName && <p className="font-medium text-[#7D756D]">{order.companyName}</p>}
                  {customer && (
                    <>
                      <p className="text-[#7D756D]">{customer.email}</p>
                      <p className="text-[#7D756D]">{customer.phone}</p>
                    </>
                  )}
                </div>
                <div>
                  <h3 className="font-bold uppercase text-[10px] tracking-widest text-[#A39E93] mb-1">Event Delivery Details</h3>
                  <p className="font-serif font-bold text-[#2D2A26]">{order.eventName}</p>
                  <p className="text-[#7D756D]">{order.deliveryAddress}</p>
                  <p className="text-[#7D756D]">Delivery Time: <strong>{order.eventTime}</strong></p>
                  <p className="text-[#7D756D]">Guest Count: <strong>{order.guestCount} guests</strong></p>
                </div>
              </div>

              {/* Invoice Line Items */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#E5E2D9] text-[#A39E93] uppercase text-[10px] font-bold">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE6]">
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 font-medium text-[#2D2A26]">{item.menuItemName}</td>
                      <td className="py-2.5 text-center font-bold text-[#2D2A26]">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono text-[#7D756D]">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-serif font-bold text-[#2D2A26]">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Invoice Totals */}
              <div className="flex justify-between items-end border-t border-[#E5E2D9] pt-4">
                <div className="text-xs text-[#7D756D] max-w-xs">
                  <p className="font-semibold text-[#2D2A26]">Special Instructions & Dietary Notes:</p>
                  <p className="italic">{order.dietaryNotes || 'Standard kitchen preparation and packaging.'}</p>
                </div>
                <div className="w-48 text-xs space-y-1 text-right">
                  <div className="flex justify-between text-[#7D756D]">
                    <span>Subtotal:</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#7D756D]">
                    <span>Tax (8.5%):</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#7D756D]">
                    <span>Delivery Fee:</span>
                    <span>${order.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#2D2A26] border-t border-[#E5E2D9] pt-1">
                    <span>Total Due:</span>
                    <span className="text-[#C68B5C] font-serif">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-[#F0EDE6]">
                <button
                  onClick={handlePrint}
                  className="px-5 py-2 bg-[#2D2A26] text-white rounded-full font-semibold text-xs inline-flex items-center gap-2 hover:bg-[#8C9B7A] transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" /> Print Document Now
                </button>
              </div>

            </div>
          ) : (
            /* STANDARD INTERACTIVE VIEW */
            <>
              {/* Event & Customer Quick Overview Banner */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Customer CRM Card Link */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#A39E93]">Client Info</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-serif font-bold text-[#2D2A26] text-base flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#8C9B7A]" />
                        {order.customerName}
                      </p>
                      {order.companyName && (
                        <p className="text-xs text-[#7D756D] font-medium">{order.companyName}</p>
                      )}
                    </div>
                    {order.customerId && (
                      <button
                        onClick={() => onOpenCustomerCRM(order.customerId)}
                        className="text-[11px] font-semibold text-[#C68B5C] hover:text-[#B07A4E] bg-[#FFF4EB] px-2.5 py-1 rounded-full border border-[#FFE0CC] flex items-center gap-1 cursor-pointer"
                      >
                        CRM Profile <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {customer && (
                    <div className="text-xs text-[#7D756D] pt-1 space-y-0.5">
                      <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#A39E93]" /> {customer.email}</p>
                      <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#A39E93]" /> {customer.phone}</p>
                    </div>
                  )}
                </div>

                {/* Event Schedule */}
                <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#E5E2D9] pt-3 md:pt-0 md:pl-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#A39E93]">Schedule & Guests</span>
                  <div className="space-y-1 text-xs text-[#2D2A26]">
                    <p className="flex items-center gap-1.5 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-[#8C9B7A]" />
                      {order.eventDate} @ {order.eventTime}
                    </p>
                    <p className="flex items-center gap-1.5 text-[#7D756D] font-medium">
                      <Users className="w-3.5 h-3.5 text-[#A39E93]" />
                      Guest Count: <strong className="text-[#2D2A26]">{order.guestCount} guests</strong>
                    </p>
                    <p className="flex items-center gap-1.5 text-[#7D756D]">
                      <MapPin className="w-3.5 h-3.5 text-[#A39E93] shrink-0" />
                      <span className="truncate">{order.deliveryAddress}</span>
                    </p>
                  </div>
                </div>

                {/* Status Controls */}
                <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-[#E5E2D9] pt-3 md:pt-0 md:pl-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#A39E93]">Current Order Status</span>
                  <div>
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="w-full bg-[#2D2A26] text-white font-serif font-bold text-xs p-2.5 rounded-xl border border-[#E5E2D9] focus:ring-1 focus:ring-[#8C9B7A]"
                    >
                      <option value="Pending">Status: Pending Review</option>
                      <option value="Confirmed">Status: Confirmed</option>
                      <option value="In Prep">Status: In Prep</option>
                      <option value="Out for Delivery">Status: Out for Delivery</option>
                      <option value="Completed">Status: Completed</option>
                      <option value="Cancelled">Status: Cancelled</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#7D756D] pt-1">
                    <span>Payment Status:</span>
                    <span className="font-bold text-[#2D2A26]">{order.paymentStatus}</span>
                  </div>
                </div>

              </div>

              {/* Catering Menu Line Items Table */}
              <div className="bg-white rounded-2xl border border-[#E5E2D9] overflow-hidden shadow-xs">
                <div className="bg-[#FDFCF9] px-5 py-3.5 border-b border-[#E5E2D9] flex items-center justify-between">
                  <h3 className="font-serif font-bold text-[#2D2A26] text-xs uppercase tracking-widest flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-[#8C9B7A]" />
                    Catering Menu Items ({order.items.length})
                  </h3>
                  <span className="text-xs font-semibold text-[#7D756D]">
                    Calculated Subtotal: ${order.subtotal.toFixed(2)}
                  </span>
                </div>

                <table className="w-full text-left text-xs text-[#2D2A26]">
                  <thead className="bg-[#F9F8F4] text-[#A39E93] uppercase text-[10px] font-bold border-b border-[#E5E2D9]">
                    <tr>
                      <th className="py-2.5 px-4">Menu Item</th>
                      <th className="py-2.5 px-4 text-center">Quantity</th>
                      <th className="py-2.5 px-4 text-right">Unit Price</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EDE6]">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F9F8F4]">
                        <td className="py-3 px-4 font-medium text-[#2D2A26]">
                          {item.menuItemName}
                          {item.specialInstructions && (
                            <p className="text-[11px] font-normal text-[#C68B5C] italic mt-0.5">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-[#2D2A26] bg-[#F9F8F4] px-2.5 py-0.5 rounded-full border border-[#E5E2D9]">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#7D756D]">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-serif font-bold text-[#2D2A26]">
                          ${item.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Subtotals & Delivery Fee */}
                <div className="p-4 bg-[#FDFCF9] border-t border-[#E5E2D9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="space-y-1.5 max-w-sm">
                    {order.dietaryNotes && (
                      <p className="text-[#A35D2A] bg-[#FFF4EB] p-2.5 rounded-xl border border-[#FFE0CC] font-medium">
                        <strong>Dietary Requirements:</strong> {order.dietaryNotes}
                      </p>
                    )}
                    {order.internalNotes && (
                      <p className="text-[#7D756D] italic">
                        <strong>Bakery Prep Notes:</strong> {order.internalNotes}
                      </p>
                    )}
                  </div>

                  <div className="w-full sm:w-56 space-y-1 text-[#7D756D] self-end">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8.5%):</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>${order.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-[#2D2A26] border-t border-[#E5E2D9] pt-1">
                      <span>Grand Total:</span>
                      <span className="text-[#C68B5C] font-serif">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier Procurement Requirements */}
              <div className="bg-white rounded-2xl border border-[#E5E2D9] p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-[#2D2A26] text-xs uppercase tracking-widest flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#8C9B7A]" />
                    Supplier Procurement Requirements ({order.requiredSuppliers.length} linked suppliers)
                  </h3>
                  <span className="text-[11px] text-[#A39E93] italic">
                    Click status pill to toggle procurement state
                  </span>
                </div>

                <div className="space-y-2">
                  {order.requiredSuppliers.length === 0 ? (
                    <p className="text-xs text-[#A39E93] italic">No external supplier items linked to this order.</p>
                  ) : (
                    order.requiredSuppliers.map((supplier, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl text-xs"
                      >
                        <div>
                          <p className="font-serif font-bold text-[#2D2A26]">{supplier.supplierName}</p>
                          <p className="text-[#7D756D]">{supplier.ingredientOrItem} (Needed by: <strong>{supplier.requiredByDate}</strong>)</p>
                        </div>

                        <button
                          onClick={() => onToggleSupplierProcurement(order.id, supplier.supplierId, supplier.procurementStatus)}
                          className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            supplier.procurementStatus === 'Procured'
                              ? 'bg-[#E8F0E5] text-[#4F6348] border border-[#D5E2D1]'
                              : supplier.procurementStatus === 'Ordered'
                              ? 'bg-[#EAF3FA] text-[#2D5A7B] border border-[#CDE1F0]'
                              : 'bg-[#FFF4EB] text-[#A35D2A] border border-[#FFE0CC] hover:bg-[#FFE0CC]'
                          }`}
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>{supplier.procurementStatus}</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-[#E5E2D9] p-4 px-6 flex items-center justify-between gap-3">
          <div>
            {onDeleteOrder && (
              confirmDelete ? (
                <button
                  onClick={() => {
                    onDeleteOrder(order.id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs transition-colors cursor-pointer animate-pulse"
                >
                  Confirm Delete Order
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-full font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Order
                </button>
              )
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#F9F8F4] border border-[#E5E2D9] hover:bg-[#E5E2D9] text-[#2D2A26] font-semibold text-xs rounded-full transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
