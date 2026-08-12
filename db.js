import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration via environment variables (GCP Best Practice)

const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'cymbal',
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };

console.error(`[DB] Connecting to PostgreSQL database...`);

const pool = new Pool(poolConfig);

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('[DB ERROR] Failed to connect to PostgreSQL database:', err.message);
  } else {
    console.error('[DB INFO] Successfully connected to PostgreSQL database.');
  }
});

/**
 * Map of lowercase PostgreSQL column names to camelCase JS property names.
 */
const KEY_MAP = {
  deliveryaddress: 'deliveryAddress',
  dietarypreferences: 'dietaryPreferences',
  createddate: 'createdDate',
  avatarcolor: 'avatarColor',
  activitylog: 'activityLog',
  ordernumber: 'orderNumber',
  customerid: 'customerId',
  customername: 'customerName',
  companyname: 'companyName',
  eventname: 'eventName',
  eventdate: 'eventDate',
  eventtime: 'eventTime',
  guestcount: 'guestCount',
  paymentstatus: 'paymentStatus',
  totalamount: 'totalAmount',
  deliveryfee: 'deliveryFee',
  dietarynotes: 'dietaryNotes',
  internalnotes: 'internalNotes',
  requiredsuppliers: 'requiredSuppliers',
  dietarytags: 'dietaryTags',
  supplierids: 'supplierIds',
  leadtimehours: 'leadTimeHours',
  contactperson: 'contactPerson',
  leadtimedays: 'leadTimeDays'
};

/**
 * Recursively converts object keys from lowercase database columns to camelCase.
 */
function keysToCamel(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(keysToCamel);
  
  const n = {};
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const camelKey = KEY_MAP[k] || k;
      n[camelKey] = keysToCamel(obj[k]);
    }
  }
  return n;
}

/**
 * Helper to convert SQLite '?' placeholders to PostgreSQL '$1', '$2', etc.
 * This allows us to keep the existing queries in server.js and mcp server unchanged.
 */
