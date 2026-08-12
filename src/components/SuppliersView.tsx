import React, { useState } from 'react';
import { Supplier, CateringOrder } from '../types';
import { 
  Truck, 
  PackageCheck, 
  Clock, 
  Mail, 
  Phone, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Star, 
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
  orders: CateringOrder[];
  onToggleProcurement: (orderId: string, supplierId: string, currentStatus: 'Procured' | 'Ordered' | 'Action Needed') => void;
  onSelectOrder: (order: CateringOrder) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  orders,
  onToggleProcurement,
  onSelectOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'procurement' | 'directory'>('procurement');

  // Aggregated required supplier items across all active catering orders
  const activeOrders = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Completed');

  // Group procurements by supplier
  const supplierProcurements = suppliers.map(supplier => {
    const itemsNeeded: { order: CateringOrder; item: any }[] = [];

    activeOrders.forEach(order => {
      order.requiredSuppliers.forEach(supReq => {
        if (supReq.supplierId === supplier.id) {
          itemsNeeded.push({ order, item: supReq });
        }
      });
    });

    const pendingCount = itemsNeeded.filter(i => i.item.procurementStatus === 'Action Needed').length;

    return {
      supplier,
      itemsNeeded,
      pendingCount,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Controls */}
      <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-xs p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2D2A26] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#8C9B7A]" />
            Suppliers & Ingredient Procurement
          </h2>
          <p className="text-xs text-[#7D756D] mt-0.5">
            Track key bakery ingredient vendors and aggregated order procurement needs for Cymbal Bakery
          </p>
        </div>

        <div className="flex items-center bg-[#F9F8F4] p-1 rounded-full border border-[#E5E2D9] text-xs">
          <button
            onClick={() => setActiveTab('procurement')}
            className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === 'procurement' ? 'bg-[#8C9B7A] text-white shadow-xs' : 'text-[#7D756D] hover:text-[#2D2A26]'
            }`}
          >
            Order Procurements
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === 'directory' ? 'bg-[#8C9B7A] text-white shadow-xs' : 'text-[#7D756D] hover:text-[#2D2A26]'
            }`}
          >
            Supplier Directory ({suppliers.length})
          </button>
        </div>
      </div>

      {activeTab === 'procurement' ? (
        /* PROCUREMENTS VIEW */
        <div className="space-y-6">
          
          <div className="bg-[#FFF4EB] rounded-2xl border border-[#FFE0CC] p-4 text-xs text-[#A35D2A] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#C68B5C] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm font-serif">Aggregated Order Procurement Breakdown</p>
              <p className="mt-0.5 text-[#A35D2A]/90">
                The list below shows required flour, dairy, fresh fruit, and packaging items aggregated across all active upcoming catering events. Click any procurement status pill to update your bakery inventory log.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {supplierProcurements.map(({ supplier, itemsNeeded, pendingCount }) => (
              <div 
                key={supplier.id}
                className="bg-white rounded-2xl border border-[#E5E2D9] shadow-xs overflow-hidden"
              >
                {/* Supplier Header */}
                <div className="p-4 bg-[#FDFCF9] border-b border-[#F0EDE6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#8C9B7A] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-[#2D2A26] text-base">{supplier.name}</h3>
                        <span className="text-[10px] bg-[#E5E2D9]/60 text-[#7D756D] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {supplier.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#7D756D] mt-0.5">
                        Contact: {supplier.contactPerson} • {supplier.phone} • {supplier.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    {pendingCount > 0 ? (
                      <span className="bg-[#FFF4EB] text-[#A35D2A] border border-[#FFE0CC] font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#C68B5C]" /> {pendingCount} Pending Action
                      </span>
                    ) : (
                      <span className="bg-[#E8F0E5] text-[#4F6348] border border-[#D5E2D1] font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6348]" /> All Items Procured
                      </span>
                    )}
                  </div>
                </div>

                {/* Procurements List */}
                <div className="p-4">
                  {itemsNeeded.length === 0 ? (
                    <p className="text-xs text-[#A39E93] italic">No active catering orders require items from this supplier currently.</p>
                  ) : (
                    <div className="space-y-2">
                      {itemsNeeded.map(({ order, item }, idx) => (
                        <div 
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#2D2A26]">{order.orderNumber}</span>
                              <span className="font-bold text-[#2D2A26]">{order.eventName}</span>
                              <button 
                                onClick={() => onSelectOrder(order)}
                                className="text-[#C68B5C] hover:text-[#B07A4E] flex items-center gap-0.5 text-[11px] font-semibold cursor-pointer"
                              >
                                View Order <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-[#7D756D] mt-0.5">
                              Required Ingredient/Material: <strong className="text-[#2D2A26]">{item.ingredientOrItem}</strong> (Needed by: <strong>{item.requiredByDate}</strong>)
                            </p>
                          </div>

                          <button
                            onClick={() => onToggleProcurement(order.id, supplier.id, item.procurementStatus)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                              item.procurementStatus === 'Procured'
                                ? 'bg-[#E8F0E5] text-[#4F6348] border border-[#D5E2D1]'
                                : item.procurementStatus === 'Ordered'
                                ? 'bg-[#EAF3FA] text-[#2D5A7B] border border-[#CDE1F0]'
                                : 'bg-[#C68B5C] text-white hover:bg-[#B07A4E] shadow-xs'
                            }`}
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Status: {item.procurementStatus}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      ) : (
        /* SUPPLIER DIRECTORY */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((sup) => (
            <div key={sup.id} className="bg-white rounded-2xl border border-[#E5E2D9] shadow-xs p-5 space-y-4 hover:border-[#8C9B7A] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A39E93] tracking-widest">{sup.category}</span>
                  <h3 className="font-serif font-bold text-[#2D2A26] text-lg">{sup.name}</h3>
                </div>
                <div className="flex items-center gap-1 bg-[#FFF4EB] border border-[#FFE0CC] px-2.5 py-0.5 rounded-full text-xs font-bold text-[#A35D2A]">
                  <Star className="w-3.5 h-3.5 text-[#C68B5C] fill-[#C68B5C]" />
                  <span>{sup.rating}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#7D756D]">
                <p className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#A39E93]" />
                  <span className="font-medium text-[#2D2A26]">{sup.contactPerson}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#A39E93]" />
                  <span>{sup.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#A39E93]" />
                  <span>{sup.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#A39E93]" />
                  <span>Standard Lead Time: <strong className="text-[#2D2A26]">{sup.leadTimeDays} days</strong></span>
                </p>
              </div>

              {sup.notes && (
                <p className="text-xs text-[#7D756D] italic bg-[#F9F8F4] p-3 rounded-xl border border-[#E5E2D9]">
                  "{sup.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
