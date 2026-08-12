import React, { useState, useEffect } from 'react';
import { 
  Customer, 
  CateringOrder, 
  MenuItem, 
  Supplier, 
  OrderStatus, 
  ActivityNote 
} from './types';


// Component Imports
import { Header } from './components/Header';
import { OrdersView } from './components/OrdersView';
import { OrderDetailModal } from './components/OrderDetailModal';
import { OrderFormModal } from './components/OrderFormModal';
import { CustomerCRMView } from './components/CustomerCRMView';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { CustomerFormModal } from './components/CustomerFormModal';
import { MenuCatalogView } from './components/MenuCatalogView';
import { CalendarView } from './components/CalendarView';

export default function App() {
  // DB State
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Fetch Data from DB on Mount
  useEffect(() => {
    fetch('/api/customers')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch customers');
        return res.json();
      })
      .then(setCustomers)
      .catch((err) => console.error(err));

    fetch('/api/menu')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch menu');
        return res.json();
      })
      .then(setMenuItems)
      .catch((err) => console.error(err));

    fetch('/api/suppliers')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch suppliers');
        return res.json();
      })
      .then(setSuppliers)
      .catch((err) => console.error(err));

    fetch('/api/orders')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
      })
      .then(setOrders)
      .catch((err) => console.error(err));
  }, []);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'orders' | 'crm' | 'menu' | 'calendar'>('orders');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<CateringOrder | null>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<CateringOrder | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [preselectedCustomerId, setPreselectedCustomerId] = useState<string | undefined>(undefined);

  // Handlers for Orders
  const handleSaveOrder = (savedOrder: CateringOrder) => {
    const exists = orders.some((o) => o.id === savedOrder.id);
    const method = exists ? 'PUT' : 'POST';
    const url = exists ? `/api/orders/${savedOrder.id}` : '/api/orders';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedOrder),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save order');
        return res.json();
      })
      .then(() => {
        setOrders((prev) => {
          if (exists) {
            return prev.map((o) => (o.id === savedOrder.id ? savedOrder : o));
          } else {
            return [savedOrder, ...prev];
          }
        });
        setIsOrderFormOpen(false);
        setEditingOrder(null);
        setPreselectedCustomerId(undefined);
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteOrder = (orderId: string) => {
    fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete order');
        return res.json();
      })
      .then(() => {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const updatedOrder = { ...order, status: newStatus };

    fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedOrder),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update order status');
        return res.json();
      })
      .then(() => {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleToggleSupplierProcurement = (
    orderId: string,
    supplierId: string,
    currentStatus: 'Procured' | 'Ordered' | 'Action Needed'
  ) => {
    const nextStatus =
      currentStatus === 'Procured'
        ? 'Ordered'
        : currentStatus === 'Ordered'
        ? 'Action Needed'
        : 'Procured';

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const updatedSuppliers = order.requiredSuppliers.map((s) => {
      if (s.supplierId === supplierId) {
        return { ...s, procurementStatus: nextStatus as any };
      }
      return s;
    });
    const updatedOrder = { ...order, requiredSuppliers: updatedSuppliers };

    fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedOrder),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update supplier procurement');
        return res.json();
      })
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.map((ord) => (ord.id === orderId ? updatedOrder : ord))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
      })
      .catch((err) => console.error(err));
  };

  // Handlers for Customers CRM
  const handleSaveCustomer = (savedCustomer: Customer) => {
    const exists = customers.some((c) => c.id === savedCustomer.id);
    const method = exists ? 'PUT' : 'POST';
    const url = exists ? `/api/customers/${savedCustomer.id}` : '/api/customers';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedCustomer),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save customer');
        return res.json();
      })
      .then(() => {
        setCustomers((prev) => {
          if (exists) {
            return prev.map((c) => (c.id === savedCustomer.id ? savedCustomer : c));
          } else {
            return [savedCustomer, ...prev];
          }
        });
        setIsCustomerFormOpen(false);
        setEditingCustomer(null);
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteCustomer = (customerId: string) => {
    fetch(`/api/customers/${customerId}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete customer');
        return res.json();
      })
      .then(() => {
        setCustomers((prev) => prev.filter((c) => c.id !== customerId));
        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer(null);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleAddActivityNote = (customerId: string, note: ActivityNote) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const updatedLogs = [note, ...(customer.activityLog || [])];
    const updatedCustomer = { ...customer, activityLog: updatedLogs };

    fetch(`/api/customers/${customerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCustomer),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add activity note');
        return res.json();
      })
      .then(() => {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customerId ? updatedCustomer : c))
        );
        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer(updatedCustomer);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleBookOrderForCustomer = (customerId: string) => {
    setPreselectedCustomerId(customerId);
    setEditingOrder(null);
    setIsOrderFormOpen(true);
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add menu item');
        return res.json();
      })
      .then(() => {
        setMenuItems((prev) => [newItem, ...prev]);
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteMenuItem = (menuItemId: string) => {
    fetch(`/api/menu/${menuItemId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete menu item');
        return res.json();
      })
      .then(() => {
        setMenuItems((prev) => prev.filter((item) => item.id !== menuItemId));
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans antialiased flex flex-col">
      
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewOrderModal={() => {
          setEditingOrder(null);
          setPreselectedCustomerId(undefined);
          setIsOrderFormOpen(true);
        }}
        onOpenNewCustomerModal={() => {
          setEditingCustomer(null);
          setIsCustomerFormOpen(true);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        orderCount={orders.length}
        customerCount={customers.length}
      />

      {/* Main Body Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Catering Orders Management */}
        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
            onEditOrder={(ord) => {
              setEditingOrder(ord);
              setIsOrderFormOpen(true);
            }}
            onDeleteOrder={handleDeleteOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenNewOrderModal={() => {
              setEditingOrder(null);
              setPreselectedCustomerId(undefined);
              setIsOrderFormOpen(true);
            }}
            searchQuery={searchQuery}
          />
        )}

        {/* Tab 2: Customer CRM */}
        {activeTab === 'crm' && (
          <CustomerCRMView
            customers={customers}
            orders={orders}
            onSelectCustomer={(cust) => setSelectedCustomer(cust)}
            onEditCustomer={(cust) => {
              setEditingCustomer(cust);
              setIsCustomerFormOpen(true);
            }}
            onDeleteCustomer={handleDeleteCustomer}
            onBookOrderForCustomer={handleBookOrderForCustomer}
            onOpenNewCustomerModal={() => {
              setEditingCustomer(null);
              setIsCustomerFormOpen(true);
            }}
            searchQuery={searchQuery}
          />
        )}

        {/* Tab 3: Catering Bakery Menu Catalog */}
        {activeTab === 'menu' && (
          <MenuCatalogView
            menuItems={menuItems}
            suppliers={suppliers}
            onAddMenuItem={handleAddMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
          />
        )}

        {/* Tab 5: Event Calendar Schedule */}
        {activeTab === 'calendar' && (
          <CalendarView
            orders={orders}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
          />
        )}

      </main>

      {/* Modals */}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          customer={customers.find((c) => c.id === selectedOrder.customerId)}
          onClose={() => setSelectedOrder(null)}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onToggleSupplierProcurement={handleToggleSupplierProcurement}
          onOpenCustomerCRM={(cust: string) => {
            const found = customers.find((c) => c.id === cust);
            if (found) {
              setSelectedOrder(null);
              setSelectedCustomer(found);
              setActiveTab('crm');
            }
          }}
          onDeleteOrder={handleDeleteOrder}
        />
      )}

      {/* Order Create/Edit Modal */}
      {isOrderFormOpen && (
        <OrderFormModal
          initialOrder={editingOrder}
          customers={customers}
          menuItems={menuItems}
          suppliers={suppliers}
          preselectedCustomerId={preselectedCustomerId}
          onSave={handleSaveOrder}
          onClose={() => {
            setIsOrderFormOpen(false);
            setEditingOrder(null);
            setPreselectedCustomerId(undefined);
          }}
        />
      )}

      {/* Customer Detail CRM Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          orders={orders}
          onClose={() => setSelectedCustomer(null)}
          onBookOrder={handleBookOrderForCustomer}
          onSelectOrder={(ord) => setSelectedOrder(ord)}
          onAddActivityNote={handleAddActivityNote}
          onDeleteCustomer={handleDeleteCustomer}
        />
      )}

      {/* Customer Create/Edit Form Modal */}
      {isCustomerFormOpen && (
        <CustomerFormModal
          initialCustomer={editingCustomer}
          onSave={handleSaveCustomer}
          onClose={() => {
            setIsCustomerFormOpen(false);
            setEditingCustomer(null);
          }}
        />
      )}

    </div>
  );
}
