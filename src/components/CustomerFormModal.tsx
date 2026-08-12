import React, { useState } from 'react';
import { Customer, ClientSegment, RelationshipStatus } from '../types';
import { X, Users, User, Building, Mail, Phone, MapPin, Tag } from 'lucide-react';

interface CustomerFormModalProps {
  initialCustomer?: Customer | null;
  onSave: (customer: Customer) => void;
  onClose: () => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  initialCustomer,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState<string>(initialCustomer?.name || '');
  const [company, setCompany] = useState<string>(initialCustomer?.company || '');
  const [email, setEmail] = useState<string>(initialCustomer?.email || '');
  const [phone, setPhone] = useState<string>(initialCustomer?.phone || '');
  const [segment, setSegment] = useState<ClientSegment>(initialCustomer?.segment || 'Corporate Tech');
  const [status, setStatus] = useState<RelationshipStatus>(initialCustomer?.status || 'Active Recurring');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(initialCustomer?.deliveryAddress || '');
  const [dietaryInput, setDietaryInput] = useState<string>(
    initialCustomer?.dietaryPreferences ? initialCustomer.dietaryPreferences.join(', ') : ''
  );
  const [notes, setNotes] = useState<string>(initialCustomer?.notes || '');

  const avatarColors = [
    'bg-amber-600', 'bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-rose-600', 'bg-indigo-600'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Please enter Client Name and Email Address.');
      return;
    }

    const dietaryPreferences = dietaryInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const savedCustomer: Customer = {
      id: initialCustomer?.id || `cust-${Date.now()}`,
      name: name.trim(),
      company: company.trim() || undefined,
      email: email.trim(),
      phone: phone.trim(),
      segment,
      status,
      deliveryAddress: deliveryAddress.trim(),
      dietaryPreferences,
      notes: notes.trim(),
      createdDate: initialCustomer?.createdDate || new Date().toISOString().split('T')[0],
      avatarColor: initialCustomer?.avatarColor || avatarColors[Math.floor(Math.random() * avatarColors.length)],
      activityLog: initialCustomer?.activityLog || [
        {
          id: `act-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          author: 'Cymbal Sales Desk',
          text: 'Created new client profile in Cymbal CRM.',
          type: 'Note'
        }
      ]
    };

    onSave(savedCustomer);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2A26]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#2D2A26] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#E5E2D9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8C9B7A] text-white font-bold flex items-center justify-center text-sm shadow-md">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white tracking-tight">
                {initialCustomer ? 'Edit Client Profile' : 'Add New CRM Client'}
              </h2>
              <p className="text-xs text-[#A39E93]">
                Register a catering client for Cymbal Bakery
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-[#F9F8F4]">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                Client Contact Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Samantha Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Cloud Systems"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-white border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="samantha@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                placeholder="(415) 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1">Client Segment</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as ClientSegment)}
                className="w-full bg-white border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A]"
              >
                <option value="Corporate Tech">Corporate Tech</option>
                <option value="Weddings & Celebrations">Weddings & Celebrations</option>
                <option value="Small Business">Small Business</option>
                <option value="Educational / Non-Profit">Educational / Non-Profit</option>
                <option value="VIP Private">VIP Private</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1">Relationship Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RelationshipStatus)}
                className="w-full bg-white border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A]"
              >
                <option value="Active Recurring">Active Recurring</option>
                <option value="Regular Client">Regular Client</option>
                <option value="New Lead">New Lead</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
              Primary Delivery Street Address
            </label>
            <input
              type="text"
              placeholder="e.g. 500 Howard St, Floor 12, San Francisco, CA"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full bg-white border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
              Dietary Preferences & Requirements (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Requires Gluten-Free labels, Nut-Free options"
              value={dietaryInput}
              onChange={(e) => setDietaryInput(e.target.value)}
              className="w-full bg-white border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
              General Client Notes
            </label>
            <textarea
              rows={2}
              placeholder="Special instructions, favorite items, delivery contact times..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-[#E5E2D9] text-[#2D2A26] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#8C9B7A]"
            />
          </div>

          {/* Actions */}
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
              {initialCustomer ? 'Save Profile' : 'Add Client to CRM'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
