import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { dbAll, dbGet, dbRun, initDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Initialize Database on Startup
initDb().then(() => {
  console.log('[Server] Database initialized successfully.');
}).catch((err) => {
  console.error('[Server Fatal] Database initialization failed:', err);
  process.exit(1);
});

// --- API ROUTES ---

// --- CUSTOMERS (CRM) ---

/**
 * GET /api/customers
 * Retrieves all customers with parsed JSON fields.
 */
app.get('/api/customers', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM customers');
    const customers = rows.map((row) => ({
      ...row,
      dietaryPreferences: row.dietaryPreferences || [],
      activityLog: row.activityLog || [],
    }));
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/customers
 * Creates a new customer profile.
 */
app.post('/api/customers', async (req, res) => {
  const customer = req.body;
  const sql = `INSERT INTO customers (
    id, name, company, email, phone, segment, status, deliveryAddress, dietaryPreferences, notes, createdDate, avatarColor, activityLog
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  try {
    await dbRun(sql, [
      customer.id,
      customer.name,
      customer.company || null,
      customer.email,
      customer.phone || null,
      customer.segment || null,
      customer.status || null,
      customer.deliveryAddress || null,
      JSON.stringify(customer.dietaryPreferences || []),
      customer.notes || null,
      customer.createdDate,
      customer.avatarColor || null,
      JSON.stringify(customer.activityLog || [])
    ]);
    res.status(201).json({ id: customer.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/customers/:id
 * Updates an existing customer profile.
 */
app.put('/api/customers/:id', async (req, res) => {
  const customer = req.body;
  const id = req.params.id;
  const sql = `UPDATE customers SET
    name = ?, company = ?, email = ?, phone = ?, segment = ?, status = ?, deliveryAddress = ?, dietaryPreferences = ?, notes = ?, avatarColor = ?, activityLog = ?
    WHERE id = ?`;

  try {
    const result = await dbRun(sql, [
      customer.name,
      customer.company || null,
      customer.email,
      customer.phone || null,
      customer.segment || null,
      customer.status || null,
      customer.deliveryAddress || null,
      JSON.stringify(customer.dietaryPreferences || []),
      customer.notes || null,
      customer.avatarColor || null,
      JSON.stringify(customer.activityLog || []),
      id
    ]);
    res.json({ updated: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/customers/:id
 * Deletes a customer profile.
 */
app.delete('/api/customers/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await dbRun('DELETE FROM customers WHERE id = ?', [id]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MENU CATALOG ---

/**
 * GET /api/menu
 * Retrieves all menu catalog items with parsed JSON tags.
 */
app.get('/api/menu', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM menu_items');
    const menu = rows.map((row) => ({
      ...row,
      dietaryTags: row.dietaryTags || [],
      supplierIds: row.supplierIds || [],
    }));
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/menu
 * Adds a new item to the menu catalog.
 */
app.post('/api/menu', async (req, res) => {
  const item = req.body;
  const sql = `INSERT INTO menu_items (
    id, name, category, description, price, servings, image, dietaryTags, supplierIds, leadTimeHours
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  try {
    await dbRun(sql, [
      item.id,
      item.name,
      item.category,
      item.description || null,
      item.price,
      item.servings,
      item.image || null,
      JSON.stringify(item.dietaryTags || []),
      JSON.stringify(item.supplierIds || []),
      item.leadTimeHours
    ]);
    res.status(201).json({ id: item.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/menu/:id
 * Deletes a menu item.
 */
app.delete('/api/menu/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await dbRun('DELETE FROM menu_items WHERE id = ?', [id]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUPPLIERS ---

/**
 * GET /api/suppliers
 * Retrieves all suppliers.
 */
app.get('/api/suppliers', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM suppliers');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDERS ---

/**
 * GET /api/orders
 * Retrieves all catering orders.
 */
app.get('/api/orders', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM orders');
    const orders = rows.map((row) => ({
      ...row,
      items: row.items || [],
      requiredSuppliers: row.requiredSuppliers || [],
    }));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/orders
 * Creates a new catering order.
 */
app.post('/api/orders', async (req, res) => {
  const order = req.body;
  const sql = `INSERT INTO orders (
    id, orderNumber, customerId, customerName, companyName, eventName, eventDate, eventTime, guestCount, deliveryAddress, status, paymentStatus, items, subtotal, tax, deliveryFee, totalAmount, dietaryNotes, internalNotes, requiredSuppliers, createdDate
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  try {
    await dbRun(sql, [
      order.id,
      order.orderNumber,
      order.customerId,
      order.customerName,
      order.companyName || null,
      order.eventName,
      order.eventDate,
      order.eventTime,
      order.guestCount,
      order.deliveryAddress,
      order.status,
      order.paymentStatus,
      JSON.stringify(order.items || []),
      order.subtotal,
      order.tax,
      order.deliveryFee,
      order.totalAmount,
      order.dietaryNotes || null,
      order.internalNotes || null,
      JSON.stringify(order.requiredSuppliers || []),
      order.createdDate
    ]);
    res.status(201).json({ id: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/orders/:id
 * Updates an existing catering order.
 */
app.put('/api/orders/:id', async (req, res) => {
  const order = req.body;
  const id = req.params.id;
  const sql = `UPDATE orders SET
    status = ?, paymentStatus = ?, items = ?, subtotal = ?, tax = ?, deliveryFee = ?, totalAmount = ?, dietaryNotes = ?, internalNotes = ?, requiredSuppliers = ?
    WHERE id = ?`;

  try {
    const result = await dbRun(sql, [
      order.status,
      order.paymentStatus,
      JSON.stringify(order.items || []),
      order.subtotal,
      order.tax,
      order.deliveryFee,
      order.totalAmount,
      order.dietaryNotes || null,
      order.internalNotes || null,
      JSON.stringify(order.requiredSuppliers || []),
      id
    ]);
    res.json({ updated: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/orders/:id
 * Deletes a catering order.
 */
app.delete('/api/orders/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await dbRun('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static assets in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Express server running on port ${PORT}`);
});
