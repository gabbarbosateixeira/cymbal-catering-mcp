import React from 'react';
import { CateringOrder, Customer } from '../types';
import { DollarSign, Calendar, Users, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';

interface AnalyticsHeaderProps {
  orders: CateringOrder[];
  customers: Customer[];
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ orders, customers }) => {
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const upcomingCount = orders.filter(
    o => o.status === 'Confirmed' || o.status === 'Pending' || o.status === 'In Prep'
  ).length;

  const activeClients = customers.filter(c => c.status === 'Active Recurring' || c.status === 'Regular Client').length;

  const pendingProcurements = orders.reduce((count, order) => {
    return count + order.requiredSuppliers.filter(s => s.procurementStatus === 'Action Needed').length;
  }, 0);

  return (
    <div className="bg-[#F4F1E8] border-b border-[#E5E2D9] py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Revenue - Highlighted Sage Card */}
        <div className="bg-[#8C9B7A] text-white rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
              Catering Revenue
            </p>
            <p className="text-xl sm:text-2xl font-serif font-bold tracking-tight mt-0.5 text-white">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-white/90 font-medium mt-1">
              <TrendingUp className="w-3 h-3" /> +18.4% vs last mo.
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
            <DollarSign className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* Active Events */}
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A39E93]">
              Active Events
            </p>
            <p className="text-xl sm:text-2xl font-serif font-bold text-[#2D2A26] tracking-tight mt-0.5">
              {upcomingCount} <span className="text-xs font-sans font-normal text-[#7D756D]">orders</span>
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#C68B5C] font-semibold mt-1">
              <Calendar className="w-3 h-3" /> Next 14 days
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFF4EB] border border-[#FFE0CC] flex items-center justify-center text-[#C68B5C]">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* CRM Active Clients */}
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A39E93]">
              Active CRM Clients
            </p>
            <p className="text-xl sm:text-2xl font-serif font-bold text-[#2D2A26] tracking-tight mt-0.5">
              {activeClients} <span className="text-xs font-sans font-normal text-[#7D756D]">/ {customers.length} total</span>
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#4F6348] font-semibold mt-1">
              <Users className="w-3 h-3" /> High Retention
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E8F0E5] border border-[#D5E2D1] flex items-center justify-center text-[#4F6348]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Supplier Procurements */}
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A39E93]">
              Supplier Action
            </p>
            <p className={`text-xl sm:text-2xl font-serif font-bold tracking-tight mt-0.5 ${
              pendingProcurements > 0 ? 'text-[#C68B5C]' : 'text-[#4F6348]'
            }`}>
              {pendingProcurements} <span className="text-xs font-sans font-normal text-[#7D756D]">items needed</span>
            </p>
            {pendingProcurements > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#A35D2A] font-medium mt-1">
                <AlertTriangle className="w-3 h-3" /> Order from suppliers
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#4F6348] font-medium mt-1">
                <CheckCircle2 className="w-3 h-3" /> All ingredients ready
              </span>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            pendingProcurements > 0 
              ? 'bg-[#FFF4EB] border border-[#FFE0CC] text-[#C68B5C]' 
              : 'bg-[#E8F0E5] border border-[#D5E2D1] text-[#4F6348]'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>
    </div>
  );
};
