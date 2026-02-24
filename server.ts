import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    category TEXT,
    stock INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_address TEXT,
    payment_intent_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS artwork_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    postal_code TEXT,
    style TEXT NOT NULL,
    size TEXT NOT NULL,
    notes TEXT,
    quantity INTEGER DEFAULT 1,
    original_image_url TEXT,
    reference_image_url TEXT,
    status TEXT DEFAULT 'pending',
    final_artwork_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed initial products if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare("INSERT INTO products (title, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)");
  insertProduct.run("Alpine Serenity", "Breathtaking mountain landscape at dawn.", 49.99, "https://picsum.photos/seed/alpine/800/600", "Nature");
  insertProduct.run("Urban Pulse", "The vibrant energy of a neon-lit city street.", 39.99, "https://picsum.photos/seed/urban/800/600", "Travel");
  insertProduct.run("Golden Hour Portrait", "Warm tones and soft lighting in a classic portrait.", 59.99, "https://picsum.photos/seed/portrait/800/600", "Portrait");
  insertProduct.run("Abstract Flow", "Fluid shapes and colors that inspire the mind.", 29.99, "https://picsum.photos/seed/abstract/800/600", "Abstract");
}

// Seed admin user if not exists
const adminEmail = "admin@personaltouch.com";
const adminExists = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run("Admin User", adminEmail, hashedPassword, "admin");
}

const app = express();
app.use(express.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Auth Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
};

// --- API Routes ---

// Auth
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, hashedPassword);
    const token = jwt.sign({ id: result.lastInsertRowid, email, role: "customer" }, JWT_SECRET);
    res.json({ token, user: { id: result.lastInsertRowid, name, email, role: "customer" } });
  } catch (err: any) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Products
app.get("/api/products", (req, res) => {
  const products = db.prepare("SELECT * FROM products").all();
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  res.json(product);
});

// Orders
app.post("/api/orders", authenticate, async (req: any, res) => {
  const { items, total_amount, shipping_address } = req.body;
  const userId = req.user.id;

  const transaction = db.transaction(() => {
    const orderResult = db.prepare("INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)").run(userId, total_amount, shipping_address);
    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    for (const item of items) {
      insertItem.run(orderId, item.id, item.quantity, item.price);
    }
    return orderId;
  });

  const orderId = transaction();
  res.json({ orderId, message: "Order placed successfully" });
});

app.get("/api/orders/my", authenticate, (req: any, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  res.json(orders);
});

// Artwork Requests
app.post("/api/artwork/request", upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'reference', maxCount: 1 }]), (req: any, res) => {
  const { full_name, email, phone, address, postal_code, style, size, notes, quantity, user_id } = req.body;
  const photo = req.files['photo']?.[0];
  const reference = req.files['reference']?.[0];

  const result = db.prepare(`
    INSERT INTO artwork_requests 
    (user_id, full_name, email, phone, address, postal_code, style, size, notes, quantity, original_image_url, reference_image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    user_id || null, 
    full_name, 
    email, 
    phone, 
    address, 
    postal_code, 
    style, 
    size, 
    notes, 
    quantity, 
    photo ? `/uploads/${photo.filename}` : null,
    reference ? `/uploads/${reference.filename}` : null
  );

  res.json({ id: result.lastInsertRowid, message: "Artwork request submitted" });
});

app.get("/api/artwork/my", authenticate, (req: any, res) => {
  const requests = db.prepare("SELECT * FROM artwork_requests WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  res.json(requests);
});

// --- Admin Routes ---
app.get("/api/admin/orders", authenticate, isAdmin, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, u.name as customer_name, u.email as customer_email 
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    ORDER BY o.created_at DESC
  `).all();
  res.json(orders);
});

app.get("/api/admin/artwork-requests", authenticate, isAdmin, (req, res) => {
  const requests = db.prepare("SELECT * FROM artwork_requests ORDER BY created_at DESC").all();
  res.json(requests);
});

app.patch("/api/admin/artwork-requests/:id", authenticate, isAdmin, upload.single('final_artwork'), (req: any, res) => {
  const { status } = req.body;
  const finalArtwork = req.file;
  
  if (finalArtwork) {
    db.prepare("UPDATE artwork_requests SET status = ?, final_artwork_url = ? WHERE id = ?").run(status, `/uploads/${finalArtwork.filename}`, req.params.id);
  } else {
    db.prepare("UPDATE artwork_requests SET status = ? WHERE id = ?").run(status, req.params.id);
  }
  res.json({ message: "Request updated" });
});

app.get("/api/admin/stats", authenticate, isAdmin, (req, res) => {
  const totalSales = db.prepare("SELECT SUM(total_amount) as total FROM orders").get() as any;
  const orderCount = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get() as any;
  const artworkCount = db.prepare("SELECT COUNT(*) as count FROM artwork_requests").get() as any;
  
  res.json({
    totalSales: totalSales.total || 0,
    orderCount: orderCount.count,
    userCount: userCount.count,
    artworkCount: artworkCount.count
  });
});

// --- Vite Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
