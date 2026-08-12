export type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'In Prep' 
  | 'Out for Delivery' 
  | 'Completed' 
  | 'Cancelled';

export type PaymentStatus = 'Paid' | 'Deposit Paid' | 'Invoice Pending' | 'Overdue';

export type ClientSegment = 
  | 'Corporate Tech' 
  | 'Weddings & Celebrations' 
  | 'Small Business' 
  | 'Educational / Non-Profit' 
  | 'VIP Private';

export type RelationshipStatus = 'Active Recurring' | 'Regular Client' | 'New Lead' | 'Inactive';

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  segment: ClientSegment;
  status: RelationshipStatus;
  deliveryAddress: string;
  dietaryPreferences?: string[];
  notes?: string;
  createdDate: string;
  avatarColor?: string;
  activityLog: ActivityNote[];
}

export interface ActivityNote {
  id: string;
  date: string;
  author: string;
  text: string;
  type: 'Note' | 'Call' | 'Meeting' | 'Email';
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'The Masterpiece Tiers' | 'The Matrimonial Opus' | 'The Jubilee Reserve' | 'The Executive Prestige' | string;
  description: string;
  price: number;
  servings: string;
  image: string;
  dietaryTags: string[]; // e.g. ['Vegetarian', 'Gluten-Free', 'Nut-Free', 'Vegan']
  supplierIds: string[]; // IDs of suppliers who supply ingredients for this item
  leadTimeHours: number;
}

export interface Supplier {
  id: string;
  name: string;
  category: 'Flour & Grains' | 'Dairy & Eggs' | 'Fresh Produce & Fruits' | 'Packaging & Boxes' | 'Coffee & Teas' | 'Specialty Chocolate & Nuts';
  contactPerson: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  rating: number; // 1-5
  notes?: string;
}

export interface OrderLineItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface OrderSupplierItem {
  supplierId: string;
  supplierName: string;
  ingredientOrItem: string;
  procurementStatus: 'Procured' | 'Ordered' | 'Action Needed';
  requiredByDate: string;
}

export interface CateringOrder {
  id: string;
  orderNumber: string; // e.g., "CYM-2026-101"
  customerId: string;
  customerName: string;
  companyName?: string;
  eventName: string;
  eventDate: string; // YYYY-MM-DD
  eventTime: string; // e.g. "08:30 AM"
  guestCount: number;
  deliveryAddress: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderLineItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  dietaryNotes?: string;
  internalNotes?: string;
  requiredSuppliers: OrderSupplierItem[];
  createdDate: string;
}