function convertPlaceholders(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

/**
 * Executes a SQL query (INSERT, UPDATE, DELETE) and returns a Promise.
 */
const dbRun = async (sql, params = []) => {
  const pgSql = convertPlaceholders(sql);
  const res = await pool.query(pgSql, params);
  return { 
    lastID: null, 
    changes: res.rowCount 
  };
};

/**
 * Executes a SQL query that returns a single row.
 */
const dbGet = async (sql, params = []) => {
  const pgSql = convertPlaceholders(sql);
  const res = await pool.query(pgSql, params);
  return keysToCamel(res.rows[0]) || null;
};

/**
 * Executes a SQL query that returns all matching rows.
 */
const dbAll = async (sql, params = []) => {
  const pgSql = convertPlaceholders(sql);
  const res = await pool.query(pgSql, params);
  return keysToCamel(res.rows) || [];
};

// Initial mock data for suppliers
const INITIAL_SUPPLIERS = [
  {
    id: 'sup-1',
    name: 'Golden Grain Mills',
    category: 'Flour & Grains',
    contactPerson: 'Marcus Vance',
    email: 'marcus@goldengrain.com',
    phone: '(415) 555-0192',
    leadTimeDays: 2,
    rating: 4.9,
    notes: 'Organic stone-ground flour & French pastry flour.'
  },
  {
    id: 'sup-2',
    name: 'Sweet Valley Dairy',
    category: 'Dairy & Eggs',
    contactPerson: 'Elena Rostova',
    email: 'elena@sweetvalleydairy.com',
    phone: '(707) 555-0144',
    leadTimeDays: 1,
    rating: 4.8,
    notes: 'Grade-A European style cultured butter & pasture-raised eggs.'
  },
  {
    id: 'sup-3',
    name: 'Bay Area Organic Produce',
    category: 'Fresh Produce & Fruits',
    contactPerson: 'David Chen',
    email: 'dchen@bayorganics.com',
    phone: '(510) 555-0833',
    leadTimeDays: 1,
    rating: 4.7,
    notes: 'Local organic berries, avocados, microgreens & seasonal fruit.'
  },
  {
    id: 'sup-4',
    name: 'EcoPack Bakery Solutions',
    category: 'Packaging & Boxes',
    contactPerson: 'Sarah Lin',
    email: 'orders@ecopack.io',
    phone: '(415) 555-0921',
    leadTimeDays: 3,
    rating: 4.9,
    notes: 'Magnetic-closure gift boxes, gold foil wraps & velvet catering trays.'
  },
  {
    id: 'sup-5',
    name: 'Roastmaster Coffee & Tea',
    category: 'Coffee & Teas',
    contactPerson: 'Julian Thorne',
    email: 'julian@roastmasterco.com',
    phone: '(415) 555-0377',
    leadTimeDays: 2,
    rating: 5.0,
    notes: 'Single-origin espresso beans, micro-lot reserve coffees & porcelain setups.'
  }
];

const INITIAL_MENU_ITEMS = [
  {
    id: 'menu-1',
    name: 'Birthday',
    category: 'Birthday',
    description: 'Birthday celebration menu package.',
    price: 400.00,
    servings: '10-20 guests',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['Sweet'],
    supplierIds: ['sup-1', 'sup-2'],
    leadTimeHours: 24
  },
  {
    id: 'menu-2',
    name: 'Wedding',
    category: 'Wedding',
    description: 'Wedding celebration menu package.',
    price: 1000.00,
    servings: '10-20 guests',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['Elegant'],
    supplierIds: ['sup-1', 'sup-2', 'sup-4'],
    leadTimeHours: 48
  },
  {
    id: 'menu-3',
    name: 'Executive',
    category: 'Executive',
    description: 'Executive corporate event menu package.',
    price: 750.00,
    servings: '10-20 guests',
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=600&q=80',
    dietaryTags: ['Premium'],
    supplierIds: ['sup-1', 'sup-2', 'sup-5'],
    leadTimeHours: 24
  }
];

/**
 * Initializes the database tables and seeds data if empty.
 */
async function initDb() {
  console.error('[DB INFO] Initializing PostgreSQL database schema...');
  try {
    // Create Customers Table (dietaryPreferences and activityLog as JSONB)
    await dbRun(`CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      segment TEXT,
      status TEXT,
      deliveryAddress TEXT,
      dietaryPreferences JSONB, 
      notes TEXT,
      createdDate TEXT,
      avatarColor TEXT,
      activityLog JSONB 
    )`);

    // Create Menu Items Table (dietaryTags and supplierIds as JSONB)
    await dbRun(`CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      description TEXT,
      price REAL,
      servings TEXT,
      image TEXT,
      dietaryTags JSONB, 
      supplierIds JSONB, 
      leadTimeHours INTEGER
    )`);

    // Seed menu items if empty
    const menuCount = await dbGet('SELECT COUNT(*) as count FROM menu_items');
    if (menuCount && parseInt(menuCount.count) === 0) {
      console.error('[DB INFO] Seeding initial menu items...');
      for (const item of INITIAL_MENU_ITEMS) {
        await dbRun(`INSERT INTO menu_items (
          id, name, category, description, price, servings, image, dietaryTags, supplierIds, leadTimeHours
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
          item.id, item.name, item.category, item.description, item.price, item.servings, item.image, 
          JSON.stringify(item.dietaryTags), 
          JSON.stringify(item.supplierIds), 
          item.leadTimeHours
        ]);
      }
    }

    // Create Suppliers Table
    await dbRun(`CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      contactPerson TEXT,
      email TEXT,
      phone TEXT,
      leadTimeDays INTEGER,
      rating REAL,
      notes TEXT
    )`);

    // Seed suppliers if empty
    const supCount = await dbGet('SELECT COUNT(*) as count FROM suppliers');
    if (supCount && parseInt(supCount.count) === 0) {
      console.error('[DB INFO] Seeding initial suppliers...');
      for (const sup of INITIAL_SUPPLIERS) {
        await dbRun(`INSERT INTO suppliers (
          id, name, category, contactPerson, email, phone, leadTimeDays, rating, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
          sup.id, sup.name, sup.category, sup.contactPerson, sup.email, sup.phone, sup.leadTimeDays, sup.rating, sup.notes
        ]);
      }
    }

    // Create Orders Table (items and requiredSuppliers as JSONB)
    await dbRun(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      orderNumber TEXT UNIQUE NOT NULL,
      customerId TEXT,
      customerName TEXT,
      companyName TEXT,
      eventName TEXT,
      eventDate TEXT,
      eventTime TEXT,
      guestCount INTEGER,
      deliveryAddress TEXT,
      status TEXT,
      paymentStatus TEXT,
      items JSONB, 
      subtotal REAL,
      tax REAL,
      deliveryFee REAL,
      totalAmount REAL,
      dietaryNotes TEXT,
      internalNotes TEXT,
      requiredSuppliers JSONB, 
      createdDate TEXT
    )`);

    console.error('[DB INFO] Database initialization complete.');
  } catch (err) {
    console.error('[DB FATAL] Database initialization failed:', err);
    throw err;
  }
}

export {
  pool as db, 
  dbRun,
  dbGet,
  dbAll,
  initDb
};
