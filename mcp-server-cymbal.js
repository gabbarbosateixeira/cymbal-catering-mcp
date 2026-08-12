import express from 'express';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { dbAll, dbGet, dbRun } from './db.js';
import { randomUUID } from 'node:crypto';

const TAX_RATE = parseFloat(process.env.TAX_RATE || '0.085');
const DEFAULT_DELIVERY_FEE = parseFloat(process.env.DEFAULT_DELIVERY_FEE || '35.00');
const PORT = process.env.PORT || 3002;

// Initialize Express App
const app = express();
app.use(express.json());

// Import schemas required for MCP
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Factory function to create a new MCP Server instance with registered tools.
 * Creating a new instance per session prevents "Already connected to a transport" errors
 * in stateless container environments like Cloud Run.
 */
function createMcpServer() {
  const server = new Server(
    {
      name: "cymbal-catering-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Define Tools Schema
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "query_clients",
          description: "Query clients/customers from the CRM. Supports searching and segment filtering.",
          inputSchema: {
            type: "object",
            properties: {
              segment: {
                type: "string",
                enum: ['Corporate Tech', 'Weddings & Celebrations', 'Small Business', 'Educational / Non-Profit', 'VIP Private'],
                description: "Filter by client segment"
              },
              search: {
                type: "string",
                description: "Search term matching name, company, or email"
              }
            }
          }
        },
        {
          name: "add_client",
          description: "Add a new client to the CRM.",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Full name of the client contact" },
              email: { type: "string", description: "Email address" },
              phone: { type: "string", description: "Phone number" },
              company: { type: "string", description: "Company or organization name" },
              segment: {
                type: "string",
                enum: ['Corporate Tech', 'Weddings & Celebrations', 'Small Business', 'Educational / Non-Profit', 'VIP Private'],
                default: "Corporate Tech"
              },
              status: {
                type: "string",
                enum: ['Active Recurring', 'Regular Client', 'New Lead', 'Inactive'],
                default: "New Lead"
              },
              deliveryAddress: { type: "string", description: "Primary delivery street address" },
              dietaryPreferences: {
                type: "array",
                items: { type: "string" },
                description: "Dietary preferences or restrictions"
              },
              notes: { type: "string", description: "General account notes" }
            },
            required: ["name", "email"]
          }
        },
        {
          name: "query_menu_catalog",
          description: "Query the catering menu catalog. Supports filtering by category.",
          inputSchema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ['Birthday', 'Wedding', 'Executive', 'Other'],
                description: "Filter by menu category"
              }
            }
          }
        },
        {
          name: "query_orders",
          description: "Query catering orders. Supports filtering by status and customer.",
          inputSchema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ['Pending', 'Confirmed', 'In Prep', 'Out for Delivery', 'Completed', 'Cancelled']
              },
              customerId: { type: "string", description: "Filter by customer ID" }
            }
          }
        },
        {
          name: "create_catering_order",
          description: "Create a new catering event order. Automatically calculates pricing and generates required suppliers.",
          inputSchema: {
            type: "object",
            properties: {
              customerId: { type: "string", description: "ID of the customer from CRM" },
              eventName: { type: "string", description: "Title of the event (e.g. Apex Tech Breakfast)" },
              eventDate: { type: "string", description: "Event date in YYYY-MM-DD format" },
              eventTime: { type: "string", description: "Delivery time (e.g. 08:30 AM)" },
              guestCount: { type: "number", description: "Number of guests" },
              deliveryAddress: { type: "string", description: "Delivery address (defaults to customer's address if not provided)" },
              items: {
                type: "array",
                description: "List of menu items and quantities",
                items: {
                  type: "object",
                  properties: {
                    menuItemId: { type: "string" },
                    quantity: { type: "number" }
                  },
                  required: ["menuItemId", "quantity"]
                }
              },
              deliveryFee: { type: "number", default: 35.00, description: "Delivery fee" },
              dietaryNotes: { type: "string", description: "Dietary & Special Instructions" },
              internalNotes: { type: "string", description: "Internal Bakery Kitchen Prep Notes" }
            },
            required: ["customerId", "eventName", "eventDate", "eventTime", "guestCount", "items"]
          }
        },
        {
          name: "update_client",
          description: "Update details of an existing client in the CRM.",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "ID of the client to update" },
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              company: { type: "string" },
              segment: {
                type: "string",
                enum: ['Corporate Tech', 'Weddings & Celebrations', 'Small Business', 'Educational / Non-Profit', 'VIP Private']
              },
              status: {
                type: "string",
                enum: ['Active Recurring', 'Regular Client', 'New Lead', 'Inactive']
              },
              deliveryAddress: { type: "string" },
              dietaryPreferences: {
                type: "array",
                items: { type: "string" }
              },
              notes: { type: "string" }
            },
            required: ["id"]
          }
        },
        {
          name: "update_catering_order",
          description: "Update details of an existing catering order. Recalculates prices and suppliers if items or date are changed.",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "ID of the order to update" },
              eventName: { type: "string" },
              eventDate: { type: "string", description: "Event date in YYYY-MM-DD format" },
              eventTime: { type: "string" },
              guestCount: { type: "number" },
              deliveryAddress: { type: "string" },
              status: {
                type: "string",
                enum: ['Pending', 'Confirmed', 'In Prep', 'Out for Delivery', 'Completed', 'Cancelled']
              },
              paymentStatus: {
                type: "string",
                enum: ['Paid', 'Deposit Paid', 'Invoice Pending', 'Overdue']
              },
              items: {
                type: "array",
                description: "Updated list of menu items and quantities",
                items: {
                  type: "object",
                  properties: {
                    menuItemId: { type: "string" },
                    quantity: { type: "number" }
                  },
                  required: ["menuItemId", "quantity"]
                }
              },
              deliveryFee: { type: "number" },
              dietaryNotes: { type: "string" },
              internalNotes: { type: "string" }
            },
            required: ["id"]
          }
        }
      ]
    };
  });

  // Handle Tool Calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    console.error(`[INFO] Tool called: ${name} with args: ${JSON.stringify(args)}`);

    try {
      switch (name) {
        case "query_clients": {
          let sql = 'SELECT * FROM customers WHERE 1=1';
          const params = [];
          if (args.segment) {
            sql += ' AND segment = ?';
            params.push(args.segment);
          }
          if (args.search) {
            sql += ' AND (name LIKE ? OR company LIKE ? OR email LIKE ?)';
            const searchParam = `%${args.search}%`;
            params.push(searchParam, searchParam, searchParam);
          }
          const rows = await dbAll(sql, params);
          const customers = rows.map((row) => ({
            ...row,
            dietaryPreferences: row.dietaryPreferences || [],
            activityLog: row.activityLog || [],
          }));
          return { content: [{ type: "text", text: JSON.stringify(customers, null, 2) }] };
        }

        case "add_client": {
          const id = `cust-${Date.now()}`;
          const createdDate = new Date().toISOString().split('T')[0];
          const avatarColors = ['bg-[#8C9B7A]', 'bg-[#C68B5C]', 'bg-[#5C7882]'];
          const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
          
          const initialActivity = [
            {
              id: `act-${Date.now()}`,
              date: createdDate,
              author: 'MCP Server',
              text: 'Created new client profile via MCP.',
              type: 'Note'
            }
          ];

          const sql = `INSERT INTO customers (
            id, name, company, email, phone, segment, status, deliveryAddress, dietaryPreferences, notes, createdDate, avatarColor, activityLog
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          await dbRun(sql, [
            id,
            args.name,
            args.company || null,
            args.email,
            args.phone || null,
            args.segment || 'Corporate Tech',
            args.status || 'New Lead',
            args.deliveryAddress || null,
            JSON.stringify(args.dietaryPreferences || []),
            args.notes || null,
            createdDate,
            avatarColor,
            JSON.stringify(initialActivity)
          ]);

          const newCustomer = await dbGet('SELECT * FROM customers WHERE id = ?', [id]);
          newCustomer.dietaryPreferences = newCustomer.dietaryPreferences || [];
          newCustomer.activityLog = newCustomer.activityLog || [];

          return { content: [{ type: "text", text: JSON.stringify(newCustomer, null, 2) }] };
        }

        case "query_menu_catalog": {
          let sql = 'SELECT * FROM menu_items WHERE 1=1';
          const params = [];
          if (args.category) {
            sql += ' AND category = ?';
            params.push(args.category);
          }
          const rows = await dbAll(sql, params);
          const menu = rows.map((row) => ({
            ...row,
            dietaryTags: row.dietaryTags || [],
            supplierIds: row.supplierIds || [],
          }));
          return { content: [{ type: "text", text: JSON.stringify(menu, null, 2) }] };
        }

        case "query_orders": {
          let sql = 'SELECT * FROM orders WHERE 1=1';
          const params = [];
          if (args.status) {
            sql += ' AND status = ?';
            params.push(args.status);
          }
          if (args.customerId) {
            sql += ' AND customerId = ?';
            params.push(args.customerId);
          }
          const rows = await dbAll(sql, params);
          const orders = rows.map((row) => ({
            ...row,
            items: row.items || [],
            requiredSuppliers: row.requiredSuppliers || [],
          }));
          return { content: [{ type: "text", text: JSON.stringify(orders, null, 2) }] };
        }

        case "create_catering_order": {
          const customer = await dbGet('SELECT * FROM customers WHERE id = ?', [args.customerId]);
          if (!customer) {
            throw new Error(`Customer with ID ${args.customerId} not found`);
          }

          const menuItems = await dbAll('SELECT * FROM menu_items');
          const suppliers = await dbAll('SELECT * FROM suppliers');

          const lineItems = [];
          let subtotal = 0;
          const supplierMap = new Map();

          for (const item of args.items) {
            const menuObj = menuItems.find(m => m.id === item.menuItemId);
            if (!menuObj) {
              throw new Error(`Menu item with ID ${item.menuItemId} not found`);
            }
            const price = menuObj.price;
            const qty = item.quantity;
            const itemTotal = price * qty;
            subtotal += itemTotal;

          lineItems.push({
              menuItemId: menuObj.id,
              menuItemName: menuObj.name,
              quantity: qty,
              unitPrice: price,
              totalPrice: itemTotal
            });

            const menuObjSupplierIds = menuObj.supplierIds || [];
            menuObjSupplierIds.forEach(supId => {
              const supObj = suppliers.find(s => s.id === supId);
              if (supObj && !supplierMap.has(supId)) {
                supplierMap.set(supId, {
                  supplierId: supObj.id,
                  supplierName: supObj.name,
                  ingredientOrItem: `${supObj.category} Supplies`,
                  procurementStatus: 'Procured',
                  requiredByDate: args.eventDate
                });
              }
            });
          }

          const tax = Number((subtotal * TAX_RATE).toFixed(2));
          const deliveryFee = args.deliveryFee !== undefined ? args.deliveryFee : DEFAULT_DELIVERY_FEE;
          const totalAmount = Number((subtotal + tax + deliveryFee).toFixed(2));
          const currentYear = new Date().getFullYear();
          const orderNumber = `CYM-${currentYear}-${Math.floor(800 + Math.random() * 100)}`;
          const orderId = `ord-${Date.now()}`;
          const createdDate = new Date().toISOString().split('T')[0];
          const requiredSuppliers = Array.from(supplierMap.values());

          const sql = `INSERT INTO orders (
            id, orderNumber, customerId, customerName, companyName, eventName, eventDate, eventTime, guestCount, deliveryAddress, status, paymentStatus, items, subtotal, tax, deliveryFee, totalAmount, dietaryNotes, internalNotes, requiredSuppliers, createdDate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          await dbRun(sql, [
            orderId,
            orderNumber,
            args.customerId,
            customer.name,
            customer.company || null,
            args.eventName,
            args.eventDate,
            args.eventTime,
            args.guestCount,
            args.deliveryAddress || customer.deliveryAddress || '',
            'Confirmed',
            'Invoice Pending',
            JSON.stringify(lineItems),
            subtotal,
            tax,
            deliveryFee,
            totalAmount,
            args.dietaryNotes || null,
            args.internalNotes || null,
            JSON.stringify(requiredSuppliers),
            createdDate
          ]);

          const newOrder = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);
          newOrder.items = newOrder.items || [];
          newOrder.requiredSuppliers = newOrder.requiredSuppliers || [];

          return { content: [{ type: "text", text: JSON.stringify(newOrder, null, 2) }] };
        }
        
        case "update_client": {
          const { id, ...updates } = args;
          
          const existing = await dbGet('SELECT * FROM customers WHERE id = ?', [id]);
          if (!existing) {
            throw new Error(`Client with ID ${id} not found`);
          }

          const name = updates.name !== undefined ? updates.name : existing.name;
          const email = updates.email !== undefined ? updates.email : existing.email;
          const phone = updates.phone !== undefined ? updates.phone : existing.phone;
          const company = updates.company !== undefined ? updates.company : existing.company;
          const segment = updates.segment !== undefined ? updates.segment : existing.segment;
          const status = updates.status !== undefined ? updates.status : existing.status;
          const deliveryAddress = updates.deliveryAddress !== undefined ? updates.deliveryAddress : existing.deliveryAddress;
          
          let dietaryPreferences = existing.dietaryPreferences || [];
          if (updates.dietaryPreferences !== undefined) {
            dietaryPreferences = updates.dietaryPreferences;
          }

          const notes = updates.notes !== undefined ? updates.notes : existing.notes;
          
          const activityLog = existing.activityLog || [];
          activityLog.push({
            id: `act-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            author: 'MCP Server',
            text: `Updated profile details: ${Object.keys(updates).join(', ')}`,
            type: 'Note'
          });

          const sql = `UPDATE customers SET
            name = ?, email = ?, phone = ?, company = ?, segment = ?, status = ?, deliveryAddress = ?, dietaryPreferences = ?, notes = ?, activityLog = ?
            WHERE id = ?`;
          
          await dbRun(sql, [
            name, email, phone, company, segment, status, deliveryAddress, 
            JSON.stringify(dietaryPreferences), notes, JSON.stringify(activityLog), id
          ]);

          const updatedCustomer = await dbGet('SELECT * FROM customers WHERE id = ?', [id]);
          updatedCustomer.dietaryPreferences = updatedCustomer.dietaryPreferences || [];
          updatedCustomer.activityLog = updatedCustomer.activityLog || [];

          return { content: [{ type: "text", text: JSON.stringify(updatedCustomer, null, 2) }] };
        }

        case "update_catering_order": {
          const { id, ...updates } = args;

          const existing = await dbGet('SELECT * FROM orders WHERE id = ?', [id]);
          if (!existing) {
            throw new Error(`Order with ID ${id} not found`);
          }

          const eventName = updates.eventName !== undefined ? updates.eventName : existing.eventName;
          const eventDate = updates.eventDate !== undefined ? updates.eventDate : existing.eventDate;
          const eventTime = updates.eventTime !== undefined ? updates.eventTime : existing.eventTime;
          const guestCount = updates.guestCount !== undefined ? updates.guestCount : existing.guestCount;
          const deliveryAddress = updates.deliveryAddress !== undefined ? updates.deliveryAddress : existing.deliveryAddress;
          const status = updates.status !== undefined ? updates.status : existing.status;
          const paymentStatus = updates.paymentStatus !== undefined ? updates.paymentStatus : existing.paymentStatus;
          const deliveryFee = updates.deliveryFee !== undefined ? updates.deliveryFee : existing.deliveryFee;
          const dietaryNotes = updates.dietaryNotes !== undefined ? updates.dietaryNotes : existing.dietaryNotes;
          const internalNotes = updates.internalNotes !== undefined ? updates.internalNotes : existing.internalNotes;

          let items = existing.items || [];
          let subtotal = existing.subtotal;
          let tax = existing.tax;
          let totalAmount = existing.totalAmount;
          let requiredSuppliers = existing.requiredSuppliers || [];

          if (updates.items !== undefined) {
            const menuItems = await dbAll('SELECT * FROM menu_items');
            const suppliers = await dbAll('SELECT * FROM suppliers');

            const lineItems = [];
            subtotal = 0;
            const supplierMap = new Map();

            for (const item of updates.items) {
              const menuObj = menuItems.find(m => m.id === item.menuItemId);
              if (!menuObj) {
                throw new Error(`Menu item with ID ${item.menuItemId} not found`);
              }
              const price = menuObj.price;
              const qty = item.quantity;
              const itemTotal = price * qty;
              subtotal += itemTotal;

              lineItems.push({
                menuItemId: menuObj.id,
                menuItemName: menuObj.name,
                quantity: qty,
                unitPrice: price,
                totalPrice: itemTotal
              });

              const menuObjSupplierIds = menuObj.supplierIds || [];
              menuObjSupplierIds.forEach(supId => {
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

            items = lineItems;
            tax = Number((subtotal * TAX_RATE).toFixed(2));
            totalAmount = Number((subtotal + tax + deliveryFee).toFixed(2));
            requiredSuppliers = Array.from(supplierMap.values());
          } else if (updates.eventDate !== undefined && updates.eventDate !== existing.eventDate) {
            requiredSuppliers = requiredSuppliers.map(sup => ({
              ...sup,
              requiredByDate: updates.eventDate
            }));
          }

          const sql = `UPDATE orders SET
            eventName = ?, eventDate = ?, eventTime = ?, guestCount = ?, deliveryAddress = ?, status = ?, paymentStatus = ?, items = ?, subtotal = ?, tax = ?, deliveryFee = ?, totalAmount = ?, dietaryNotes = ?, internalNotes = ?, requiredSuppliers = ?
            WHERE id = ?`;

          await dbRun(sql, [
            eventName,
            eventDate,
            eventTime,
            guestCount,
            deliveryAddress,
            status,
            paymentStatus,
            JSON.stringify(items),
            subtotal,
            tax,
            deliveryFee,
            totalAmount,
            dietaryNotes,
            internalNotes,
            JSON.stringify(requiredSuppliers),
            id
          ]);

          const updatedOrder = await dbGet('SELECT * FROM orders WHERE id = ?', [id]);
          updatedOrder.items = updatedOrder.items || [];
          updatedOrder.requiredSuppliers = updatedOrder.requiredSuppliers || [];

          return { content: [{ type: "text", text: JSON.stringify(updatedOrder, null, 2) }] };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      console.error(`[ERROR] Error executing tool ${name}:`, error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  });

  return server;
}

// ==========================================
// STREAMABLE HTTP TRANSPORT CONFIGURATION
// ==========================================

const transports = {};

app.all('/mcp', async (req, res) => {
  console.error(`[HTTP] Received ${req.method} request to /mcp`);
  try {
    const sessionId = req.headers['mcp-session-id'];
    let transport;

    if (sessionId && transports[sessionId]) {
      const existingTransport = transports[sessionId];
      if (existingTransport instanceof StreamableHTTPServerTransport) {
        transport = existingTransport;
      } else {
        res.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Bad Request: Session exists but uses a different transport protocol' },
          id: null
        });
        return;
      }
    } else if (!sessionId && req.method === 'POST' && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          console.error(`[HTTP] StreamableHTTP session initialized with ID: ${sid}`);
          transports[sid] = transport;
        }
      });

      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          console.error(`[HTTP] Transport closed for session ${sid}, removing from transports map`);
          delete transports[sid];
        }
      };

      // Create a fresh server instance specifically for this session
      const sessionServer = createMcpServer();
      await sessionServer.connect(transport);
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Bad Request: No valid session ID or not initialization request' },
        id: null
      });
      return;
    }

    // Delegate handling to the transport
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('[HTTP ERROR] Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null
      });
    }
  }
});

// Start Server
app.listen(PORT, () => {
  console.error(`[Server] Cymbal Catering MCP Server running on port ${PORT}`);
  console.error(`[Server] Streamable HTTP Endpoint: http://localhost:${PORT}/mcp`);
});

// Handle Server Shutdown
process.on('SIGINT', async () => {
  console.error('Shutting down server...');
  for (const sessionId in transports) {
    try {
      console.error(`Closing transport for session ${sessionId}`);
      await transports[sessionId].close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
  console.error('Server shutdown complete');
  process.exit(0);
});
