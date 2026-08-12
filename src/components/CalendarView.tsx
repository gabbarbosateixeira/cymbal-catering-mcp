import React, { useState } from 'react';
import { CateringOrder } from '../types';
import { Calendar, ChefHat, Clock, Users, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface CalendarViewProps {
  orders: CateringOrder[];
  onSelectOrder: (order: CateringOrder) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ orders, onSelectOrder }) => {
  // Current month state - set default to August 2026 based on mock data
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 0-indexed, 7 = August

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate calendar days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  // Group active orders by date string YYYY-MM-DD
  const ordersByDate = orders.reduce((acc, order) => {
    if (order.status !== 'Cancelled') {
      if (!acc[order.eventDate]) {
        acc[order.eventDate] = [];
      }
      acc[order.eventDate].push(order);
    }
    return acc;
  }, {} as Record<string, CateringOrder[]>);

  return (
    <div className="space-y-6">
      
      {/* Calendar Header Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-xs p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8C9B7A] text-white font-bold flex items-center justify-center shadow-xs">
            <Calendar className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#2D2A26]">
              {monthNames[currentMonth]} {currentYear} Catering Events
            </h2>
            <p className="text-xs text-[#7D756D]">
              Cymbal Bakery Delivery Schedule & Event Timeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full bg-[#F9F8F4] hover:bg-[#E5E2D9] text-[#2D2A26] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-serif font-bold text-[#2D2A26] min-w-28 text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full bg-[#F9F8F4] hover:bg-[#E5E2D9] text-[#2D2A26] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-xs overflow-hidden">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-[#FDFCF9] border-b border-[#E5E2D9] text-center text-[10px] font-bold text-[#A39E93] uppercase tracking-widest py-3">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Cells Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#F0EDE6] text-xs">
          
          {/* Empty padding cells */}
          {paddingDays.map((_, idx) => (
            <div key={`pad-${idx}`} className="bg-[#F9F8F4]/50 min-h-28 p-2" />
          ))}

          {/* Month Day Cells */}
          {daysArray.map((day) => {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayOrders = ordersByDate[dateStr] || [];

            return (
              <div 
                key={day} 
                className={`min-h-32 p-2 transition-colors flex flex-col justify-between ${
                  dayOrders.length > 0 ? 'bg-[#FFF4EB]/30' : 'bg-white hover:bg-[#F9F8F4]'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                    dayOrders.length > 0 ? 'bg-[#C68B5C] text-white font-serif font-bold' : 'text-[#7D756D]'
                  }`}>
                    {day}
                  </span>
                  {dayOrders.length > 0 && (
                    <span className="text-[10px] font-semibold text-[#7D756D]">
                      {dayOrders.length} {dayOrders.length === 1 ? 'event' : 'events'}
                    </span>
                  )}
                </div>

                {/* Day Orders Badges */}
                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-28 no-scrollbar">
                  {dayOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => onSelectOrder(ord)}
                      className="p-1.5 bg-white rounded-xl border border-[#E5E2D9] hover:border-[#8C9B7A] shadow-2xs cursor-pointer transition-all text-[11px]"
                    >
                      <p className="font-serif font-bold text-[#2D2A26] truncate">{ord.eventName}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#7D756D] mt-0.5">
                        <span>{ord.eventTime}</span>
                        <span className="font-serif font-bold text-[#C68B5C]">${ord.totalAmount.toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
};
