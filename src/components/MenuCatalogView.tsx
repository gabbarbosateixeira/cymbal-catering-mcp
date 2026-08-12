import React, { useState } from 'react';
import { MenuItem, Supplier } from '../types';
import { 
  Plus, 
  Users, 
  Clock, 
  X,
  Trash2
} from 'lucide-react';

interface MenuCatalogViewProps {
  menuItems: MenuItem[];
  suppliers: Supplier[];
  onAddMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
}

export const MenuCatalogView: React.FC<MenuCatalogViewProps> = ({
  menuItems,
  suppliers,
  onAddMenuItem,
  onDeleteMenuItem,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State for new item
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Birthday');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(400.00);
  const [servings, setServings] = useState<string>('10-20 guests');
  const [dietaryTagsInput, setDietaryTagsInput] = useState<string>('');
  const [leadTimeHours, setLeadTimeHours] = useState<number>(24);
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80'
  );
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>(['sup-1', 'sup-2']);

  const handleSubmitNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dietaryTags = dietaryTagsInput.split(',').map(s => s.trim()).filter(Boolean);

    const newItem: MenuItem = {
      id: `menu-${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim(),
      price,
      servings,
      image: imageUrl,
      dietaryTags,
      supplierIds: selectedSupplierIds,
      leadTimeHours
    };

    onAddMenuItem(newItem);
    setIsModalOpen(false);
    setName('');
    setDescription('');
    setPrice(400);
    setCategory('Birthday');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#2D2A26] text-white rounded-2xl p-6 sm:p-8 border border-[#3E3A35] shadow-md flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Catering Menu Catalog
          </h1>
          <p className="text-sm text-[#A39E93] leading-relaxed">
            View, add, and manage your catering menu packages below.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#C68B5C] hover:bg-[#B07A4E] text-white font-semibold text-xs rounded-full inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Simple List (Grid) of Menu Items */}
      <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-xs p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2D2A26]">
            <thead className="bg-[#F9F8F4] border-b border-[#E5E2D9] text-[#7D756D] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Menu Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Servings</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE6]">
              {menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#FDFCF9]">
                  <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#2D2A26]">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-[#E5E2D9]"
                        />
                      )}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#4A453E]">{item.category}</td>
                  <td className="py-3.5 px-4 text-[#7D756D] max-w-xs truncate" title={item.description}>
                    {item.description}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#8C9B7A]">
                    {item.servings}
                  </td>
                  <td className="py-3.5 px-4 text-right font-serif font-bold text-sm text-[#C68B5C]">
                    ${item.price.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
                          onDeleteMenuItem(item.id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800 rounded-full transition-colors inline-flex items-center justify-center cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {menuItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500 font-medium">
                    No menu items in catalog. Click "Add Menu Item" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Menu Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2A26]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-[#2D2A26] text-white p-4 px-6 flex items-center justify-between border-b border-[#E5E2D9]">
              <h3 className="font-serif font-bold text-lg text-white">Add New Menu Item</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A39E93] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D2A26] mb-1">Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Birthday, Wedding..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#8C9B7A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2D2A26] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#8C9B7A]"
                  >
                    <option value="Birthday">Birthday</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Executive">Executive</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D2A26] mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl p-2.5 text-xs font-serif font-bold text-[#2D2A26]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2A26] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the menu details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#8C9B7A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2D2A26] mb-1">Serving Recommendation</label>
                  <input
                    type="text"
                    placeholder="e.g. 10-20 guests"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D2A26] mb-1">Lead Time (Hours)</label>
                  <input
                    type="number"
                    value={leadTimeHours}
                    onChange={(e) => setLeadTimeHours(parseInt(e.target.value) || 24)}
                    className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2A26] mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDE6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#F9F8F4] text-[#7D756D] border border-[#E5E2D9] hover:bg-[#E5E2D9] text-xs font-semibold rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C68B5C] hover:bg-[#B07A4E] text-white text-xs font-semibold rounded-full shadow-xs cursor-pointer"
                >
                  Save Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
